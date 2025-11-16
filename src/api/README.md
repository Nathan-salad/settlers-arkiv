# API Clients

This directory contains the API clients for the Settlers Dice Game.

## Files

- **`apiClient.js`** - Unified API interface (use this in your app)
- **`mockApiClient.js`** - Mock API client for local development
- **`realApiClient.js`** - Real API client using fetch API
- **`gameApi.js`** - Legacy API stubs (can be deprecated)

## Quick Start

### Using the Unified API Client

```javascript
import { createLobby, getLobby, joinLobby, startGame, getGame } from './api/apiClient.js';

// Create a lobby
const lobby = await createLobby({
  playerName: 'Alice',
  publicKey: '0x123...'
});

// Join a lobby
await joinLobby(lobby.gameId, {
  playerName: 'Bob',
  publicKey: '0x456...'
});

// Start the game
await startGame(lobby.gameId);

// Get game state
const game = await getGame(lobby.gameId);
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Set to 'false' to use real API, or 'true'/'anything else' to use mock API
VITE_USE_MOCK_API=true

# Backend API base URL (required when using real API)
VITE_API_BASE_URL=http://localhost:3000
```

### Switching Between Mock and Real API

**Option 1: Environment Variable (Recommended)**

```bash
# Use mock API (default)
VITE_USE_MOCK_API=true

# Use real API
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.example.com
```

**Option 2: Runtime Switch**

```javascript
import { switchApiClient } from './api/apiClient.js';

// Switch to mock
switchApiClient('mock');

// Switch to real API
switchApiClient('real', 'https://api.example.com');
```

## Using the Mock API Client Directly

```javascript
import mockClient from './api/mockApiClient.js';

const lobby = await mockClient.createLobby({
  playerName: 'Alice',
  publicKey: '0x123...'
});

// Mock client includes additional methods
await mockClient.rollDice(gameId, 1); // First roll
await mockClient.build(gameId, { type: 'road', diceUsed: [0, 1] });
await mockClient.endTurn(gameId);

// Clear mock storage (useful for testing)
mockClient.clearMockStorage();
```

## Using the Real API Client Directly

```javascript
import { createApiClient } from './api/realApiClient.js';

const apiClient = createApiClient('https://api.example.com');

const lobby = await apiClient.createLobby({
  playerName: 'Alice',
  publicKey: '0x123...'
});

// Subscribe to game updates via polling
const unsubscribe = apiClient.subscribeToGame(
  gameId,
  (gameState, error) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log('Game updated:', gameState);
  },
  2000 // Poll every 2 seconds
);

// Unsubscribe when done
unsubscribe();

// Or use WebSocket (if backend supports it)
const unsubscribeWS = apiClient.subscribeToGameWS(
  gameId,
  (gameState, error) => {
    if (error) {
      console.error('WebSocket error:', error);
      return;
    }
    console.log('Game updated:', gameState);
  }
);
```

## API Reference

### Lobby Operations

#### `createLobby({ playerName, publicKey })`
Create a new game lobby.

**Returns:** 
```typescript
{
  closed: boolean
  gameId: string
  hostPublicKey: string
  players: Array<{
    playerName: string
    publicKey: string
  }>
}
```

#### `getLobby(gameId)`
Get current lobby state.

#### `joinLobby(gameId, { playerName, publicKey })`
Join an existing lobby.

#### `startGame(gameId)`
Close the lobby and start the game.

### Game Operations

#### `getGame(gameId)`
Get current game state.

**Returns:**
```typescript
{
  completed: boolean
  currentPlayerPublicKey?: string
  currentTurn?: {
    firstRoll?: { diceRolled: number[] }
    secondRoll?: { diceHeld: number[], diceRolled: number[] }
    thirdRoll?: { diceHeld: number[], diceRolled: number[] }
  }
  gameId: string
  largestArmyPlayerPublicKey?: string
  longestRoadPlayerPublicKey?: string
  players: Array<{
    cities: number
    knights: number
    playerName: string
    publicKey: string
    roads: number
    settlements: number
    turns: number
    victoryPoints: number
  }>
}
```

### Real-Time Updates

#### `subscribeToGame(gameId, callback, interval)`
Subscribe to game updates via polling (Real API only).

- `callback(gameState, error)` - Called when game state updates
- `interval` - Polling interval in milliseconds (default: 2000)
- Returns unsubscribe function

#### `subscribeToGameWS(gameId, callback, wsURL)`
Subscribe to game updates via WebSocket (Real API only).

- `callback(gameState, error)` - Called when game state updates
- `wsURL` - Optional WebSocket URL (default: converts baseURL to ws://)
- Returns unsubscribe function

### Mock-Only Operations

These operations are only available in the mock client for testing:

#### `rollDice(gameId, rollNumber, heldDice)`
Simulate rolling dice.

#### `build(gameId, { type, diceUsed })`
Simulate building (road, settlement, city, knight).

#### `endTurn(gameId)`
End current player's turn and move to next player.

#### `clearMockStorage()`
Clear all mock data (useful for testing).

## Error Handling

All API methods throw errors that should be caught:

```javascript
try {
  const lobby = await createLobby({
    playerName: 'Alice',
    publicKey: '0x123...'
  });
} catch (error) {
  console.error('Failed to create lobby:', error.message);
  // Display error to user
}
```

Common errors:
- `Lobby not found` - Invalid game ID
- `Lobby is closed` - Cannot join a started game
- `Lobby is full` - Maximum 4 players reached
- `Game not found` - Invalid game ID
- `Network error: Unable to connect to [url]` - Connection failed

## TypeScript Support

For TypeScript projects, you can create type definitions:

```typescript
// types/api.ts
export enum GameResource {
  Wood = 1,
  Brick = 2,
  Wheat = 3,
  Wool = 4,
  Ore = 5,
  Gold = 6
}

export interface LobbyPlayer {
  playerName: string
  publicKey: string
}

export interface Lobby {
  closed: boolean
  gameId: string
  hostPublicKey: string
  players: LobbyPlayer[]
}

export interface GamePlayer {
  cities: number
  knights: number
  playerName: string
  publicKey: string
  roads: number
  settlements: number
  turns: number
  victoryPoints: number
}

export interface GameTurn {
  firstRoll?: {
    diceRolled: GameResource[]
  }
  secondRoll?: {
    diceHeld: GameResource[]
    diceRolled: GameResource[]
  }
  thirdRoll?: {
    diceHeld: GameResource[]
    diceRolled: GameResource[]
  }
}

export interface Game {
  completed: boolean
  currentPlayerPublicKey?: string
  currentTurn?: GameTurn
  gameId: string
  largestArmyPlayerPublicKey?: string
  longestRoadPlayerPublicKey?: string
  players: GamePlayer[]
}
```
