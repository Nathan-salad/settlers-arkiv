import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import useGameStore from '../store/gameStore'

export default function ResultsScreen({ onNavigate }) {
  const { players, resetGame, longestRoadHolder, largestArmyHolder } = useGameStore()

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000
    const end = Date.now() + duration

    const colors = ['#00d4ff', '#b800e6', '#ff00ff', '#39ff14']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  const handlePlayAgain = () => {
    resetGame()
    onNavigate('game')
  }

  const getRankColor = (rank) => {
    switch(rank) {
      case 0: return 'text-cyber-green'
      case 1: return 'text-cyber-blue'
      case 2: return 'text-cyber-purple'
      case 3: return 'text-cyber-pink'
      default: return 'text-gray-400'
    }
  }

  const getRankLabel = (rank) => {
    switch(rank) {
      case 0: return '1ST PLACE'
      case 1: return '2ND PLACE'
      case 2: return '3RD PLACE'
      case 3: return '4TH PLACE'
      default: return `${rank + 1}TH PLACE`
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 glitch text-cyber-green">
          GAME OVER
        </h1>
        <p className="text-center text-cyber-blue text-xl mb-12 font-mono">
          [FINAL RANKINGS]
        </p>

        {/* Rankings */}
        <div className="space-y-4 mb-12">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`bg-cyber-darker border-4 p-6 rounded-lg transition-all ${
                index === 0
                  ? 'border-cyber-green shadow-[0_0_30px_rgba(57,255,20,0.5)]'
                  : 'border-cyber-blue/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${getRankColor(index)}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className={`text-sm font-mono mb-1 ${getRankColor(index)}`}>
                        {getRankLabel(index)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-cyber-blue">
                          {player.name}
                        </div>
                        {/* Badges */}
                        {longestRoadHolder === player.id && (
                          <div className="inline-flex items-center gap-1 bg-cyber-blue/20 border border-cyber-blue text-cyber-blue px-2 py-0.5 rounded text-xs font-bold">
                            <span>|:|</span>
                            <span>LONGEST</span>
                          </div>
                        )}
                        {largestArmyHolder === player.id && (
                          <div className="inline-flex items-center gap-1 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink px-2 py-0.5 rounded text-xs font-bold">
                            <span>{'>'}X{'<'}</span>
                            <span>ARMY</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-cyber-pink font-mono mb-1">FINAL SCORE</div>
                    <div className={`text-4xl font-bold ${getRankColor(index)}`}>
                      {player.score}
                    </div>
                  </div>
                </div>
                
                {/* Player Stats */}
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-cyber-blue/30">
                  <div className="text-center">
                    <div className="text-xs text-cyber-blue/70 font-mono mb-1">Roads</div>
                    <div className="text-lg font-bold text-cyber-blue">
                      |:| {player.roads || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyber-pink/70 font-mono mb-1">Knights</div>
                    <div className="text-lg font-bold text-cyber-pink">
                      {'>'}X{'<'} {player.knights || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyber-green/70 font-mono mb-1">Settlements</div>
                    <div className="text-lg font-bold text-cyber-green">
                      /^\ {player.settlements || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyber-purple/70 font-mono mb-1">Cities</div>
                    <div className="text-lg font-bold text-cyber-purple">
                      [#] {player.cities || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handlePlayAgain}
            className="neon-btn text-cyber-green border-cyber-green flex-1 text-xl"
          >
            Play Again
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="neon-btn text-cyber-pink border-cyber-pink flex-1 text-xl"
          >
            Return to Landing
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 text-center text-cyber-blue/50 font-mono text-sm">
          <p>Total Turns Played: {sortedPlayers[0]?.turnsCompleted || 15}</p>
          <p className="mt-2">Thank you for playing!</p>
        </div>
      </div>
    </div>
  )
}
