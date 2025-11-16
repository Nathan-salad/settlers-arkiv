import { create } from 'zustand'
import { consumeResources } from '../utils/resourceConsumption'

const useGameStore = create((set) => ({
  // Game state
  roomCode: '',
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
  maxTurns: 15,
  dice: [
    { value: 1, locked: false, used: false },
    { value: 2, locked: false, used: false },
    { value: 3, locked: false, used: false },
    { value: 4, locked: false, used: false },
    { value: 5, locked: false, used: false },
    { value: 6, locked: false, used: false },
  ],
  status: 'in_progress', // 'lobby' | 'in_progress' | 'finished'
  
  // Build state (tracks what's been built)
  builds: {
    roads: 0,
    settlements: 0,
    cities: 0,
    knights: 0,
  },

  // Actions
  rollDice: () => set((state) => {
    if (state.rollCount >= state.maxRolls) return state
    
    const newDice = state.dice.map(die => 
      die.locked ? die : { ...die, value: Math.floor(Math.random() * 6) + 1, used: false }
    )
    
    return {
      dice: newDice,
      rollCount: state.rollCount + 1
    }
  }),

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
    
    const currentCount = state.builds[buildType] || 0
    const maxAllowed = maxLimits[buildType] || 999
    
    console.log(`[STORE] Attempting to build ${buildType}: current=${currentCount}, max=${maxAllowed}`)
    
    // Prevent building beyond max
    if (currentCount >= maxAllowed) {
      console.log(`[STORE] BLOCKED: Max limit reached for ${buildType}`)
      return state // No change if at max
    }
    
    const newBuilds = {
      ...state.builds,
      [buildType]: currentCount + 1
    }
    
    // Consume resources (mark dice as used)
    const updatedDice = consumeResources(state.dice, requiredResources)
    
    // Calculate score based on builds (simplified scoring)
    const scoreValues = {
      roads: 1,
      settlements: 3,
      cities: 5,
      knights: 2
    }
    
    const newScore = Object.keys(newBuilds).reduce((total, key) => {
      return total + (newBuilds[key] * (scoreValues[key] || 0))
    }, 0)
    
    // Update current player's score
    const updatedPlayers = state.players.map(player =>
      player.id === state.currentPlayerId
        ? { ...player, score: newScore }
        : player
    )
    
    console.log(`[STORE] Build complete, resources consumed, dice updated`)
    
    return {
      builds: newBuilds,
      players: updatedPlayers,
      dice: updatedDice
    }
  }),

  endTurn: () => set((state) => {
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
    const gameFinished = newTurnNumber > state.maxTurns

    return {
      players: updatedPlayers,
      currentPlayerId: state.players[nextPlayerIndex].id,
      turnNumber: newTurnNumber,
      rollCount: 0,
      dice: state.dice.map(die => ({ ...die, locked: false, used: false })),
      status: gameFinished ? 'finished' : 'in_progress',
      // Reset builds for next player (or keep cumulative - your choice)
      // builds: { roads: 0, settlements: 0, cities: 0, knights: 0 } // uncomment to reset per turn
    }
  }),

  resetGame: () => set({
    turnNumber: 1,
    rollCount: 0,
    currentPlayerId: '1',
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
    status: 'in_progress'
  })
}))

export default useGameStore
