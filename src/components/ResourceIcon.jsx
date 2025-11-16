/**
 * Lo-fi cyberpunk resource icons
 * Each resource has a distinct shape/pattern in the aesthetic
 */

export default function ResourceIcon({ resource, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const resources = {
    lumber: {
      color: 'text-cyber-green',
      bgColor: 'bg-cyber-green/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated tree/lumber */}
          <rect x="10" y="2" width="4" height="20" />
          <rect x="6" y="6" width="12" height="3" />
          <rect x="6" y="10" width="12" height="3" />
          <rect x="6" y="14" width="12" height="3" />
        </svg>
      )
    },
    brick: {
      color: 'text-cyber-pink',
      bgColor: 'bg-cyber-pink/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated brick pattern */}
          <rect x="2" y="2" width="8" height="6" />
          <rect x="14" y="2" width="8" height="6" />
          <rect x="8" y="9" width="8" height="6" />
          <rect x="2" y="16" width="8" height="6" />
          <rect x="14" y="16" width="8" height="6" />
        </svg>
      )
    },
    wool: {
      color: 'text-white',
      bgColor: 'bg-white/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated sheep/wool */}
          <rect x="6" y="8" width="12" height="8" />
          <rect x="4" y="10" width="2" height="4" />
          <rect x="18" y="10" width="2" height="4" />
          <rect x="8" y="4" width="8" height="4" />
          <rect x="8" y="16" width="3" height="4" />
          <rect x="13" y="16" width="3" height="4" />
        </svg>
      )
    },
    wheat: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated wheat stalk */}
          <rect x="11" y="12" width="2" height="10" />
          <rect x="7" y="8" width="4" height="2" />
          <rect x="13" y="8" width="4" height="2" />
          <rect x="7" y="4" width="4" height="2" />
          <rect x="13" y="4" width="4" height="2" />
          <rect x="9" y="10" width="6" height="2" />
        </svg>
      )
    },
    ore: {
      color: 'text-cyber-purple',
      bgColor: 'bg-cyber-purple/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated ore/crystal */}
          <polygon points="12,2 6,10 12,18 18,10" />
          <rect x="10" y="18" width="4" height="4" />
        </svg>
      )
    },
    gold: {
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-300/20',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          {/* Pixelated gold/wildcard */}
          <polygon points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8" />
        </svg>
      )
    }
  }

  const resourceData = resources[resource] || resources.gold

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center relative`}>
      <div className={`${resourceData.color} opacity-90`}>
        {resourceData.icon}
      </div>
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)'
        }} />
      </div>
    </div>
  )
}

// Resource name display
export function ResourceLabel({ resource }) {
  const labels = {
    lumber: 'LUMBER',
    brick: 'BRICK',
    wool: 'WOOL',
    wheat: 'WHEAT',
    ore: 'ORE',
    gold: 'GOLD'
  }

  const colors = {
    lumber: 'text-cyber-green',
    brick: 'text-cyber-pink',
    wool: 'text-white',
    wheat: 'text-yellow-400',
    ore: 'text-cyber-purple',
    gold: 'text-yellow-300'
  }

  return (
    <span className={`font-mono text-xs ${colors[resource] || 'text-cyber-blue'}`}>
      {labels[resource] || 'GOLD'}
    </span>
  )
}
