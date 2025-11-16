/**
 * Backend Integration API
 * 
 * These are stub functions ready for Arkiv web3 backend integration.
 * Replace the mock implementations with actual API calls.
 */

// Mock delay helper
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock game state generator
const generateMockGameState = (roomCode, players = []) => ({
  roomCode,
  players: players.length > 0 ? players : [
    { id: '1', name: 'Player 1', score: 0, turnsCompleted: 0 }
  ],
  currentPlayerId: players[0]?.id || '1',
  turnNumber: 1,
  rollCount: 0,
  dice: Array(6).fill(0).map(() => ({ value: 1, locked: false })),
  status: 'in_progress',
  builds: {
    roads: 0,
    settlements: 0,
    cities: 0,
    knights: 0
  }
})

// ============================================
// LOBBY OPERATIONS
// ============================================

/**
 * Create a new game and return room code + initial state
 * @returns {Promise<{ roomCode: string, initialGameState: GameState }>}
 */
export async function createGame() {
  await mockDelay()
  
  // TODO: Replace with actual backend call
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const initialGameState = generateMockGameState(roomCode)
  
  return { roomCode, initialGameState }
}

/**
 * Join an existing game by room code
 * @param {string} roomCode - 6-character room code
 * @param {string} playerName - Player's display name
 * @returns {Promise<GameState>}
 */
export async function joinGame(roomCode, playerName = 'Player') {
  await mockDelay()
  
  // TODO: Replace with actual backend call
  if (!roomCode || roomCode.length !== 6) {
    throw new Error('Invalid room code')
  }
  
  const players = [
    { id: '1', name: 'Host', score: 0, turnsCompleted: 0 },
    { id: '2', name: playerName, score: 0, turnsCompleted: 0 }
  ]
  
  return generateMockGameState(roomCode, players)
}

// ============================================
// GAMEPLAY OPERATIONS
// ============================================

/**
 * Roll the dice (or re-roll unlocked dice)
 * @param {string} roomCode - Game room code
 * @returns {Promise<GameState>}
 */
export async function rollDice(roomCode) {
  await mockDelay(300)
  
  // TODO: Replace with actual backend call
  // Backend should:
  // 1. Verify it's the current player's turn
  // 2. Check rollCount < 3
  // 3. Generate random dice values for unlocked dice
  // 4. Increment rollCount
  // 5. Return updated game state
  
  console.log('[API] rollDice called for room:', roomCode)
  throw new Error('Backend integration pending')
}

/**
 * Lock/unlock specific dice
 * @param {string} roomCode - Game room code
 * @param {number[]} diceIndices - Array of dice indices to toggle lock state
 * @returns {Promise<GameState>}
 */
export async function lockDice(roomCode, diceIndices) {
  await mockDelay(100)
  
  // TODO: Replace with actual backend call
  // Backend should:
  // 1. Verify it's the current player's turn
  // 2. Toggle lock state for specified dice
  // 3. Return updated game state
  
  console.log('[API] lockDice called for room:', roomCode, 'dice:', diceIndices)
  throw new Error('Backend integration pending')
}

/**
 * Perform a build action (road, settlement, city, knight)
 * @param {string} roomCode - Game room code
 * @param {object} actionPayload - Build action details
 * @param {string} actionPayload.type - 'road' | 'settlement' | 'city' | 'knight'
 * @param {number[]} actionPayload.diceUsed - Indices of dice used for this build
 * @returns {Promise<GameState>}
 */
export async function performAction(roomCode, actionPayload) {
  await mockDelay(300)
  
  // TODO: Replace with actual backend call
  // Backend should:
  // 1. Verify it's the current player's turn
  // 2. Validate dice combination matches build requirements
  // 3. Update build counts and score
  // 4. Return updated game state
  
  console.log('[API] performAction called for room:', roomCode, 'action:', actionPayload)
  throw new Error('Backend integration pending')
}

/**
 * End the current player's turn
 * @param {string} roomCode - Game room code
 * @returns {Promise<GameState>}
 */
export async function endTurn(roomCode) {
  await mockDelay(300)
  
  // TODO: Replace with actual backend call
  // Backend should:
  // 1. Verify it's the current player's turn
  // 2. Increment current player's turnsCompleted
  // 3. Move to next player
  // 4. Reset rollCount and dice locks
  // 5. Check if game is finished (all players completed 15 turns)
  // 6. Return updated game state
  
  console.log('[API] endTurn called for room:', roomCode)
  throw new Error('Backend integration pending')
}

// ============================================
// REAL-TIME UPDATES
// ============================================

/**
 * Subscribe to real-time game state updates
 * @param {string} roomCode - Game room code
 * @param {function(GameState): void} callback - Called when game state updates
 * @returns {function(): void} Unsubscribe function
 */
export function subscribeGameState(roomCode, callback) {
  // TODO: Replace with actual backend websocket/polling implementation
  // Options:
  // - WebSocket connection
  // - Server-Sent Events (SSE)
  // - Polling with setInterval
  // - Arkiv-specific real-time solution
  
  console.log('[API] subscribeGameState called for room:', roomCode)
  
  // Mock implementation - polls every 2 seconds
  const intervalId = setInterval(() => {
    // In real implementation, fetch and call callback with new state
    console.log('[API] Polling for game state updates...')
  }, 2000)
  
  // Return unsubscribe function
  return () => {
    clearInterval(intervalId)
    console.log('[API] Unsubscribed from room:', roomCode)
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current game state (one-time fetch)
 * @param {string} roomCode - Game room code
 * @returns {Promise<GameState>}
 */
export async function getGameState(roomCode) {
  await mockDelay()
  
  // TODO: Replace with actual backend call
  console.log('[API] getGameState called for room:', roomCode)
  throw new Error('Backend integration pending')
}

/**
 * Leave a game
 * @param {string} roomCode - Game room code
 * @param {string} playerId - Player ID leaving
 * @returns {Promise<void>}
 */
export async function leaveGame(roomCode, playerId) {
  await mockDelay()
  
  // TODO: Replace with actual backend call
  console.log('[API] leaveGame called for room:', roomCode, 'player:', playerId)
}
