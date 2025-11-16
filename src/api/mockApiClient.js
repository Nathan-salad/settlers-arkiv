/**
 * Mock API Client
 * Simulates backend responses for local development and testing
 */

// Mock delay helper
const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage
const mockStorage = {
  lobbies: new Map(),
  games: new Map()
};

// Helper to generate game ID
const generateGameId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

/**
 * Create a new lobby
 * @param {Object} params
 * @param {string} params.playerName
 * @param {string} params.publicKey
 * @returns {Promise<Object>} Lobby object
 */
export async function createLobby({ playerName, publicKey }) {
  await mockDelay(2000); // 2 second delay to simulate server
  
  const gameId = generateGameId();
  const lobby = {
    closed: false,
    gameId,
    hostPublicKey: publicKey,
    players: [
      {
        playerName,
        publicKey
      }
    ]
  };
  
  mockStorage.lobbies.set(gameId, lobby);
  return lobby;
}

/**
 * Get lobby by game ID
 * @param {string} gameId
 * @returns {Promise<Object>} Lobby object
 */
export async function getLobby(gameId) {
  await mockDelay(100);
  
  const lobby = mockStorage.lobbies.get(gameId);
  if (!lobby) {
    throw new Error('Lobby not found');
  }
  
  return lobby;
}

/**
 * Join an existing lobby
 * @param {string} gameId
 * @param {Object} params
 * @param {string} params.playerName
 * @param {string} params.publicKey
 * @returns {Promise<void>}
 */
export async function joinLobby(gameId, { playerName, publicKey }) {
  await mockDelay();
  
  const lobby = mockStorage.lobbies.get(gameId);
  if (!lobby) {
    throw new Error('Lobby not found');
  }
  
  if (lobby.closed) {
    throw new Error('Lobby is closed');
  }
  
  if (lobby.players.length >= 4) {
    throw new Error('Lobby is full');
  }
  
  // Check if player already in lobby
  const alreadyJoined = lobby.players.some(p => p.publicKey === publicKey);
  if (!alreadyJoined) {
    lobby.players.push({ playerName, publicKey });
  }
}

/**
 * Add a bot player to lobby
 * @param {string} gameId
 * @returns {Promise<void>}
 */
