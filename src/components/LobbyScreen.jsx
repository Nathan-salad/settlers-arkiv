import { useState } from 'react'
import useGameStore from '../store/gameStore'

export default function LobbyScreen({ onNavigate, roomCode }) {
  const [lobbyPlayers, setLobbyPlayers] = useState([
    { id: '1', name: 'Player 1', isHost: true }
  ])
  
  const { resetGame } = useGameStore()
  
  const addPlayer = () => {
    if (lobbyPlayers.length < 4) {
      const newPlayer = {
        id: String(lobbyPlayers.length + 1),
        name: `Player ${lobbyPlayers.length + 1}`,
        isHost: false
      }
      setLobbyPlayers([...lobbyPlayers, newPlayer])
    }
  }
  
  const removePlayer = (playerId) => {
    if (lobbyPlayers.find(p => p.id === playerId)?.isHost) {
      return // Can't remove host
    }
    setLobbyPlayers(lobbyPlayers.filter(p => p.id !== playerId))
  }
  
  const handleStartGame = () => {
    // Initialize game with current lobby players
    resetGame(lobbyPlayers.length, lobbyPlayers)
    onNavigate('game')
  }
  
  const canStart = lobbyPlayers.length >= 2 && lobbyPlayers.length <= 4
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => onNavigate('createjoin')}
          className="text-cyber-blue hover:text-cyber-pink mb-8 text-sm font-mono"
        >
          &lt; BACK TO LOBBY
        </button>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-cyber-blue mb-4 text-center glitch">
          [GAME LOBBY]
        </h2>
        
        {/* Room Code Display */}
        <div className="text-center mb-8">
          <p className="text-cyber-green font-mono text-sm mb-2">ROOM CODE:</p>
          <div className="text-3xl font-bold text-cyber-pink tracking-widest">
            {roomCode}
          </div>
          <p className="text-cyber-blue/70 text-xs font-mono mt-2">
            Share this code with friends to join
          </p>
        </div>

        {/* Player Count */}
        <div className="text-center mb-8">
          <div className="inline-block bg-cyber-darker border-2 border-cyber-green px-6 py-3 rounded-lg">
            <span className="text-cyber-green text-2xl font-bold font-mono">
              {lobbyPlayers.length}/4
            </span>
            <span className="text-cyber-blue text-sm font-mono ml-2">PLAYERS</span>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-cyber-darker border-2 border-cyber-blue p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold text-cyber-blue mb-4 font-mono">[PLAYERS IN LOBBY]</h3>
          <div className="space-y-3">
            {lobbyPlayers.map(player => (
              <div
                key={player.id}
                className="flex justify-between items-center p-4 border-2 border-cyber-green rounded bg-cyber-green/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyber-green animate-pulse"></div>
                  <div>
                    <div className="font-bold text-cyber-blue">{player.name}</div>
                    <div className="text-xs text-cyber-pink font-mono">
                      {player.isHost ? '👑 HOST' : 'PLAYER'}
                    </div>
                  </div>
                </div>
                {!player.isHost && (
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-cyber-pink hover:text-cyber-blue text-sm font-mono"
                  >
                    KICK
                  </button>
                )}
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - lobbyPlayers.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-4 border-2 border-cyber-blue/30 border-dashed rounded"
              >
                <div className="text-center text-cyber-blue/50 font-mono text-sm">
                  Waiting for player...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Add Player Button (for testing) */}
          {lobbyPlayers.length < 4 && (
            <button
              onClick={addPlayer}
              className="neon-btn text-cyber-blue border-cyber-blue w-full"
            >
              + Add Player (Test)
            </button>
          )}
          
          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`neon-btn w-full ${
              canStart
                ? 'text-cyber-green border-cyber-green pulse-green'
                : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
            }`}
          >
            {canStart 
              ? '▶ START GAME' 
              : `NEED ${2 - lobbyPlayers.length} MORE PLAYER${2 - lobbyPlayers.length !== 1 ? 'S' : ''}`
            }
          </button>
          
          <div className="text-center text-cyber-blue/70 text-xs font-mono">
            {canStart 
              ? 'All players ready! Click to begin.'
              : 'Minimum 2 players required to start'}
          </div>
        </div>
      </div>
    </div>
  )
}
