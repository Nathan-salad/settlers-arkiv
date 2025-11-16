import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import CreateJoinScreen from './components/CreateJoinScreen'
import GameTable from './components/GameTable'
import ResultsScreen from './components/ResultsScreen'

function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'createjoin' | 'game' | 'results'
  const [initialTab, setInitialTab] = useState('create') // 'create' | 'join'

  const handleNavigate = (newScreen, tab) => {
    setScreen(newScreen)
    if (tab) setInitialTab(tab)
  }

  return (
    <div className="min-h-screen cyber-grid">
      {screen === 'landing' && <LandingScreen onNavigate={handleNavigate} />}
      {screen === 'createjoin' && <CreateJoinScreen onNavigate={handleNavigate} initialTab={initialTab} />}
      {screen === 'game' && <GameTable onNavigate={handleNavigate} />}
      {screen === 'results' && <ResultsScreen onNavigate={handleNavigate} />}
    </div>
  )
}

export default App