export async function addBot(gameId) {
  await mockDelay(500);
  
  const lobby = mockStorage.lobbies.get(gameId);
  if (!lobby) {
    throw new Error('Lobby not found');
  }
  
  if (lobby.closed) {
    throw new Error('Lobby is closed');
  }
  
  if (lobby.players.length >= 4) {
    throw new Error('Lobby is full');
  }
  
  // Generate bot player
  const botNumber = lobby.players.filter(p => p.playerName.startsWith('Bot')).length + 1;
  const botPlayer = {
    playerName: `Bot ${botNumber}`,
    publicKey: `BOT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  };
  
  lobby.players.push(botPlayer);
}

/**
 * Start game (close lobby)
 * @param {string} gameId
 * @returns {Promise<void>}
 */
export async function startGame(gameId) {
  await mockDelay(2000); // 2 second delay to simulate server
  
  const lobby = mockStorage.lobbies.get(gameId);
  if (!lobby) {
    throw new Error('Lobby not found');
  }
  
  // Close the lobby
  lobby.closed = true;
  
  // Initialize game state
  const game = {
    completed: false,
    currentPlayerPublicKey: lobby.players[0].publicKey,
    currentTurn: {},
    gameId,
    largestArmyPlayerPublicKey: null,
    longestRoadPlayerPublicKey: null,
    players: lobby.players.map(p => ({
      cities: 0,
      knights: 0,
      playerName: p.playerName,
      publicKey: p.publicKey,
      roads: 0,
      settlements: 0,
      turns: 0,
      victoryPoints: 0
    }))
  };
  
  mockStorage.games.set(gameId, game);
}

/**
 * Get game state
 * @param {string} gameId
 * @returns {Promise<Object>} Game object
 */
export async function getGame(gameId) {
  await mockDelay(100);
  
  const game = mockStorage.games.get(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  
  return game;
}

/**
 * Roll dice (mock implementation)
 * @param {string} gameId
 * @param {Array<number>} [heldDice] - Dice to hold from previous roll (array of resource values)
 * @returns {Promise<Object>} Updated game state
 */
export async function rollDice(gameId, heldDice = []) {
  await mockDelay(500); // Simulate server delay
  
  const game = mockStorage.games.get(gameId);
  if (!game) {
    console.log('[MOCK API] Game not in storage for rollDice, returning mock dice');
    // Return mock dice result for client-side game
    const numDiceToRoll = 6 - heldDice.length;
    const newDice = Array(numDiceToRoll).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    return {
      currentTurn: {
        firstRoll: { diceRolled: newDice }
      }
    };
  }
  
  // Initialize currentTurn if it doesn't exist
  if (!game.currentTurn) {
    game.currentTurn = {};
  }
  
  // Determine which roll this is
  let rollNumber = 1;
  if (game.currentTurn.firstRoll) rollNumber = 2;
  if (game.currentTurn.secondRoll) rollNumber = 3;
  
  // Generate random dice (1-6 representing resources: Wood, Brick, Wheat, Wool, Ore, Gold)
  const numDiceToRoll = 6 - heldDice.length;
  const newDice = Array(numDiceToRoll).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
  
  // Update game turn based on roll number
  if (rollNumber === 1) {
    game.currentTurn.firstRoll = { diceRolled: newDice };
  } else if (rollNumber === 2) {
    game.currentTurn.secondRoll = { diceHeld: heldDice, diceRolled: newDice };
  } else if (rollNumber === 3) {
    game.currentTurn.thirdRoll = { diceHeld: heldDice, diceRolled: newDice };
  }
  
  return game;
}

/**
 * Build something (road, settlement, city, knight)
 * @param {string} gameId
 * @param {Object} params
 * @param {string} params.type - 'road' | 'settlement' | 'city' | 'knight'
 * @param {Array<number>} params.diceUsed - Indices of dice used
 * @returns {Promise<Object>} Updated game state
 */
export async function build(gameId, { type, diceUsed }) {
  await mockDelay(200);
  
  const game = mockStorage.games.get(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  
  const currentPlayer = game.players.find(p => p.publicKey === game.currentPlayerPublicKey);
  if (!currentPlayer) {
    throw new Error('Current player not found');
  }
  
  // Update player stats
  if (type === 'road') {
    currentPlayer.roads++;
    currentPlayer.victoryPoints++;
  } else if (type === 'settlement') {
    currentPlayer.settlements++;
    currentPlayer.victoryPoints++;
  } else if (type === 'city') {
    currentPlayer.cities++;
    currentPlayer.victoryPoints += 2;
  } else if (type === 'knight') {
    currentPlayer.knights++;
  }
  
  return game;
}

/**
 * End current turn and move to next player
 * @param {string} gameId
 * @returns {Promise<Object>} Updated game state
 */
export async function endTurn(gameId) {
  await mockDelay(200);
  
  const game = mockStorage.games.get(gameId);
  
  // If game not in mock storage, return empty response
  // Game state is managed client-side in the store
  if (!game) {
    console.log('[MOCK API] Game not in storage, client manages state');
    return { success: true };
  }
  
  const currentPlayerIndex = game.players.findIndex(p => p.publicKey === game.currentPlayerPublicKey);
  if (currentPlayerIndex === -1) {
    console.log('[MOCK API] Current player not found, client manages state');
    return { success: true };
  }
  
  // Increment current player's turn count
  game.players[currentPlayerIndex].turns++;
  
  // Check if game is complete (all players finished 15 turns)
  const allPlayersFinished = game.players.every(p => p.turns >= 15);
  if (allPlayersFinished) {
    game.completed = true;
    game.currentPlayerPublicKey = null;
    game.currentTurn = null;
  } else {
    // Move to next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentPlayerPublicKey = game.players[nextPlayerIndex].publicKey;
    game.currentTurn = {};
  }
  
  return game;
}

/**
 * Clear mock storage (for testing)
 */
export function clearMockStorage() {
  mockStorage.lobbies.clear();
  mockStorage.games.clear();
}

export default {
  createLobby,
  getLobby,
  joinLobby,
  addBot,
  startGame,
  getGame,
  rollDice,
  build,
  endTurn,
  clearMockStorage
};
