import { useState } from 'react'
import saladLogo from './salad.svg'
import arkivLogo from './arkiv.png'
import HelpModal from './HelpModal'

export default function LandingScreen({ onNavigate }) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-12">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold glitch text-cyber-blue mb-8">
          S3TTLΞ
        </h1>
        
        <p className="text-xl md:text-2xl text-cyber-pink font-mono tracking-wider">
          [MULTIPLAYER EDITION]
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-12">
          <button
            onClick={() => onNavigate('createjoin', 'create')}
            className="neon-btn text-cyber-blue border-cyber-blue hover:text-cyber-blue text-lg md:text-xl w-64"
          >
            Create Game
          </button>
          
          <button
            onClick={() => onNavigate('createjoin', 'join')}
            className="neon-btn text-cyber-pink border-cyber-pink hover:text-cyber-pink text-lg md:text-xl w-64"
          >
            Join Game
          </button>
        </div>

        {/* Subtitle */}
        <div className="mt-16 text-cyber-green text-sm md:text-base font-mono opacity-70">
          <p>&gt; 2-4 PLAYERS</p>
          <p>&gt; FIRST TO 10 VICTORY POINTS</p>
          <p>&gt; REAL-TIME MULTIPLAYER</p>
          <button 
            onClick={() => setShowHelp(true)}
            className="text-cyber-blue hover:text-cyber-pink transition-colors underline text-sm mt-3"
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
