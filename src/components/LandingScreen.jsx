export default function LandingScreen({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-12">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold glitch text-cyber-blue mb-8">
          CATAN DICE
        </h1>
        
        <p className="text-xl md:text-2xl text-cyber-pink font-mono tracking-wider">
          [MULTIPLAYER EDITION]
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-12">
          <button
            onClick={() => onNavigate('createjoin')}
            className="neon-btn text-cyber-blue border-cyber-blue hover:text-cyber-blue text-lg md:text-xl w-64"
          >
            Create Game
          </button>
          
          <button
            onClick={() => onNavigate('createjoin')}
            className="neon-btn text-cyber-pink border-cyber-pink hover:text-cyber-pink text-lg md:text-xl w-64"
          >
            Join Game
          </button>
        </div>

        {/* Subtitle */}
        <div className="mt-16 text-cyber-green text-sm md:text-base font-mono opacity-70">
          <p>&gt; 2-4 PLAYERS</p>
          <p>&gt; 15 TURNS</p>
          <p>&gt; REAL-TIME MULTIPLAYER</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 text-cyber-purple text-xs font-mono opacity-50">
        [ARKIV_v1.0]
      </div>
      
      <div className="absolute bottom-4 right-4 text-cyber-green text-xs font-mono opacity-50">
        [STATUS: ONLINE]
      </div>
    </div>
  )
}
