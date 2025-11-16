import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import LobbyWaitingScreen from './components/LobbyWaitingScreen'
import GameTable from './components/GameTable'
import ResultsScreen from './components/ResultsScreen'
import useGameStore from './store/gameStore'

function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'lobby' | 'game' | 'results'
  const [lobbyData, setLobbyData] = useState(null)
  const [bots, setBots] = useState([])
  const { resetGame, setGameId } = useGameStore()

  const handleJoinLobby = (data) => {
    setLobbyData(data)
    setScreen('lobby')
  }

  const handleStartGame = (botPlayers = [], lobbyPlayers = []) => {
    setBots(botPlayers)
    
    // Initialize game with player name and bots
    if (lobbyData) {
      // Create player data array with names
      const playerData = []
      
      // Add the host (you)
      playerData.push({
        name: lobbyData.playerName,
        playerName: lobbyData.playerName,
        publicKey: lobbyData.walletAddress,
        isBot: false
      })
      
      // Add other real players from lobby (if any)
      lobbyPlayers.forEach(player => {
        if (player.publicKey !== lobbyData.walletAddress) {
          playerData.push({
            name: player.playerName,
            playerName: player.playerName,
            publicKey: player.publicKey,
            isBot: false
          })
        }
      })
      
      // Add bots with their names
      botPlayers.forEach(bot => {
        playerData.push({
          name: bot.playerName,
          playerName: bot.playerName,
          publicKey: bot.publicKey,
          isBot: true
        })
      })
      
      resetGame(playerData)
      setGameId(lobbyData.gameId)
    }
    
    setScreen('game')
  }

  const handleLeaveLobby = () => {
    setLobbyData(null)
    setScreen('landing')
  }

  return (
    <div className="min-h-screen cyber-grid">
      {screen === 'landing' && <LandingScreen onNavigate={setScreen} onJoinLobby={handleJoinLobby} />}
      {screen === 'lobby' && lobbyData && (
        <LobbyWaitingScreen 
          gameId={lobbyData.gameId}
          playerName={lobbyData.playerName}
          walletAddress={lobbyData.walletAddress}
          isHost={lobbyData.isHost}
          onStartGame={handleStartGame}
          onBack={handleLeaveLobby}
        />
      )}
      {screen === 'game' && <GameTable onNavigate={setScreen} bots={bots} />}
      {screen === 'results' && <ResultsScreen onNavigate={setScreen} />}
    </div>
  )
}

export default App
