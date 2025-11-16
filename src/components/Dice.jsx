import ResourceIcon, { ResourceLabel } from './ResourceIcon'

export default function Dice({ value, locked, used, onToggleLock, isRolling }) {
  // Map dice values to Catan resources
  const resourceMap = {
    1: 'lumber',  // Wood
    2: 'brick',   // Clay/Brick
    3: 'wool',    // Sheep/Wool
    4: 'wheat',   // Grain/Wheat
    5: 'ore',     // Stone/Ore
    6: 'gold'     // Gold/Wildcard
  }

  const resource = resourceMap[value] || 'gold'

  const getBorderColor = () => {
    if (locked) return 'border-cyber-green'
    if (resource === 'lumber') return 'border-cyber-green/50'
    if (resource === 'brick') return 'border-cyber-pink/50'
    if (resource === 'wool') return 'border-white/50'
    if (resource === 'wheat') return 'border-yellow-400/50'
    if (resource === 'ore') return 'border-cyber-purple/50'
    if (resource === 'gold') return 'border-yellow-300/50'
    return 'border-cyber-blue'
  }

  return (
    <div
      onClick={onToggleLock}
      className={`
        relative w-20 h-20 md:w-24 md:h-24
        border-4 rounded-lg cursor-pointer
        transition-all duration-200
        ${getBorderColor()}
        ${
          locked
            ? 'bg-cyber-green/20 shadow-[0_0_20px_rgba(57,255,20,0.5)]'
            : used
            ? 'bg-gray-800/50 opacity-50'
            : 'bg-cyber-darker hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]'
        }
        ${isRolling ? 'dice-rolling' : ''}
        ${used ? 'cursor-not-allowed' : ''}
      `}
    >
      {/* Resource Icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <ResourceIcon resource={resource} size="md" />
        <div className="mt-1">
          <ResourceLabel resource={resource} />
        </div>
      </div>

      {/* Lock indicator */}
      {locked && (
        <div className="absolute -top-2 -right-2 bg-cyber-green text-cyber-dark rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          🔒
        </div>
      )}
      
      {/* Used indicator */}
      {used && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-cyber-pink text-2xl font-bold">✓</span>
        </div>
      )}
    </div>
  )
}
