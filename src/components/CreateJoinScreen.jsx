import { useState } from 'react'
import useGameStore from '../store/gameStore'

export default function CreateJoinScreen({ onNavigate, initialTab = 'create' }) {
  const [tab, setTab] = useState(initialTab) // 'create' | 'join'
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [playerCount, setPlayerCount] = useState(2) // Default to 2 players
  
  const { resetGame } = useGameStore()

  const handleCreateGame = () => {
    // TODO: Call backend API
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
  }

  const handleStartGame = () => {
    // Reset game state before starting with selected player count and host name
    const hostName = playerName.trim() || 'Player 1'
    resetGame(playerCount, hostName)
    onNavigate('game')
  }

  const handleJoinGame = () => {
    // TODO: Call backend API with player name
    if (roomCode.trim()) {
      const joiningPlayerName = playerName.trim() || 'Player 2'
      // Reset game state before joining (will be updated with networking)
      resetGame(2, joiningPlayerName)
      onNavigate('game')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-cyber-blue hover:text-cyber-pink mb-8 text-sm font-mono"
        >
          &lt; BACK
        </button>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-cyber-blue mb-8 text-center">
          [GAME LOBBY]
        </h2>

        {/* Tab switcher */}
        <div className="flex border-2 border-cyber-blue mb-8">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              tab === 'create'
                ? 'bg-cyber-blue text-cyber-dark'
                : 'text-cyber-blue hover:bg-cyber-blue/10'
            }`}
          >
            HOST
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              tab === 'join'
                ? 'bg-cyber-pink text-cyber-dark'
                : 'text-cyber-pink hover:bg-cyber-pink/10'
            }`}
          >
            JOIN
          </button>
        </div>

        {/* Create Game Tab */}
        {tab === 'create' && (
          <div className="space-y-6 border-2 border-cyber-blue p-8">
            {!generatedCode ? (
              <>
                <div className="space-y-4 mb-6">
                  <label className="block text-cyber-blue font-mono text-sm">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-cyber-darker border-2 border-cyber-blue p-4 text-cyber-blue font-mono focus:outline-none focus:border-cyber-green placeholder-cyber-blue/30"
                  />
                </div>
                <p className="text-cyber-blue text-center mb-6 font-mono text-sm">
                  Create a new game and share the room code with friends
                </p>
                <button
                  onClick={handleCreateGame}
                  className="neon-btn text-cyber-blue border-cyber-blue w-full"
                >
                  Generate Room Code
                </button>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <p className="text-cyber-green font-mono">ROOM CODE:</p>
                  <div className="text-5xl font-bold text-cyber-pink tracking-widest">
                    {generatedCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="text-cyber-blue hover:text-cyber-green text-sm font-mono"
                  >
                    [COPY TO CLIPBOARD]
                  </button>
                </div>
                <div className="text-center text-cyber-green font-mono text-sm my-4">
                  Playing as: <span className="font-bold">{playerName || 'Player 1'}</span>
                </div>
                <button
                  onClick={handleStartGame}
                  className="neon-btn text-cyber-green border-cyber-green w-full mt-6"
                >
                  Start Game
                </button>
              </>
            )}
          </div>
        )}

        {/* Join Game Tab */}
        {tab === 'join' && (
          <div className="space-y-6 border-2 border-cyber-pink p-8">
            <div className="space-y-4">
              <label className="block text-cyber-pink font-mono text-sm">
                YOUR NAME
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-cyber-darker border-2 border-cyber-pink p-4 text-cyber-pink font-mono focus:outline-none focus:border-cyber-blue placeholder-cyber-pink/30"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-cyber-pink font-mono text-sm">
                ROOM CODE
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code..."
                maxLength={6}
                className="w-full bg-cyber-darker border-2 border-cyber-pink p-4 text-cyber-pink font-mono text-2xl tracking-widest text-center focus:outline-none focus:border-cyber-blue placeholder-cyber-pink/30"
              />
            </div>

            <button
              onClick={handleJoinGame}
              disabled={!roomCode.trim()}
              className="neon-btn text-cyber-pink border-cyber-pink w-full disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
