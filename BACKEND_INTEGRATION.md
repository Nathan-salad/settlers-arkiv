# Backend Integration Guide

This document outlines how to integrate the Catan Dice Game frontend with the Arkiv web3 backend.

## API Endpoints

All API stub functions are located in `/src/api/gameApi.js`.

### Current Status
- ✅ Frontend UI complete
- ✅ Local game state management (Zustand)
- ⏳ Backend API integration pending

---

## Required Backend Functions

### 1. Lobby Operations

#### `createGame()`
Creates a new game room.

**Returns:**
```javascript
{
  roomCode: string,        // 6-character room code
  initialGameState: GameState
}
```

#### `joinGame(roomCode, playerName)`
Join an existing game.

**Parameters:**
- `roomCode`: string (6 characters)
- `playerName`: string

**Returns:** `GameState`

---

### 2. Gameplay Operations

#### `rollDice(roomCode)`
Roll or re-roll unlocked dice.

**Backend Logic:**
1. Verify current player's turn
2. Check `rollCount < 3`
3. Generate random values (1-6) for unlocked dice
4. Increment `rollCount`
5. Return updated state

**Returns:** `GameState`

#### `lockDice(roomCode, diceIndices)`
Toggle lock state for specified dice.

**Parameters:**
- `roomCode`: string
- `diceIndices`: number[] (0-5)

**Returns:** `GameState`

#### `performAction(roomCode, actionPayload)`
Execute a build action.

**Parameters:**
- `roomCode`: string
- `actionPayload`: 
  ```javascript
  {
    type: 'road' | 'settlement' | 'city' | 'knight',
    diceUsed: number[]  // Indices of dice used
  }
  ```

**Backend Logic:**
1. Verify current player's turn
2. Validate dice combination matches build requirements (see PDF)
3. Update `builds` object and `score`
4. Return updated state

**Returns:** `GameState`

#### `endTurn(roomCode)`
End current player's turn.

**Backend Logic:**
1. Verify current player's turn
2. Increment `turnsCompleted` for current player
3. Set `currentPlayerId` to next player
4. Reset `rollCount` to 0
5. Unlock all dice
6. Check if all players completed 15 turns → set `status: 'finished'`

**Returns:** `GameState`

---

### 3. Real-Time Updates

#### `subscribeGameState(roomCode, callback)`
Subscribe to game state changes.

**Parameters:**
- `roomCode`: string
- `callback`: `(gameState: GameState) => void`

**Returns:** Unsubscribe function `() => void`

**Implementation Options:**
- WebSocket
- Server-Sent Events (SSE)
- Long polling
- Arkiv-specific real-time protocol

---

## GameState Type

```typescript
type Player = {
  id: string
  name: string
  score: number
  turnsCompleted: number  // 0-15
}

type Dice = {
  value: number   // 1-6
  locked: boolean
}

type GameState = {
  roomCode: string
  players: Player[]  // 2-4 players
  currentPlayerId: string
  turnNumber: number  // 1-15
  rollCount: number   // 0-3
  dice: Dice[]        // Array of 6 dice
  status: 'lobby' | 'in_progress' | 'finished'
  builds: {
    roads: number
    settlements: number
    cities: number
    knights: number
  }
}
```

---

## Integration Checklist

### Phase 1: Basic Lobby
- [ ] `createGame()` - Generate room code, create game instance
- [ ] `joinGame()` - Add player to existing game
- [ ] `subscribeGameState()` - Basic real-time sync

### Phase 2: Core Gameplay
- [ ] `rollDice()` - Random dice generation
- [ ] `lockDice()` - Toggle lock state
- [ ] `endTurn()` - Turn rotation logic

### Phase 3: Build System
- [ ] `performAction()` - Validate dice combinations
- [ ] Implement scoring rules from PDF
- [ ] Track build counts per player

### Phase 4: Polish
- [ ] Error handling and validation
- [ ] Player disconnect/reconnect
- [ ] Game cleanup after completion

---

## Testing the Integration

### Local Testing
1. Start backend server
2. Update API base URL in `gameApi.js`
3. Start frontend: `npm run dev`
4. Test flow:
   - Create game → verify room code generated
   - Join game → verify player added
   - Roll dice → verify random values
   - Lock dice → verify state persists
   - End turn → verify turn rotation

### Multi-Player Testing
1. Open game in 2+ browser windows/devices
2. Create game in window 1
3. Join with room code in window 2
4. Verify real-time sync between windows
5. Complete full turn cycle

---

## Frontend State Management

The frontend uses **Zustand** for local state management (`/src/store/gameStore.js`).

**Current Setup:**
- Local state for immediate UI updates
- Backend calls should update local state after server confirmation
- Real-time subscription keeps state in sync

**Integration Pattern:**
```javascript
// In gameStore.js
rollDice: () => set((state) => {
  // Optimistic update (optional)
  const newDice = state.dice.map(...)
  
  // Call backend API
  rollDiceAPI(state.roomCode).then(newState => {
    // Update local state with server response
    set(newState)
  })
  
  return { dice: newDice, rollCount: state.rollCount + 1 }
})
```

---

## Error Handling

All API functions should throw errors with descriptive messages:

```javascript
// Invalid room code
throw new Error('Room not found')

// Not player's turn
throw new Error('Not your turn')

// Invalid dice combination
throw new Error('Invalid build: insufficient resources')

// Game already finished
throw new Error('Game has ended')
```

Frontend will display errors to user via toast/modal.

---

## Environment Configuration

Create `.env` file (not committed):

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

Access in code:
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL
```

---

## Questions?

Contact frontend dev or check:
- `requirements.md` - Full PRD
- `catan_dice_game_rules.pdf` - Official game rules
- `/src/store/gameStore.js` - Current state shape
