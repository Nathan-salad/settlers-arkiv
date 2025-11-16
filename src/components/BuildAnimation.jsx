import { useEffect, useState } from 'react'
import ResourceIcon from './ResourceIcon'

/**
 * Animated notification when building something
 */
export default function BuildAnimation({ buildType, show, onComplete }) {
  const [visible, setVisible] = useState(false)

  const buildData = {
    roads: { label: 'Road Built!', icon: 'lumber', color: 'cyber-blue' },
    settlements: { label: 'Settlement Built!', icon: 'wheat', color: 'cyber-green' },
    cities: { label: 'City Built!', icon: 'ore', color: 'cyber-purple' },
    knights: { label: 'Knight Recruited!', icon: 'wool', color: 'cyber-pink' }
  }

  const data = buildData[buildType] || buildData.roads

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed top-20 right-4 z-50 slide-in-right pointer-events-none">
      <div className={`bg-cyber-darker border-2 border-${data.color} p-4 rounded-lg shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="flicker">
            <ResourceIcon resource={data.icon} size="md" />
          </div>
          <div>
            <div className={`text-lg font-bold text-${data.color} font-mono`}>
              {data.label}
            </div>
            <div className="text-xs text-cyber-blue/70 font-mono">
              +1 Build
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
