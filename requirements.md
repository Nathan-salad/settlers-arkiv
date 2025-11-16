Sure — here is a clean PRD.md file ready to import into Windsurf Cascade.
Everything is formatted as Markdown with checkboxes so you can track progress.

⸻

PRD.md — Catan Dice Game (Frontend Only)

1. Overview

Product: Catan Dice Game – Web Multiplayer
Type: Real-time, turn-based browser game
Tech: JavaScript SPA (framework-agnostic)
Backend: Provided separately via Arkiv web3 backend. Frontend exposes clear integration points only.
Rules: Base rules from the official Catan Dice Game PDF (in repo root).

Players join via a room code, take turns in real-time, and complete 15 fixed turns following the Catan Dice Game base rules.

⸻

2. Goals & Non-Goals

Goals (v1)
	•	Responsive web-based UI for Catan Dice Game.
	•	Real-time online multiplayer (up to 4 players).
	•	Room code creation & join flow.
	•	Turn system (15 turns).
	•	Up to 3 dice rolls per turn with lock/hold.
	•	Full build actions per PDF rules (roads, settlements, cities, knights).
	•	Cyberpunk/low-bit aesthetic with dice roll animation & confetti.
	•	Clean backend integration API hooks for Arkiv dev.

Non-Goals
	•	Wallet integration.
	•	On-chain randomness / Arkiv logic.
	•	Global leaderboards or spectator mode.
	•	Heavy anti-cheat.
	•	Account system or user profiles.

⸻

3. Core Game Rules
	•	Base rules only; no house rules.
	•	2–4 players (4 max).
	•	15 fixed turns per player.
	•	Up to 3 rolls per turn, dice lock supported.
	•	All build actions available.
	•	Scoring mirrors PDF exactly.
	•	Game ends after all players complete 15 turns.

⸻

4. Screens

4.1 Landing Screen
	•	Title + Cyberpunk low-bit grid background.
	•	“Create Game” & “Join Game” CTAs.
	•	Responsive layout.

⸻

4.2 Create / Join Screen
	•	Host Tab
	•	“Create Game” button.
	•	Display room code returned by backend.
	•	Copy room code.
	•	Join Tab
	•	Room code input.
	•	“Join Game” button.
	•	Optional player name input.
	•	Basic error display.

⸻

4.3 Game Table

Core gameplay screen.

HUD
	•	Show current player.
	•	Turn number (1–15).
	•	Roll count (0–3).

Dice Area
	•	6 dice displayed.
	•	Dice roll animation.
	•	Dice lock/unlock states.
	•	“Roll / Re-roll” button.

Build Actions Panel
	•	Show available build actions (roads, settlements, etc.).
	•	Grey-out unavailable builds.
	•	Click to perform a build.

Board/Score Context
	•	Low-bit cyberpunk grid representing constructed items.
	•	Player progress visually highlighted.

Player List / Turn Order
	•	Up to 4 players.
	•	Highlight active player.
	•	Show scores + turns completed.

Footer
	•	“End Turn” button.

⸻

4.4 Score Sheet Panel
	•	Toggle panel or separate screen.
	•	Full scoring table per PDF.
	•	Live-updating.
	•	Toggle between players.

⸻

4.5 Results Screen
	•	Final score list (1st–4th).
	•	Score breakdown.
	•	Confetti animation.
	•	“Play Again” + “Return to Landing”.

⸻

5. Visual Design
	•	Dark cyberpunk neon theme.
	•	Low-bit grid background.
	•	Pixel-art-inspired UI.
	•	Dice animation: jitter/glitch style.
	•	Confetti for game end.

⸻

6. Frontend State Model

type Player = {
  id: string;
  name: string;
  score: number;
  turnsCompleted: number;
};

type Dice = {
  value: number;  // 1–6
  locked: boolean;
};

type GameState = {
  roomCode: string;
  players: Player[];
  currentPlayerId: string;
  turnNumber: number;   // 1–15
  rollCount: number;    // 0–3
  dice: Dice[];
  status: "lobby" | "in_progress" | "finished";
  // build/board state matching PDF
};

	•	Local UI store (zustand, context, or custom).
	•	Game state driven by backend updates.

⸻

7. Backend Integration Hooks (Stubs)

// Lobby
createGame(): Promise<{ roomCode: string; initialGameState: GameState }>;
joinGame(roomCode: string, playerName: string): Promise<GameState>;

// Gameplay
rollDice(roomCode: string): Promise<GameState>;
lockDice(roomCode: string, diceIndices: number[]): Promise<GameState>;
performAction(roomCode: string, actionPayload: any): Promise<GameState>;
endTurn(roomCode: string): Promise<GameState>;

// Real-time updates
subscribeGameState(roomCode: string, callback: (gs: GameState) => void): UnsubscribeFn;

	•	FE must expose these calls cleanly for backend dev.
	•	FE shows loading/error states.

⸻

8. User Stories

Lobby & Join
	•	As a host, I can create a game and share a room code.
	•	As a player, I can join using a room code.

Turn Loop
	•	As the active player, I can roll up to 3 times and lock dice.
	•	I can see whose turn it is and turn number.

Building
	•	I can see which structures I can build.
	•	Builds update the score sheet immediately.

Results
	•	I see final ranking after all turns.
	•	Confetti plays at game end.

⸻

9. Acceptance Criteria (v1)
	•	SPA loads without refresh during game.
	•	Create/Join works via room code.
	•	Multiplayer (up to 4).
	•	Dice roll + lock/unlock UI works.
	•	All build actions UI available.
	•	Score sheet reflects game state.
	•	End-of-game logic shows results screen.
	•	Confetti on game end.
	•	Responsive on desktop + mobile.

⸻

10. Demo Flow (Pitch Script)
	•	Open Landing.
	•	Create Game → show room code.
	•	Join from another device/browser.
	•	Demonstrate roll/lock + build.
	•	Skip to end-game state (or play quickly).
	•	Results screen + confetti.

⸻

