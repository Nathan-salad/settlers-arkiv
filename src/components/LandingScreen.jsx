import { useState, useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'
import saladLogo from './salad.svg'
import arkivLogo from './arkiv.png'
import HelpModal from './HelpModal'
import { connectWallet, getCurrentWallet, onAccountChanged, formatAddress, isMetaMaskInstalled } from '../utils/metamask'
import { createLobby, joinLobby, startGame } from '../api/apiClient'

export default function LandingScreen({ onNavigate, onJoinLobby }) {
  const [showHelp, setShowHelp] = useState(false)
  const [tab, setTab] = useState('create')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [playerCount, setPlayerCount] = useState(2)
  const [walletAddress, setWalletAddress] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCreatingLobby, setIsCreatingLobby] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [error, setError] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const foxRef = useRef(null)
  
  const { resetGame, setGameId } = useGameStore()

  // Check if already connected on mount
  useEffect(() => {
    // Only auto-connect if user hasn't explicitly logged out
    const hasLoggedOut = localStorage.getItem('wallet_logged_out') === 'true'
    
    if (!hasLoggedOut) {
      getCurrentWallet().then(address => {
        if (address) {
          setWalletAddress(address)
          // Clear the logout flag if we successfully reconnect
          localStorage.removeItem('wallet_logged_out')
        }
      })
    }

    // Listen for account changes
    const cleanup = onAccountChanged((newAddress) => {
      setWalletAddress(newAddress)
      if (!newAddress) {
        setError('Wallet disconnected')
        setGeneratedCode(null)
      }
    })

    return cleanup
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Calculate subtle rotation based on mouse position
  const getFoxRotation = () => {
    if (!foxRef.current) return 0
    
    const rect = foxRef.current.getBoundingClientRect()
    const foxCenterX = rect.left + rect.width / 2
    const foxCenterY = rect.top + rect.height / 2
    
    const deltaX = mousePos.x - foxCenterX
    const deltaY = mousePos.y - foxCenterY
    
    // Calculate angle in degrees, limit to ±15 degrees
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    const normalizedAngle = ((angle + 90) % 360) - 180 // Normalize so 0 is up
    const limitedAngle = Math.max(-15, Math.min(15, normalizedAngle / 6))
    
    return limitedAngle
  }

  // Handle MetaMask connection
  const handleConnectWallet = async () => {
    setError(null)
    setIsConnecting(true)

    try {
      const address = await connectWallet()
      setWalletAddress(address)
      // Clear logout flag when user connects
      localStorage.removeItem('wallet_logged_out')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle wallet disconnect
  const handleDisconnect = () => {
    setWalletAddress(null)
    setGeneratedCode(null)
    setPlayerName('')
    setError(null)
    // Set logout flag to prevent auto-reconnect on refresh
    localStorage.setItem('wallet_logged_out', 'true')
  }

  const handleCreateGame = async () => {
    setError(null)
    setIsCreatingLobby(true)

    try {
      const hostName = playerName.trim() || 'Player 1'
      
      // Call API to create lobby
      const lobby = await createLobby({
        playerName: hostName,
        publicKey: walletAddress
      })
      
      console.log('Lobby created:', lobby)
      
      // Navigate to lobby waiting screen
      onJoinLobby({
        gameId: lobby.gameId,
        playerName: hostName,
        walletAddress: walletAddress,
        isHost: true
      })
    } catch (err) {
      setError(err.message || 'Failed to create lobby')
      console.error('Error creating lobby:', err)
      setIsCreatingLobby(false)
    }
  }

  const handleStartGame = async () => {
    setError(null)
    setIsStartingGame(true)

    try {
      // Call API to start the game (close the lobby)
      await startGame(generatedCode)
      
      console.log('Game started for lobby:', generatedCode)
      
      // Initialize local game state
      const hostName = playerName.trim() || 'Player 1'
      resetGame(playerCount, hostName)
      
      // Store gameId in the game store so API calls work
      setGameId(generatedCode)
      
      // Navigate to game screen
      onNavigate('game')
    } catch (err) {
      setError(err.message || 'Failed to start game')
      console.error('Error starting game:', err)
      setIsStartingGame(false)
    }
  }

  const handleJoinGame = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setError(null)
    setIsJoining(true)

    try {
      const joiningPlayerName = playerName.trim() || 'Player'
      
      // Call API to join lobby
      await joinLobby(roomCode, {
        playerName: joiningPlayerName,
        publicKey: walletAddress
      })
      
      console.log('Joined lobby:', roomCode)
      
      // Navigate to lobby waiting screen
      onJoinLobby({
        gameId: roomCode,
        playerName: joiningPlayerName,
        walletAddress: walletAddress,
        isHost: false
      })
    } catch (err) {
      setError(err.message || 'Failed to join lobby')
      console.error('Error joining lobby:', err)
      setIsJoining(false)
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
          [ARKIV + SALAD EDITION]
        </p>

        {/* MetaMask Login Screen - Show when not connected */}
        {!walletAddress && (
          <div className="border-2 border-cyber-pink p-8 md:p-12 space-y-8">
            <div className="text-center space-y-4">
              <div className="mb-4 flex justify-center">
                <svg 
                  ref={foxRef}
                  width="120" 
                  height="120" 
                  viewBox="0 0 120 120"
                  style={{
                    transform: `rotate(${getFoxRotation()}deg)`,
                    transition: 'transform 0.2s ease-out',
                    filter: 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.3))'
                  }}
                >
                  {/* Geometric cyberpunk fox */}
                  
                  {/* Main head - angular hexagon */}
                  <path d="M 35 35 L 30 55 L 40 75 L 80 75 L 90 55 L 85 35 Z" fill="#FF6B6B" />
                  
                  {/* Outer ear - left (connected to head) */}
                  <path d="M 35 35 L 25 10 L 40 25 Z" fill="#FF6B6B" />
                  
                  {/* Outer ear - right (connected to head) */}
                  <path d="M 85 35 L 95 10 L 80 25 Z" fill="#FF6B6B" />
                  
                  {/* Inner ear detail - left */}
                  <path d="M 35 32 L 30 18 L 38 28 Z" fill="#FF4757" />
                  
                  {/* Inner ear detail - right */}
                  <path d="M 85 32 L 90 18 L 82 28 Z" fill="#FF4757" />
                  
                  {/* Face white geometric shape */}
                  <path d="M 45 50 L 42 62 L 50 72 L 70 72 L 78 62 L 75 50 Z" fill="#F0F0F0" />
                  
                  {/* Eye - left (angular) */}
                  <polygon points="47,52 45,56 47,58 51,56" fill="#1a1a1a" />
                  
                  {/* Eye - right (angular) */}
                  <polygon points="73,52 75,56 73,58 69,56" fill="#1a1a1a" />
                  
                  {/* Nose - geometric triangle */}
                  <path d="M 60 62 L 57 67 L 63 67 Z" fill="#1a1a1a" />
                  
                  {/* Geometric accent lines */}
                  <line x1="42" y1="48" x2="38" y2="52" stroke="#FF4757" strokeWidth="2" strokeLinecap="round" />
                  <line x1="78" y1="48" x2="82" y2="52" stroke="#FF4757" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Bottom geometric details */}
                  <path d="M 45 75 L 48 78 L 52 78" stroke="#FF4757" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 75 75 L 72 78 L 68 78" stroke="#FF4757" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-cyber-green font-mono">
                CONNECT WALLET
              </h2>
              <p className="text-cyber-blue font-mono text-sm md:text-base">
                Connect your MetaMask wallet to enter the game
              </p>
            </div>

            {error && (
              <div className="p-4 border-2 border-red-500 bg-red-500/10">
                <p className="text-red-500 font-mono text-sm text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {!isMetaMaskInstalled() ? (
              <div className="space-y-4">
                <p className="text-cyber-pink font-mono text-sm text-center">
                  MetaMask is not installed
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-btn text-cyber-pink border-cyber-pink w-full block text-center"
                >
                  Install MetaMask
                </a>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="neon-btn text-cyber-green border-cyber-green w-full pulse-green"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT METAMASK'}
              </button>
            )}

            <div className="border-t-2 border-cyber-blue/30 pt-6 mt-6">
              <p className="text-cyber-green text-xs font-mono opacity-70 text-center">
                &gt; Your wallet address will be used as your player ID
              </p>
              <p className="text-cyber-green text-xs font-mono opacity-70 text-center mt-1">
                &gt; No transactions required to play
              </p>
            </div>
          </div>
        )}

        {/* Game Creation/Join UI - Show when wallet is connected */}
        {walletAddress && (
          <>
            {/* Wallet Status */}
            <div className="mb-6 p-4 border-2 border-cyber-green bg-cyber-green/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyber-green animate-pulse"></div>
                  <span className="text-cyber-green font-mono text-sm">
                    WALLET CONNECTED
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyber-green font-mono text-sm">
                    {formatAddress(walletAddress)}
                  </span>
                  <button
                    onClick={handleDisconnect}
                    className="text-cyber-pink hover:text-red-500 transition-colors text-xs font-mono underline"
                    title="Disconnect wallet"
                  >
                    LOGOUT
                  </button>
                </div>
              </div>
            </div>

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
            <div className="space-y-4 mb-6">
              <label className="block text-cyber-blue font-mono text-sm">
                YOUR NAME
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter your name..."
                className="w-full bg-cyber-darker border-2 border-cyber-blue p-4 text-cyber-blue font-mono focus:outline-none focus:border-cyber-green placeholder-cyber-blue/30"
              />
            </div>
            
            {error && (
              <div className="p-4 border-2 border-red-500 bg-red-500/10 mb-4">
                <p className="text-red-500 font-mono text-sm text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}
            
            <p className="text-cyber-blue text-center mb-6 font-mono text-sm">
              Create a new game lobby and invite friends
            </p>
            <button
              onClick={handleCreateGame}
              disabled={isCreatingLobby}
              className={`neon-btn w-full relative overflow-hidden ${
                isCreatingLobby
                  ? 'text-cyber-blue border-cyber-blue animate-pulse'
                  : 'text-cyber-blue border-cyber-blue'
              }`}
            >
              {isCreatingLobby && (
                <>
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/20 to-transparent animate-scan" />
                  {/* Loading spinner */}
                  <span className="inline-block animate-spin mr-2">⚙</span>
                </>
              )}
              {isCreatingLobby ? 'CREATING LOBBY' : 'Create Lobby'}
              {isCreatingLobby && <span className="animate-dots">...</span>}
            </button>
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

            {error && tab === 'join' && (
              <div className="p-4 border-2 border-red-500 bg-red-500/10 mb-4">
                <p className="text-red-500 font-mono text-sm text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <p className="text-cyber-pink text-center mb-6 font-mono text-sm">
              Enter the room code shared by the host
            </p>

            <button
              onClick={handleJoinGame}
              disabled={!roomCode.trim() || isJoining}
              className={`neon-btn w-full relative overflow-hidden ${
                isJoining
                  ? 'text-cyber-pink border-cyber-pink animate-pulse'
                  : roomCode.trim()
                  ? 'text-cyber-pink border-cyber-pink'
                  : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
              }`}
            >
              {isJoining && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-pink/20 to-transparent animate-scan" />
                  <span className="inline-block animate-spin mr-2">⚙</span>
                </>
              )}
              {isJoining ? 'JOINING LOBBY' : 'Join Lobby'}
              {isJoining && <span className="animate-dots">...</span>}
            </button>
          </div>
        )}
          </>
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
