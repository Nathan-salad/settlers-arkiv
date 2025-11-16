# Catan Dice Game - Multiplayer Web App

Cyberpunk-themed web implementation of the Catan Dice Game with real-time multiplayer support.

## 🎮 Features

- ✅ **Landing Screen** - Cyberpunk aesthetic with glitch effects
- ✅ **Lobby System** - Create/join games with room codes
- ✅ **Game Table** - 6 dice with lock/unlock, roll animations
- ✅ **Turn System** - 15 turns per player, up to 4 players
- ✅ **Build Actions** - Roads, settlements, cities, knights
- ✅ **Results Screen** - Rankings with confetti animation
- ⏳ **Backend Integration** - API stubs ready for Arkiv backend

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## 🎯 Testing Flow

1. **Landing** → Click "Create Game" or "Join Game"
2. **Lobby** → Generate room code (HOST) or enter code (JOIN)
3. **Game Table** → 
   - Roll dice (up to 3 times per turn)
   - Click dice to lock/unlock after first roll
   - Click build actions to track progress
   - End turn to move to next player
4. **Results** → After 15 turns, see final rankings with confetti

## 📁 Project Structure

```
src/
├── components/
│   ├── LandingScreen.jsx      # Landing page
│   ├── CreateJoinScreen.jsx   # Lobby/join flow
│   ├── GameTable.jsx           # Main game UI
│   ├── Dice.jsx                # Dice component
│   └── ResultsScreen.jsx       # End game results
├── store/
│   └── gameStore.js            # Zustand state management
├── api/
│   └── gameApi.js              # Backend integration stubs
├── App.jsx                     # Main app router
└── index.css                   # Cyberpunk styles + animations
```

## 🔌 Backend Integration

See `BACKEND_INTEGRATION.md` for complete integration guide.

**API Stubs Ready:**
- `createGame()` - Generate room code
- `joinGame(roomCode, playerName)` - Join existing game
- `rollDice(roomCode)` - Roll dice with validation
- `lockDice(roomCode, diceIndices)` - Toggle dice locks
- `performAction(roomCode, actionPayload)` - Execute builds
- `endTurn(roomCode)` - Rotate turns
- `subscribeGameState(roomCode, callback)` - Real-time updates

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite 4** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **canvas-confetti** - Confetti animations

## 📋 Requirements

See `requirements.md` for full PRD.

## 🎲 Game Rules

Rules PDF: `catan_dice_game_rules.pdf`

**Island Two Variant:**
- 2-4 players
- **First to 10 Victory Points wins** (no turn limit)
- 3 rolls per turn maximum
- Lock/unlock dice between rolls
- **Scoring:**
  - Settlements: 1 VP each
  - Cities: 2 VP each
  - Longest Road (5+ roads): +2 VP bonus
  - Largest Army (3+ knights): +2 VP bonus
  - Roads/Knights: 0 VP individually
- **2 gold dice = 1 resource** of your choice

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server (auto-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Build & Deploy

```bash
npm run build
# Output: dist/
```

Deploy `dist/` folder to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- Arkiv hosting

## 🐛 Known Issues

- Backend integration pending (using local state only)
- Score calculation not yet implemented (manual tracking)
- Build validation not enforced (all builds allowed)

## 🎯 Next Steps

1. **Backend Integration** - Connect to Arkiv web3 backend
2. **Scoring System** - Implement official scoring rules
3. **Build Validation** - Enforce dice combination requirements
4. **Score Sheet** - Build detailed scoring breakdown panel
5. **Testing** - Multi-player flow with real backend

## 📝 License

Sample project for Arkiv development 
