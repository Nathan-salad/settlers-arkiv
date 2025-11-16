import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import GameTable from './components/GameTable'
import ResultsScreen from './components/ResultsScreen'

function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'game' | 'results'

  return (
    <div className="min-h-screen cyber-grid">
      {screen === 'landing' && <LandingScreen onNavigate={setScreen} />}
      {screen === 'game' && <GameTable onNavigate={setScreen} />}
      {screen === 'results' && <ResultsScreen onNavigate={setScreen} />}
    </div>
  )
}

export default App
