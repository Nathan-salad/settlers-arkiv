import { create } from 'zustand'
import { consumeResources } from '../utils/resourceConsumption'
import { rollDice as rollDiceAPI, endTurn as endTurnAPI } from '../api/apiClient'

const useGameStore = create((set, get) => ({
  // Game state
  gameId: '',
  roomCode: '',
  localPlayerId: '1', // ID of the player on this device
  players: [
    { id: '1', name: 'Player 1', score: 0, turnsCompleted: 0 },
    { id: '2', name: 'Player 2', score: 0, turnsCompleted: 0 },
    { id: '3', name: 'Player 3', score: 0, turnsCompleted: 0 },
    { id: '4', name: 'Player 4', score: 0, turnsCompleted: 0 },
  ],
  currentPlayerId: '1',
  turnNumber: 1,
  rollCount: 0,
  maxRolls: 3,
  victoryPointGoal: 10, // Island Two: First to 10 VP wins
  dice: [
    { value: 1, locked: false, used: false },
    { value: 2, locked: false, used: false },
    { value: 3, locked: false, used: false },
    { value: 4, locked: false, used: false },
    { value: 5, locked: false, used: false },
    { value: 6, locked: false, used: false },
  ],
  hasBuilt: false, // Track if player has built this turn
  status: 'in_progress', // 'lobby' | 'in_progress' | 'finished'
  
  // Build state (tracks what's been built)
  builds: {
    roads: 0,
    settlements: 0,
    cities: 0,
    knights: 0,
  },
  
  // Special victory point bonuses
  longestRoadHolder: null, // Player ID who has Longest Road (5+ roads, 2 VP)
  largestArmyHolder: null, // Player ID who has Largest Army (3+ knights, 2 VP)

  // Actions
  rollDice: async () => {
    const state = get()
    
    // Can't roll if already built this turn
    if (state.hasBuilt) {
      console.log('[STORE] Cannot roll - already built this turn')
      return
    }
    
    if (state.rollCount >= state.maxRolls) return
    
    // If no gameId, fall back to local random dice
    if (!state.gameId) {
      const newDice = state.dice.map(die => 
        die.locked ? die : { ...die, value: Math.floor(Math.random() * 6) + 1, used: false }
      )
      
      set({
        dice: newDice,
        rollCount: state.rollCount + 1
      })
      return
    }
    
    try {
      // Get held dice values (locked dice)
      const heldDice = state.dice
        .filter(die => die.locked)
        .map(die => die.value)
      
      // Call API to roll dice
      const gameState = await rollDiceAPI(state.gameId, heldDice)
      
      // Extract dice from currentTurn based on roll number
      let diceRolled = []
      let diceHeld = []
      
      if (gameState.currentTurn?.thirdRoll) {
        diceRolled = gameState.currentTurn.thirdRoll.diceRolled || []
        diceHeld = gameState.currentTurn.thirdRoll.diceHeld || []
      } else if (gameState.currentTurn?.secondRoll) {
        diceRolled = gameState.currentTurn.secondRoll.diceRolled || []
        diceHeld = gameState.currentTurn.secondRoll.diceHeld || []
      } else if (gameState.currentTurn?.firstRoll) {
        diceRolled = gameState.currentTurn.firstRoll.diceRolled || []
      }
      
      // Combine held and rolled dice
      const allDiceValues = [...diceHeld, ...diceRolled]
      
      // Update dice state, preserving locked status
      const newDice = allDiceValues.map((value, index) => ({
        value,
        locked: index < diceHeld.length, // First N dice are locked (held)
        used: false
      }))
      
      set({
        dice: newDice,
        rollCount: state.rollCount + 1
      })
    } catch (error) {
      console.error('[STORE] Error rolling dice:', error)
      // Fall back to local random on error
      const newDice = state.dice.map(die => 
        die.locked ? die : { ...die, value: Math.floor(Math.random() * 6) + 1, used: false }
      )
      
      set({
        dice: newDice,
        rollCount: state.rollCount + 1
      })
    }
  },

  toggleLock: (index) => set((state) => ({
    dice: state.dice.map((die, i) => 
      i === index ? { ...die, locked: !die.locked } : die
    )
  })),

  performBuild: (buildType, requiredResources) => set((state) => {
    // Check max limits per Catan rules
    const maxLimits = {
      roads: 15,
      settlements: 5,
      cities: 4,
      knights: 14
    }
    
    // Get CURRENT PLAYER's individual build count
    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
    const currentCount = currentPlayer[buildType] || 0
    const maxAllowed = maxLimits[buildType] || 999
    
    console.log(`[STORE] Attempting to build ${buildType}: current=${currentCount}, max=${maxAllowed}`)
    
    // Prevent building beyond max
    if (currentCount >= maxAllowed) {
      console.log(`[STORE] BLOCKED: Max limit reached for ${buildType}`)
      return state // No change if at max
    }
    
    // Calculate new build counts for CURRENT PLAYER only
    const newBuilds = {
      roads: buildType === 'roads' ? currentCount + 1 : (currentPlayer.roads || 0),
      settlements: buildType === 'settlements' ? currentCount + 1 : (currentPlayer.settlements || 0),
      cities: buildType === 'cities' ? currentCount + 1 : (currentPlayer.cities || 0),
      knights: buildType === 'knights' ? currentCount + 1 : (currentPlayer.knights || 0)
    }
    
    // Consume resources (mark dice as used)
    const updatedDice = consumeResources(state.dice, requiredResources)
    
    // Calculate score based on Island Two rules
    // Settlements: 1 VP each, Cities: 2 VP each
    // Roads and Knights: 0 VP individually (bonuses calculated separately)
    const baseScore = (newBuilds.settlements * 1) + (newBuilds.cities * 2)
    
    // Check for Longest Road (5+ roads, 2 VP bonus)
    let newLongestRoadHolder = state.longestRoadHolder
    if (newBuilds.roads >= 5) {
      // Current player has 5+ roads
      if (!newLongestRoadHolder) {
        // No one has it yet, current player gets it
        newLongestRoadHolder = state.currentPlayerId
      } else if (newLongestRoadHolder !== state.currentPlayerId) {
        // Someone else has it, check if current player has more
        const holderRoads = state.players.find(p => p.id === newLongestRoadHolder)?.roads || 0
        if (newBuilds.roads > holderRoads) {
          newLongestRoadHolder = state.currentPlayerId
        }
      }
    }
    
    // Check for Largest Army (3+ knights, 2 VP bonus)
    let newLargestArmyHolder = state.largestArmyHolder
    if (newBuilds.knights >= 3) {
      // Current player has 3+ knights
      if (!newLargestArmyHolder) {
        // No one has it yet, current player gets it
        newLargestArmyHolder = state.currentPlayerId
      } else if (newLargestArmyHolder !== state.currentPlayerId) {
        // Someone else has it, check if current player has more
        const holderKnights = state.players.find(p => p.id === newLargestArmyHolder)?.knights || 0
        if (newBuilds.knights > holderKnights) {
          newLargestArmyHolder = state.currentPlayerId
        }
      }
    }
    
    // Update only the current player's builds and recalculate their score
    const updatedPlayers = state.players.map(player => {
      if (player.id === state.currentPlayerId) {
        // Update current player's builds
        let playerScore = (newBuilds.settlements * 1) + (newBuilds.cities * 2)
        
        // Add bonuses
        if (newLongestRoadHolder === player.id) playerScore += 2
        if (newLargestArmyHolder === player.id) playerScore += 2
        
        return {
          ...player,
          score: playerScore,
          roads: newBuilds.roads,
          settlements: newBuilds.settlements,
          cities: newBuilds.cities,
          knights: newBuilds.knights
        }
      } else {
        // For other players, only update their score if bonus holders changed
        if (newLongestRoadHolder !== state.longestRoadHolder || newLargestArmyHolder !== state.largestArmyHolder) {
          // Recalculate their score with new bonus holders
          let playerScore = ((player.settlements || 0) * 1) + ((player.cities || 0) * 2)
          if (newLongestRoadHolder === player.id) playerScore += 2
          if (newLargestArmyHolder === player.id) playerScore += 2
          
          return {
            ...player,
            score: playerScore
          }
        }
        // No changes for this player
        return player
      }
    })
    
    console.log(`[STORE] Build complete, resources consumed, dice updated, turn ending`)
    
    // Check for winner (Island Two: First to 10 VP)
    const winner = updatedPlayers.find(p => p.score >= 10)
    const gameFinished = winner !== undefined
    
    if (gameFinished) {
      console.log(`[STORE] GAME OVER! ${winner.name} wins with ${winner.score} points!`)
    }
    
    return {
      players: updatedPlayers,
      dice: updatedDice,
      hasBuilt: true, // Mark that player has built (can't roll anymore)
      status: gameFinished ? 'finished' : state.status,
      longestRoadHolder: newLongestRoadHolder,
      largestArmyHolder: newLargestArmyHolder
    }
  }),

  endTurn: async () => {
    const state = get()
    
    // If no gameId, use local state only
    if (!state.gameId) {
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId)
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length
      const isLastPlayer = nextPlayerIndex === 0
      
      // Update current player's turns completed
      const updatedPlayers = state.players.map((player, idx) =>
        idx === currentPlayerIndex
          ? { ...player, turnsCompleted: player.turnsCompleted + 1 }
          : player
      )
      
      const newTurnNumber = isLastPlayer ? state.turnNumber + 1 : state.turnNumber
      
      // Check for winner (Island Two: First to 10 VP)
      const winner = updatedPlayers.find(p => p.score >= state.victoryPointGoal)
      const gameFinished = winner !== undefined
      
      if (gameFinished) {
        console.log(`[STORE] GAME OVER at end of turn! ${winner.name} wins with ${winner.score} points!`)
      }

      set({
        players: updatedPlayers,
        currentPlayerId: state.players[nextPlayerIndex].id,
        turnNumber: newTurnNumber,
        rollCount: 0,
        hasBuilt: false,
        dice: state.dice.map(die => ({ ...die, locked: false, used: false })),
        status: gameFinished ? 'finished' : 'in_progress',
      })
      return
    }
    
    // Call API for multiplayer game
    try {
      await endTurnAPI(state.gameId)
      
      // For now, still update local state
      // TODO: In full multiplayer, this would come from polling/websocket
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId)
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length
      
      set({
        currentPlayerId: state.players[nextPlayerIndex].id,
        rollCount: 0,
        hasBuilt: false,
        dice: state.dice.map(die => ({ ...die, locked: false, used: false })),
      })
    } catch (error) {
      console.error('[STORE] Error ending turn:', error)
    }
  },

  setGameId: (gameId) => set({ gameId }),

  resetGame: (playerData = []) => set({
    players: playerData.length > 0 
      ? playerData.map((player, i) => ({
          id: String(i + 1),
          name: player.name || player.playerName || `Player ${i + 1}`,
          score: 0,
          turnsCompleted: 0,
          roads: 0,
          settlements: 0,
          cities: 0,
          knights: 0,
          isBot: player.isBot || false
        }))
      : Array.from({ length: 4 }, (_, i) => ({
          id: String(i + 1),
          name: `Player ${i + 1}`,
          score: 0,
          turnsCompleted: 0,
          roads: 0,
          settlements: 0,
          cities: 0,
          knights: 0,
          isBot: false
        })),
    currentPlayerId: '1',
    turnNumber: 1,
    rollCount: 0,
    hasBuilt: false,
    maxRolls: 3,
    victoryPointGoal: 10,
    dice: [
      { value: 1, locked: false, used: false },
      { value: 2, locked: false, used: false },
      { value: 3, locked: false, used: false },
      { value: 4, locked: false, used: false },
      { value: 5, locked: false, used: false },
      { value: 6, locked: false, used: false },
    ],
    builds: {
      roads: 0,
      settlements: 0,
      cities: 0,
      knights: 0,
    },
    longestRoadHolder: null,
    largestArmyHolder: null,
    status: 'in_progress'
  })
}))

export default useGameStore
