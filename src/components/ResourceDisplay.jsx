import ResourceIcon from './ResourceIcon'
import { getDiceResources } from '../utils/resourceValidation'

/**
 * Display available resources from current dice
 */
export default function ResourceDisplay({ dice }) {
  const resources = getDiceResources(dice)
  
  const resourceList = [
    { type: 'lumber', count: resources.lumber },
    { type: 'brick', count: resources.brick },
    { type: 'wool', count: resources.wool },
    { type: 'wheat', count: resources.wheat },
    { type: 'ore', count: resources.ore },
    { type: 'gold', count: resources.gold }
  ].filter(r => r.count > 0)

  if (resourceList.length === 0) {
    return (
      <div className="text-center text-cyber-blue/50 text-sm font-mono py-2">
        Roll dice to see resources
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {resourceList.map(resource => (
        <div 
          key={resource.type}
          className="flex items-center gap-2 bg-cyber-darker border border-cyber-blue/30 rounded px-3 py-2"
        >
          <ResourceIcon resource={resource.type} size="sm" />
          <span className="text-cyber-green font-bold text-lg font-mono">
            ×{resource.count}
          </span>
        </div>
      ))}
    </div>
  )
}
