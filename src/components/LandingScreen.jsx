import { useState } from 'react'
import useGameStore from '../store/gameStore'
import saladLogo from './salad.svg'
import arkivLogo from './arkiv.png'
import HelpModal from './HelpModal'

export default function LandingScreen({ onNavigate }) {
  const [showHelp, setShowHelp] = useState(false)
  const [tab, setTab] = useState('create')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [playerCount, setPlayerCount] = useState(2)
  
  const { resetGame } = useGameStore()

  const handleCreateGame = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
  }

  const handleStartGame = () => {
    const hostName = playerName.trim() || 'Player 1'
    resetGame(playerCount, hostName)
    onNavigate('game')
  }

  const handleJoinGame = () => {
    if (roomCode.trim()) {
      const joiningPlayerName = playerName.trim() || 'Player 2'
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
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold glitch text-cyber-blue mb-4 text-center">
          S3TTLΞ
        </h1>
        
        <p className="text-lg md:text-xl text-cyber-pink font-mono tracking-wider text-center mb-8">
          [MULTIPLAYER EDITION]
        </p>

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
                    className="text-cyber-blue hover:text-cyber-green transition-colors text-sm font-mono underline"
                  >
                    📋 Copy to Clipboard
                  </button>
                  <p className="text-cyber-green text-sm font-mono">
                    Playing as: {playerName || 'Player 1'}
                  </p>
                </div>

                <div className="space-y-4 mt-6">
                  <label className="block text-cyber-blue font-mono text-sm">
                    NUMBER OF PLAYERS (2-4)
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(count => (
                      <button
                        key={count}
                        onClick={() => setPlayerCount(count)}
                        className={`flex-1 py-3 border-2 font-mono transition-colors ${
                          playerCount === count
                            ? 'bg-cyber-blue text-cyber-dark border-cyber-blue'
                            : 'border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="neon-btn text-cyber-green border-cyber-green w-full pulse-green"
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
            <div className="space-y-4 mb-6">
              <label className="block text-cyber-pink font-mono text-sm">
                YOUR NAME
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-cyber-darker border-2 border-cyber-pink p-4 text-cyber-pink font-mono focus:outline-none focus:border-cyber-green placeholder-cyber-pink/30"
              />
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-cyber-pink font-mono text-sm">
                ROOM CODE
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code..."
                className="w-full bg-cyber-darker border-2 border-cyber-pink p-4 text-cyber-pink font-mono text-2xl tracking-widest focus:outline-none focus:border-cyber-green placeholder-cyber-pink/30"
                maxLength={6}
              />
            </div>

            <p className="text-cyber-pink text-center mb-6 font-mono text-sm">
              Enter the room code shared by the host
            </p>

            <button
              onClick={handleJoinGame}
              disabled={!roomCode.trim()}
              className={`neon-btn w-full ${
                roomCode.trim()
                  ? 'text-cyber-pink border-cyber-pink'
                  : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
              }`}
            >
              Join Game
            </button>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-cyber-green text-xs md:text-sm font-mono opacity-70 text-center space-y-1">
          <p>&gt; 2-4 PLAYERS</p>
          <p>&gt; FIRST TO 10 VICTORY POINTS</p>
          <button 
            onClick={() => setShowHelp(true)}
            className="text-cyber-blue hover:text-cyber-pink transition-colors underline text-xs mt-3"
          >
            &gt; VIEW RULES
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 text-cyber-purple text-xs font-mono opacity-50">
        [ARKIV_v1.0]
      </div>
      
      <div className="absolute bottom-4 right-4 text-cyber-green text-xs font-mono opacity-50">
        [STATUS: ONLINE]
      </div>

      {/* Logos - Bottom Left */}
      <div className="absolute bottom-20 left-4 flex items-center gap-3">
        <img 
          src={saladLogo} 
          alt="Salad" 
          className="h-10 opacity-60 hover:opacity-100 transition-opacity"
        />
        <a 
          href="https://coinmarketcap.com/currencies/golem-network-tokens/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-green text-2xl font-bold glitch animate-pulse hover:text-cyber-blue cursor-pointer transition-colors"
          title="Learn more about Golem"
        >
          +
        </a>
        <img 
          src={arkivLogo} 
          alt="Arkiv" 
          className="h-10 opacity-60 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  )
}
