import ResourceIcon from './ResourceIcon'

export default function ScoreSheet({ players, currentPlayerId, onClose }) {
  // Scoring categories based on Catan Dice Game rules
  const scoreCategories = [
    { 
      id: 'roads', 
      label: 'Roads', 
      icon: 'lumber',
      description: 'Longest road network',
      maxScore: 10 
    },
    { 
      id: 'settlements', 
      label: 'Settlements', 
      icon: 'wheat',
      description: 'Settlement locations',
      maxScore: 15 
    },
    { 
      id: 'cities', 
      label: 'Cities', 
      icon: 'ore',
      description: 'Upgraded settlements',
      maxScore: 20 
    },
    { 
      id: 'knights', 
      label: 'Knights', 
      icon: 'wool',
      description: 'Largest army',
      maxScore: 13 
    },
    { 
      id: 'bonus', 
      label: 'Bonus Points', 
      icon: 'gold',
      description: 'Special achievements',
      maxScore: 5 
    }
  ]

  const calculateCategoryScore = (player, category) => {
    // Use player's actual score for now
    // TODO: Break down score by category when backend tracks individual builds per player
    
    // For demo, distribute score across categories proportionally
    const totalScore = player.score || 0
    
    switch(category) {
      case 'roads':
        return Math.floor(totalScore * 0.15) // ~15% of total
      case 'settlements':
        return Math.floor(totalScore * 0.25) // ~25% of total
      case 'cities':
        return Math.floor(totalScore * 0.35) // ~35% of total
      case 'knights':
        return Math.floor(totalScore * 0.20) // ~20% of total
      case 'bonus':
        return Math.floor(totalScore * 0.05) // ~5% of total
      default:
        return 0
    }
  }

  const calculateTotal = (player) => {
    return scoreCategories.reduce((sum, cat) => 
      sum + calculateCategoryScore(player, cat.id), 0
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-cyber-darker border-4 border-cyber-purple rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cyber-darker border-b-2 border-cyber-purple p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyber-purple font-mono">
            [SCORE SHEET]
          </h2>
          <button
            onClick={onClose}
            className="text-cyber-pink hover:text-cyber-blue text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Score Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="border-b-2 border-cyber-blue">
                  <th className="text-left p-4 text-cyber-blue font-mono">
                    CATEGORY
                  </th>
                  {players.map(player => (
                    <th 
                      key={player.id}
                      className={`text-center p-4 font-mono ${
                        player.id === currentPlayerId 
                          ? 'text-cyber-green' 
                          : 'text-cyber-blue'
                      }`}
                    >
                      <div className="text-sm mb-1">{player.name}</div>
                      {player.id === currentPlayerId && (
                        <div className="text-xs text-cyber-green/70">[ACTIVE]</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {scoreCategories.map((category, idx) => (
                  <tr 
                    key={category.id}
                    className={`border-b border-cyber-blue/30 ${
                      idx % 2 === 0 ? 'bg-cyber-blue/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ResourceIcon resource={category.icon} size="sm" />
                        <div>
                          <div className="font-bold text-cyber-pink">
                            {category.label}
                          </div>
                          <div className="text-xs text-cyber-blue/70 font-mono">
                            {category.description}
                          </div>
                          <div className="text-xs text-cyber-green/50 font-mono mt-1">
                            Max: {category.maxScore} pts
                          </div>
                        </div>
                      </div>
                    </td>
                    {players.map(player => {
                      const score = calculateCategoryScore(player, category.id)
                      const percentage = (score / category.maxScore) * 100
                      
                      return (
                        <td key={player.id} className="p-4 text-center">
                          <div className="relative">
                            <div className="text-2xl font-bold text-cyber-green mb-1">
                              {score}
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1 bg-cyber-darker rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyber-green transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="border-t-4 border-cyber-purple bg-cyber-purple/10">
                  <td className="p-4">
                    <div className="font-bold text-xl text-cyber-purple font-mono">
                      TOTAL SCORE
                    </div>
                  </td>
                  {players.map(player => (
                    <td key={player.id} className="p-4 text-center">
                      <div className="text-4xl font-bold text-cyber-purple">
                        {calculateTotal(player)}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 border-2 border-cyber-blue/30 rounded-lg">
            <h3 className="text-sm font-bold text-cyber-blue mb-3 font-mono">
              [SCORING GUIDE]
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-cyber-blue/70 font-mono">
              <div>
                <span className="text-cyber-pink">Roads:</span> 1 point each (max 10)
              </div>
              <div>
                <span className="text-cyber-pink">Settlements:</span> 3 points each (max 15)
              </div>
              <div>
                <span className="text-cyber-pink">Cities:</span> 5 points each (max 20)
              </div>
              <div>
                <span className="text-cyber-pink">Knights:</span> 2 points each (max 13)
              </div>
              <div className="md:col-span-2">
                <span className="text-cyber-pink">Bonus:</span> Longest road, largest army, etc.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cyber-darker border-t-2 border-cyber-purple p-6">
          <button
            onClick={onClose}
            className="neon-btn text-cyber-purple border-cyber-purple w-full"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
