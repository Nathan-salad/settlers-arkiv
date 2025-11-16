import ResourceIcon from './ResourceIcon'
import useGameStore from '../store/gameStore'

export default function ScoreSheet({ players, currentPlayerId, onClose }) {
  const { longestRoadHolder, largestArmyHolder } = useGameStore()
  
  // Island Two scoring categories
  // Ordered: Roads, Knights, Settlements, Cities (matches UI)
  const scoreCategories = [
    { 
      id: 'roads', 
      label: 'Roads', 
      icon: 'lumber',
      description: '0 VP (bonus only)',
      pointValue: 0,
      maxCount: 15
    },
    { 
      id: 'knights', 
      label: 'Knights', 
      icon: 'wool',
      description: '0 VP (bonus only)',
      pointValue: 0,
      maxCount: 14
    },
    { 
      id: 'settlements', 
      label: 'Settlements', 
      icon: 'wheat',
      description: '1 VP each',
      pointValue: 1,
      maxCount: 5
    },
    { 
      id: 'cities', 
      label: 'Cities', 
      icon: 'ore',
      description: '2 VP each',
      pointValue: 2,
      maxCount: 4
    },
    { 
      id: 'longestRoad', 
      label: 'Longest Road', 
      icon: 'brick',
      description: '5+ roads',
      bonus: true,
      bonusValue: 2
    },
    { 
      id: 'largestArmy', 
      label: 'Largest Army', 
      icon: 'gold',
      description: '3+ knights',
      bonus: true,
      bonusValue: 2
    }
  ]

  const getPlayerCategoryScore = (player, category) => {
    if (category.bonus) {
      // Check for special bonuses
      if (category.id === 'longestRoad') {
        return longestRoadHolder === player.id ? category.bonusValue : 0
      }
      if (category.id === 'largestArmy') {
        return largestArmyHolder === player.id ? category.bonusValue : 0
      }
      return 0
    }
    
    // Regular builds
    const count = player[category.id] || 0
    return count * category.pointValue
  }
  
  const getPlayerCategoryCount = (player, category) => {
    if (category.bonus) {
      return getPlayerCategoryScore(player, category) > 0 ? '✓' : '-'
    }
    return player[category.id] || 0
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
                            {category.bonus 
                              ? `Bonus: ${category.bonusValue} VP`
                              : `Max: ${category.maxCount}`
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    {players.map(player => {
                      const count = getPlayerCategoryCount(player, category)
                      const score = getPlayerCategoryScore(player, category)
                      const maxValue = category.bonus ? category.bonusValue : (category.maxCount * category.pointValue)
                      const percentage = maxValue > 0 ? (score / maxValue) * 100 : 0
                      
                      return (
                        <td key={player.id} className="p-4 text-center">
                          <div className="relative">
                            <div className="text-xs text-cyber-blue/70 mb-1">
                              {count} {category.bonus ? '' : `× ${category.pointValue} VP`}
                            </div>
                            <div className="text-2xl font-bold text-cyber-green mb-1">
                              {score}
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1 bg-cyber-darker rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyber-green transition-all duration-300"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
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
                        {player.score || 0}
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
              [SCORE RULES]
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-cyber-blue/70 font-mono">
              <div>
                <span className="text-cyber-pink">Settlements:</span> 1 VP each (max 5)
              </div>
              <div>
                <span className="text-cyber-pink">Cities:</span> 2 VP each (max 4)
              </div>
              <div>
                <span className="text-cyber-pink">Roads:</span> 0 VP individually (max 15)
              </div>
              <div>
                <span className="text-cyber-pink">Knights:</span> 0 VP individually (max 14)
              </div>
              <div>
                <span className="text-cyber-green">Longest Road:</span> +2 VP (5+ roads, first to reach)
              </div>
              <div>
                <span className="text-cyber-green">Largest Army:</span> +2 VP (3+ knights, first to reach)
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
