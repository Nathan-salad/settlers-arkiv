import { describe, it, expect, beforeEach, vi } from 'vitest'
import useGameStore from '../store/gameStore'

// Mock the consumeResources function
vi.mock('../utils/resourceConsumption', () => ({
  consumeResources: vi.fn((dice, required) => {
    // Simple mock: mark first N dice as used where N = required.length
    return dice.map((die, idx) => 
      idx < required.length ? { ...die, used: true } : die
    )
  })
}))

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState({
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
      victoryPointGoal: 10,
      dice: [
        { value: 1, locked: false, used: false },
        { value: 2, locked: false, used: false },
        { value: 3, locked: false, used: false },
        { value: 4, locked: false, used: false },
        { value: 5, locked: false, used: false },
        { value: 6, locked: false, used: false },
      ],
      hasBuilt: false,
      status: 'in_progress',
      builds: {
        roads: 0,
        settlements: 0,
        cities: 0,
        knights: 0,
      },
    })
  })

  describe('rollDice', () => {
    it('should increment rollCount', () => {
      const { rollDice } = useGameStore.getState()
      rollDice()

      expect(useGameStore.getState().rollCount).toBe(1)
    })

    it('should not allow more than maxRolls', () => {
      const store = useGameStore.getState()
      
      store.rollDice()
      store.rollDice()
      store.rollDice()
      
      expect(useGameStore.getState().rollCount).toBe(3)
      
      // 4th roll should not increase count
      store.rollDice()
      expect(useGameStore.getState().rollCount).toBe(3)
    })

    it('should randomize unlocked dice', () => {
      const { rollDice } = useGameStore.getState()
      const initialDice = useGameStore.getState().dice

      rollDice()

      const newDice = useGameStore.getState().dice
      
      // Values should potentially be different (can't test exact values due to randomness)
      // But we can check dice structure is maintained
      expect(newDice).toHaveLength(6)
      newDice.forEach(die => {
        expect(die.value).toBeGreaterThanOrEqual(1)
        expect(die.value).toBeLessThanOrEqual(6)
      })
    })

    it('should not randomize locked dice', () => {
      useGameStore.setState({
        dice: [
          { value: 3, locked: true, used: false },
          { value: 4, locked: false, used: false },
          { value: 5, locked: false, used: false },
          { value: 6, locked: false, used: false },
          { value: 1, locked: false, used: false },
          { value: 2, locked: false, used: false },
        ]
      })

      const { rollDice } = useGameStore.getState()
      rollDice()

      const dice = useGameStore.getState().dice
      expect(dice[0].value).toBe(3) // Locked die should keep value
      expect(dice[0].locked).toBe(true)
    })

    it('should not allow rolling after building', () => {
      useGameStore.setState({ hasBuilt: true, rollCount: 1 })

      const { rollDice } = useGameStore.getState()
      rollDice()

      // Roll count should not increase
      expect(useGameStore.getState().rollCount).toBe(1)
    })

    it('should reset used flag on unlocked dice', () => {
      useGameStore.setState({
        dice: [
          { value: 1, locked: false, used: true },
          { value: 2, locked: false, used: true },
          { value: 3, locked: false, used: false },
          { value: 4, locked: false, used: false },
          { value: 5, locked: false, used: false },
          { value: 6, locked: false, used: false },
        ]
      })

      const { rollDice } = useGameStore.getState()
      rollDice()

      const dice = useGameStore.getState().dice
      dice.forEach(die => {
        if (!die.locked) {
          expect(die.used).toBe(false)
        }
      })
    })
  })

  describe('toggleLock', () => {
    it('should toggle locked state', () => {
      const { toggleLock } = useGameStore.getState()

      toggleLock(0)
      expect(useGameStore.getState().dice[0].locked).toBe(true)

      toggleLock(0)
      expect(useGameStore.getState().dice[0].locked).toBe(false)
    })

    it('should only toggle specified die', () => {
      const { toggleLock } = useGameStore.getState()

      toggleLock(2)

      const dice = useGameStore.getState().dice
      expect(dice[0].locked).toBe(false)
      expect(dice[1].locked).toBe(false)
      expect(dice[2].locked).toBe(true)
      expect(dice[3].locked).toBe(false)
    })
  })

  describe('performBuild', () => {
    it('should increment build count', () => {
      const { performBuild } = useGameStore.getState()

      performBuild('roads', ['lumber', 'brick'])

      expect(useGameStore.getState().builds.roads).toBe(1)
    })

    it('should not exceed max build limits', () => {
      useGameStore.setState({
        builds: { roads: 15, settlements: 0, cities: 0, knights: 0 }
      })

      const { performBuild } = useGameStore.getState()
      performBuild('roads', ['lumber', 'brick'])

      // Should stay at 15
      expect(useGameStore.getState().builds.roads).toBe(15)
    })

    it('should update player score', () => {
      const { performBuild } = useGameStore.getState()

      performBuild('roads', ['lumber', 'brick']) // +1 point
      expect(useGameStore.getState().players[0].score).toBe(1)

      performBuild('settlements', ['lumber', 'brick', 'wheat', 'wool']) // +3 points
      expect(useGameStore.getState().players[0].score).toBe(4) // 1 + 3
    })

    it('should calculate score correctly for all build types', () => {
      const { performBuild } = useGameStore.getState()

      performBuild('roads', ['lumber', 'brick'])
      performBuild('settlements', ['lumber', 'brick', 'wheat', 'wool'])
      performBuild('cities', ['ore', 'ore', 'ore', 'wheat', 'wheat'])
      performBuild('knights', ['ore', 'wool', 'wheat'])

      // 1 road (1) + 1 settlement (3) + 1 city (5) + 1 knight (2) = 11
      expect(useGameStore.getState().players[0].score).toBe(11)
    })

    it('should set hasBuilt flag', () => {
      const { performBuild } = useGameStore.getState()

      performBuild('roads', ['lumber', 'brick'])

      expect(useGameStore.getState().hasBuilt).toBe(true)
    })

    it('should consume dice resources', () => {
      const { performBuild } = useGameStore.getState()

      performBuild('roads', ['lumber', 'brick'])

      // With our mock, first 2 dice should be marked as used
      const dice = useGameStore.getState().dice
      expect(dice[0].used).toBe(true)
      expect(dice[1].used).toBe(true)
    })

    it('should respect max limits for each build type', () => {
      const { performBuild } = useGameStore.getState()

      // Test roads max (15)
      useGameStore.setState({ builds: { roads: 15, settlements: 0, cities: 0, knights: 0 } })
      performBuild('roads', ['lumber', 'brick'])
      expect(useGameStore.getState().builds.roads).toBe(15)

      // Test settlements max (5)
      useGameStore.setState({ builds: { roads: 0, settlements: 5, cities: 0, knights: 0 } })
      performBuild('settlements', ['lumber', 'brick', 'wheat', 'wool'])
      expect(useGameStore.getState().builds.settlements).toBe(5)

      // Test cities max (4)
      useGameStore.setState({ builds: { roads: 0, settlements: 0, cities: 4, knights: 0 } })
      performBuild('cities', ['ore', 'ore', 'ore', 'wheat', 'wheat'])
      expect(useGameStore.getState().builds.cities).toBe(4)

      // Test knights max (14)
      useGameStore.setState({ builds: { roads: 0, settlements: 0, cities: 0, knights: 14 } })
      performBuild('knights', ['ore', 'wool', 'wheat'])
      expect(useGameStore.getState().builds.knights).toBe(14)
    })
  })

  describe('endTurn', () => {
    it('should move to next player', () => {
      const { endTurn } = useGameStore.getState()

      expect(useGameStore.getState().currentPlayerId).toBe('1')
      
      endTurn()
      
      expect(useGameStore.getState().currentPlayerId).toBe('2')
    })

    it('should cycle back to player 1 after player 4', () => {
      useGameStore.setState({ currentPlayerId: '4' })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().currentPlayerId).toBe('1')
    })

    it('should increment turnNumber when cycling back to player 1', () => {
      useGameStore.setState({ currentPlayerId: '4', turnNumber: 1 })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().turnNumber).toBe(2)
    })

    it('should not increment turnNumber for other players', () => {
      useGameStore.setState({ currentPlayerId: '1', turnNumber: 5 })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().turnNumber).toBe(5)
    })

    it('should reset rollCount', () => {
      useGameStore.setState({ rollCount: 3 })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().rollCount).toBe(0)
    })

    it('should reset hasBuilt flag', () => {
      useGameStore.setState({ hasBuilt: true })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().hasBuilt).toBe(false)
    })

    it('should reset all dice (unlock and mark unused)', () => {
      useGameStore.setState({
        dice: [
          { value: 1, locked: true, used: true },
          { value: 2, locked: true, used: true },
          { value: 3, locked: false, used: true },
          { value: 4, locked: false, used: false },
          { value: 5, locked: true, used: false },
          { value: 6, locked: false, used: true },
        ]
      })

      const { endTurn } = useGameStore.getState()
      endTurn()

      const dice = useGameStore.getState().dice
      dice.forEach(die => {
        expect(die.locked).toBe(false)
        expect(die.used).toBe(false)
      })
    })

    it('should increment current player turnsCompleted', () => {
      const { endTurn } = useGameStore.getState()

      expect(useGameStore.getState().players[0].turnsCompleted).toBe(0)
      
      endTurn()
      
      expect(useGameStore.getState().players[0].turnsCompleted).toBe(1)
    })

    it('should set status to finished when player reaches 10 VP', () => {
      useGameStore.setState({ 
        players: [
          { id: '1', name: 'Player 1', score: 10, turnsCompleted: 0 },
          { id: '2', name: 'Player 2', score: 5, turnsCompleted: 0 },
          { id: '3', name: 'Player 3', score: 3, turnsCompleted: 0 },
          { id: '4', name: 'Player 4', score: 2, turnsCompleted: 0 },
        ],
        currentPlayerId: '1'
      })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().status).toBe('finished')
    })

    it('should not finish game when no player has 10 VP', () => {
      useGameStore.setState({ 
        players: [
          { id: '1', name: 'Player 1', score: 9, turnsCompleted: 0 },
          { id: '2', name: 'Player 2', score: 8, turnsCompleted: 0 },
          { id: '3', name: 'Player 3', score: 7, turnsCompleted: 0 },
          { id: '4', name: 'Player 4', score: 6, turnsCompleted: 0 },
        ],
        currentPlayerId: '4' 
      })

      const { endTurn } = useGameStore.getState()
      endTurn()

      expect(useGameStore.getState().status).toBe('in_progress')
    })

    it('should finish game immediately when building reaches 10 VP', () => {
      // Set up player with 9 VP, about to build settlement for +3 = 12 VP
      useGameStore.setState({
        builds: { roads: 9, settlements: 0, cities: 0, knights: 0 },
        players: [
          { id: '1', name: 'Player 1', score: 9, turnsCompleted: 0 },
          { id: '2', name: 'Player 2', score: 0, turnsCompleted: 0 },
          { id: '3', name: 'Player 3', score: 0, turnsCompleted: 0 },
          { id: '4', name: 'Player 4', score: 0, turnsCompleted: 0 },
        ],
        currentPlayerId: '1'
      })

      const { performBuild } = useGameStore.getState()
      performBuild('settlements', ['lumber', 'brick', 'wheat', 'wool'])

      // Should finish immediately
      expect(useGameStore.getState().status).toBe('finished')
      expect(useGameStore.getState().players[0].score).toBe(12) // 9 + 3
    })
  })

  describe('resetGame', () => {
    it('should reset all state to initial values', () => {
      // Modify state
      useGameStore.setState({
        turnNumber: 10,
        rollCount: 3,
        hasBuilt: true,
        currentPlayerId: '3',
        builds: { roads: 5, settlements: 2, cities: 1, knights: 3 },
        status: 'finished'
      })

      const { resetGame } = useGameStore.getState()
      resetGame()

      const state = useGameStore.getState()
      expect(state.turnNumber).toBe(1)
      expect(state.rollCount).toBe(0)
      expect(state.hasBuilt).toBe(false)
      expect(state.currentPlayerId).toBe('1')
      expect(state.builds).toEqual({ roads: 0, settlements: 0, cities: 0, knights: 0 })
      expect(state.status).toBe('in_progress')
    })

    it('should reset all dice', () => {
      useGameStore.setState({
        dice: [
          { value: 6, locked: true, used: true },
          { value: 5, locked: true, used: true },
          { value: 4, locked: false, used: true },
          { value: 3, locked: false, used: false },
          { value: 2, locked: true, used: false },
          { value: 1, locked: false, used: true },
        ]
      })

      const { resetGame } = useGameStore.getState()
      resetGame()

      const dice = useGameStore.getState().dice
      expect(dice).toHaveLength(6)
      dice.forEach(die => {
        expect(die.locked).toBe(false)
        expect(die.used).toBe(false)
        expect(die.value).toBeGreaterThanOrEqual(1)
        expect(die.value).toBeLessThanOrEqual(6)
      })
    })
  })

  describe('game flow integration', () => {
    it('should handle complete turn cycle', () => {
      const store = useGameStore.getState()

      // Roll dice
      store.rollDice()
      expect(useGameStore.getState().rollCount).toBe(1)

      // Build something
      store.performBuild('roads', ['lumber', 'brick'])
      expect(useGameStore.getState().builds.roads).toBe(1)
      expect(useGameStore.getState().hasBuilt).toBe(true)

      // Try to roll again (should fail)
      const rollCountBefore = useGameStore.getState().rollCount
      store.rollDice()
      expect(useGameStore.getState().rollCount).toBe(rollCountBefore)

      // End turn
      store.endTurn()
      expect(useGameStore.getState().currentPlayerId).toBe('2')
      expect(useGameStore.getState().hasBuilt).toBe(false)
      expect(useGameStore.getState().rollCount).toBe(0)
    })

    it('should track score across multiple builds', () => {
      const store = useGameStore.getState()

      // Build multiple items
      store.performBuild('roads', ['lumber', 'brick']) // +1
      expect(useGameStore.getState().players[0].score).toBe(1)

      // Need to reset hasBuilt for testing (in real game, would be next turn)
      useGameStore.setState({ hasBuilt: false })
      
      store.performBuild('roads', ['lumber', 'brick']) // +1
      expect(useGameStore.getState().players[0].score).toBe(2)

      useGameStore.setState({ hasBuilt: false })
      
      store.performBuild('settlements', ['lumber', 'brick', 'wheat', 'wool']) // +3
      expect(useGameStore.getState().players[0].score).toBe(5)
    })
  })
})
