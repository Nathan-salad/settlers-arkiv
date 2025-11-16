/**
 * API Client Usage Examples
 * 
 * This file demonstrates how to use the mock and real API clients.
 * This is for reference only and is not imported by the application.
 */

// ============================================
// Example 1: Using the Unified API Client
// ============================================

import { 
  createLobby, 
  getLobby, 
  joinLobby, 
  startGame, 
  getGame 
} from './apiClient.js';

async function exampleUnifiedClient() {
  try {
    // Create a lobby
    const lobby = await createLobby({
      playerName: 'Alice',
      publicKey: '0xabc123'
    });
    console.log('Created lobby:', lobby);
    // { gameId: 'XYZ123', closed: false, hostPublicKey: '0xabc123', players: [...] }

    // Another player joins
    await joinLobby(lobby.gameId, {
      playerName: 'Bob',
      publicKey: '0xdef456'
    });
    console.log('Bob joined the lobby');

    // Check lobby state
    const updatedLobby = await getLobby(lobby.gameId);
    console.log('Lobby now has', updatedLobby.players.length, 'players');

    // Start the game
    await startGame(lobby.gameId);
    console.log('Game started!');

    // Get game state
    const game = await getGame(lobby.gameId);
    console.log('Current player:', game.currentPlayerPublicKey);
    console.log('Game completed:', game.completed);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// Example 2: Using the Mock API Client Directly
// ============================================

import mockClient from './mockApiClient.js';

async function exampleMockClient() {
  try {
    // Clear previous data
    mockClient.clearMockStorage();

    // Create and start a game
    const lobby = await mockClient.createLobby({
      playerName: 'Alice',
      publicKey: '0xabc123'
    });

    await mockClient.joinLobby(lobby.gameId, {
      playerName: 'Bob',
      publicKey: '0xdef456'
    });

    await mockClient.startGame(lobby.gameId);

    // Simulate gameplay
    let game = await mockClient.getGame(lobby.gameId);
    
    // First roll
    game = await mockClient.rollDice(lobby.gameId, 1);
    console.log('First roll:', game.currentTurn.firstRoll.diceRolled);

    // Second roll (holding some dice)
    const heldDice = [1, 2, 3]; // Hold first three dice
    game = await mockClient.rollDice(lobby.gameId, 2, heldDice);
    console.log('Second roll:', game.currentTurn.secondRoll);

    // Build a road
    game = await mockClient.build(lobby.gameId, {
      type: 'road',
      diceUsed: [0, 1]
    });
    console.log('Built a road! Roads:', game.players[0].roads);

    // End turn
    game = await mockClient.endTurn(lobby.gameId);
    console.log('Turn ended. Next player:', game.currentPlayerPublicKey);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// Example 3: Using the Real API Client Directly
// ============================================

import { createApiClient } from './realApiClient.js';

async function exampleRealClient() {
  // Initialize with your backend URL
  const apiClient = createApiClient('https://api.example.com');

  try {
    // Create a lobby
    const lobby = await apiClient.createLobby({
      playerName: 'Alice',
      publicKey: '0xabc123'
    });
    console.log('Created lobby:', lobby.gameId);

    // Join lobby
    await apiClient.joinLobby(lobby.gameId, {
      playerName: 'Bob',
      publicKey: '0xdef456'
    });

    // Start game
    await apiClient.startGame(lobby.gameId);

    // Subscribe to game updates via polling
    const unsubscribePoll = apiClient.subscribeToGame(
      lobby.gameId,
      (gameState, error) => {
        if (error) {
          console.error('Polling error:', error);
          return;
        }
        console.log('Game updated (poll):', gameState.currentPlayerPublicKey);
      },
      2000 // Poll every 2 seconds
    );

    // Or subscribe via WebSocket
    const unsubscribeWS = apiClient.subscribeToGameWS(
      lobby.gameId,
      (gameState, error) => {
        if (error) {
          console.error('WebSocket error:', error);
          return;
        }
        console.log('Game updated (WS):', gameState.currentPlayerPublicKey);
      }
    );

    // Unsubscribe when component unmounts
    // unsubscribePoll();
    // unsubscribeWS();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// Example 4: Switching API Clients at Runtime
// ============================================

import { switchApiClient, getApiClient } from './apiClient.js';

function exampleSwitchClient() {
  // Start with mock
  console.log('Current client:', getApiClient());

  // Switch to real API
  switchApiClient('real', 'https://api.example.com');
  console.log('Switched to real API');

  // Switch back to mock
  switchApiClient('mock');
  console.log('Switched back to mock API');
}

// ============================================
// Example 5: Using in React Components
// ============================================

/*
import { useState, useEffect } from 'react';
import { createLobby, getLobby, getGame } from './api/apiClient.js';

function LobbyComponent() {
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateLobby = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newLobby = await createLobby({
        playerName: 'Player 1',
        publicKey: '0x123...'
      });
      setLobby(newLobby);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {loading && <div>Creating lobby...</div>}
      {lobby && (
        <div>
          <h2>Lobby: {lobby.gameId}</h2>
          <p>Players: {lobby.players.length}</p>
        </div>
      )}
      <button onClick={handleCreateLobby}>Create Lobby</button>
    </div>
  );
}
*/

// ============================================
// Example 6: Error Handling Patterns
// ============================================

async function exampleErrorHandling() {
  try {
    const lobby = await getLobby('INVALID');
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('not found')) {
      console.error('Lobby does not exist');
      // Show "Lobby not found" message to user
    } else if (error.message.includes('Network error')) {
      console.error('Cannot connect to server');
      // Show connection error message
    } else {
      console.error('Unknown error:', error.message);
      // Show generic error message
    }
  }
}

// Export examples for reference
export {
  exampleUnifiedClient,
  exampleMockClient,
  exampleRealClient,
  exampleSwitchClient,
  exampleErrorHandling
};
