import { useState, useEffect } from 'react'
import { getLobby, startGame } from '../api/apiClient'
import { formatAddress } from '../utils/metamask'

export default function LobbyWaitingScreen({ gameId, playerName, walletAddress, isHost, onStartGame, onBack }) {
  const [lobby, setLobby] = useState(null)
  const [localBots, setLocalBots] = useState([]) // Client-side only bots
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState(null)

  // Poll for lobby updates
  useEffect(() => {
    let isActive = true

    const fetchLobby = async () => {
      try {
        const lobbyData = await getLobby(gameId)
        if (isActive) {
          setLobby(lobbyData)
          setIsLoading(false)
        }
      } catch (err) {
        if (isActive) {
          setError(err.message)
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchLobby()

    // Poll every 2 seconds for updates
    const interval = setInterval(fetchLobby, 2000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [gameId])

  const handleAddBot = () => {
    setError(null)
    
    // Cool bot names
    const botNames = [
      'RoboBuilder 🤖',
      'DiceKnight 🎲',
      'SettleBot 3000',
      'Captain Catan 🏴‍☠️',
      'The Architect 🏗️',
      'Road Warrior 🛣️',
      'Trade Master 📈',
      'Resource Lord 💎'
    ]
    
    // Pick a random name that hasn't been used yet
    const usedNames = localBots.map(b => b.playerName)
    const availableNames = botNames.filter(name => !usedNames.includes(name))
    const randomIndex = Math.floor(Math.random() * availableNames.length)
    const botName = availableNames[randomIndex] || `Bot ${localBots.length + 1}`
    
    const newBot = {
      playerName: botName,
      publicKey: `BOT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      isBot: true
    }
    
    setLocalBots([...localBots, newBot])
  }

  const handleStartGame = async () => {
    const totalPlayers = (lobby?.players.length || 0) + localBots.length
    
    if (totalPlayers < 2) {
      setError('Need at least 2 players to start')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      await startGame(gameId)
      // Pass bots and lobby players to the game
      onStartGame(localBots, lobby?.players || [])
    } catch (err) {
      setError(err.message)
      setIsStarting(false)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-blue font-mono">Loading lobby...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-cyber-blue mb-2 text-center font-mono">
          GAME LOBBY
        </h1>
        
        <p className="text-cyber-pink font-mono text-center mb-8">
          {isHost ? 'Waiting for players to join...' : 'Waiting for host to start...'}
        </p>

        {/* Room Code Display */}
        <div className="border-2 border-cyber-pink p-6 mb-6">
          <div className="text-center space-y-4">
            <p className="text-cyber-green font-mono text-sm">ROOM CODE:</p>
            <div className="text-4xl font-bold text-cyber-pink tracking-widest">
              {gameId}
            </div>
            <button
              onClick={copyRoomCode}
              className="text-cyber-blue hover:text-cyber-green transition-colors text-sm font-mono underline"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-500/10">
            <p className="text-red-500 font-mono text-sm text-center">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Players List */}
        <div className="border-2 border-cyber-blue p-6 mb-6">
          <h2 className="text-cyber-blue font-mono mb-4 text-center">
            PLAYERS ({(lobby?.players.length || 0) + localBots.length}/4)
          </h2>
          
          <div className="space-y-3">
            {/* Real players */}
            {lobby?.players.map((player, index) => (
              <div
                key={player.publicKey}
                className="flex items-center justify-between p-3 border border-cyber-blue/30 bg-cyber-blue/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-blue flex items-center justify-center text-cyber-dark font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-cyber-blue font-mono">
                      {player.playerName}
                      {player.publicKey === walletAddress && (
                        <span className="ml-2 text-cyber-green">(You)</span>
                      )}
                      {player.publicKey === lobby.hostPublicKey && (
                        <span className="ml-2 text-cyber-pink">(Host)</span>
                      )}
                    </div>
                    <div className="text-xs text-cyber-blue/50 font-mono">
                      {formatAddress(player.publicKey)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bot players */}
            {localBots.map((bot, index) => (
              <div
                key={bot.publicKey}
                className="flex items-center justify-between p-3 border border-cyber-purple/30 bg-cyber-purple/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-purple flex items-center justify-center text-cyber-dark font-bold">
                    {(lobby?.players.length || 0) + index + 1}
                  </div>
                  <div>
                    <div className="text-cyber-purple font-mono">
                      {bot.playerName}
                      <span className="ml-2 text-cyber-purple/70">(AI Bot)</span>
                    </div>
                    <div className="text-xs text-cyber-purple/50 font-mono">
                      {formatAddress(bot.publicKey)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Bot Button - Only for host */}
          {isHost && lobby && ((lobby.players.length + localBots.length) < 4) && (
            <button
              onClick={handleAddBot}
              className="neon-btn w-full mt-4 text-cyber-purple border-cyber-purple"
            >
              + Add Bot Player
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="neon-btn text-cyber-pink border-cyber-pink flex-1"
          >
            Leave Lobby
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={isStarting || ((lobby?.players.length || 0) + localBots.length < 2)}
              className={`neon-btn flex-1 relative overflow-hidden ${
                isStarting
                  ? 'text-cyber-green border-cyber-green animate-pulse'
                  : ((lobby?.players.length || 0) + localBots.length >= 2)
                  ? 'text-cyber-green border-cyber-green pulse-green'
                  : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
              }`}
            >
              {isStarting && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent animate-scan" />
                  <span className="inline-block animate-spin mr-2">⚙</span>
                </>
              )}
              {isStarting ? 'STARTING GAME' : 'Start Game'}
              {isStarting && <span className="animate-dots">...</span>}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-cyber-green text-xs font-mono opacity-70">
          {((lobby?.players.length || 0) + localBots.length < 2) && (
            <p>&gt; Need at least 2 players to start</p>
          )}
          {((lobby?.players.length || 0) + localBots.length >= 2) && !isHost && (
            <p>&gt; Waiting for host to start the game...</p>
          )}
        </div>
      </div>
    </div>
  )
}
