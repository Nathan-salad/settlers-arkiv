# Create Lobby

POST /lobbies

## Request Body

```ts
interface CreateLobbyRequest {
  playerName: string
  publicKey: string
}
```

## Response Status

200 OK

## Response Body

```ts
interface Lobby {
  closed: boolean
  gameId: string
  hostPublicKey: string
  players: LobbyPlayer[]
}
```

# Get Lobby

GET /lobbies/:gameId

## Response Status

200 OK

## Response Body

```ts
interface Lobby {
  closed: boolean
  gameId: string
  hostPublicKey: string
  players: LobbyPlayer[]
}
```

# Join Lobby

POST /lobbies/:gameId/players

## Request Body

```ts
interface JoinLobbyRequest {
  playerName: string
  publicKey: string
}
```

## Response Status

204 No Content

# Start Game

PUT /lobbies/:gameId/open

## Request Body

```ts
true
```

# Get Game

GET /games/:gameId

## Response Status

200 OK

## Response Body

```ts
enum GameResource {
  Wood = 1,
  Brick = 2,
  Wheat = 3,
  Wool = 4,
  Ore = 5,
  Gold = 6
}

interface GamePlayer {
  cities: number
  knights: number
  playerName: string
  publicKey: string
  roads: number
  settlements: number
  turns: number
  victoryPoints: number
}

interface GameTurn {
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

interface Game {
  completed: boolean
  currentPlayerPublicKey?: string
  currentTurn?: GameTurn
  gameId: string
  largestArmyPlayerPublicKey?: string
  longestRoadPlayerPublicKey?: string
  players: GamePlayer[]
}
```