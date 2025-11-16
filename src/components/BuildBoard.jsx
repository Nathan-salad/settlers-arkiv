import ResourceIcon from './ResourceIcon'

/**
 * Visual representation of player's built structures
 * Lo-fi cyberpunk grid showing progress
 */
export default function BuildBoard({ builds, playerName }) {
  // Ordered: Roads, Knights, Settlements, Cities (matches build actions)
  const buildItems = [
    { 
      type: 'roads', 
      label: 'Roads', 
      icon: 'lumber',
      color: 'cyber-blue',
      max: 15  // Updated to match Catan rules
    },
    { 
      type: 'knights', 
      label: 'Knights', 
      icon: 'wool',
      color: 'cyber-pink',
      max: 14  // Updated to match Catan rules
    },
    { 
      type: 'settlements', 
      label: 'Settlements', 
      icon: 'wheat',
      color: 'cyber-green',
      max: 5 
    },
    { 
      type: 'cities', 
      label: 'Cities', 
      icon: 'ore',
      color: 'cyber-purple',
      max: 4 
    }
  ]

  return (
    <div className="bg-cyber-darker border-2 border-cyber-blue p-6 rounded-lg">
      <h3 className="text-xl font-bold text-cyber-blue mb-4 font-mono">
        [BUILD PROGRESS]
      </h3>
      
      <div className="space-y-4">
        {buildItems.map(item => {
          const count = builds[item.type] || 0
          const percentage = (count / item.max) * 100
          
          return (
            <div key={item.type}>
              {/* Label & Count */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ResourceIcon resource={item.icon} size="sm" />
                  <span className={`text-${item.color} font-mono text-sm font-bold`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-${item.color} font-mono text-lg font-bold`}>
                  {count}/{item.max}
                </span>
              </div>
              
              {/* Visual grid */}
              <div className="flex gap-1">
                {Array.from({ length: item.max }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-6 border-2 rounded transition-all duration-300 ${
                      idx < count
                        ? `border-${item.color} bg-${item.color}/30 shadow-[0_0_10px_rgba(0,212,255,0.3)]`
                        : 'border-gray-600 bg-gray-800/20'
                    }`}
                  >
                    {idx < count && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`w-2 h-2 bg-${item.color} rounded-full`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Progress percentage */}
              <div className="mt-1 text-right">
                <span className="text-xs text-cyber-blue/50 font-mono">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total builds summary */}
      <div className="mt-6 pt-4 border-t-2 border-cyber-blue/30">
        <div className="flex justify-between items-center">
          <span className="text-cyber-pink font-mono text-sm">TOTAL BUILDS</span>
          <span className="text-cyber-green font-mono text-2xl font-bold">
            {Object.values(builds).reduce((sum, val) => sum + val, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
