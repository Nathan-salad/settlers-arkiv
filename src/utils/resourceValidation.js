/**
 * Resource validation utilities for build actions
 */

// Map dice values to resources
export const diceToResource = {
  1: 'lumber',
  2: 'brick',
  3: 'wool',
  4: 'wheat',
  5: 'ore',
  6: 'gold' // Gold is wildcard
}

/**
 * Get resources from current dice
 * @param {Array<{value: number, locked: boolean}>} dice
 * @returns {Object} Resource counts
 */
export function getDiceResources(dice) {
  const resources = {
    lumber: 0,
    brick: 0,
    wool: 0,
    wheat: 0,
    ore: 0,
    gold: 0
  }

  dice.forEach(die => {
    const resource = diceToResource[die.value]
    if (resource) {
      resources[resource]++
    }
  })

  return resources
}

/**
 * Check if player can build with current dice
 * Gold dice can be used as any resource
 * @param {Array<string>} required - Required resources for build
 * @param {Object} available - Available resources from dice
 * @returns {boolean}
 */
export function canBuild(required, available) {
  const needed = {}
  
  // Count required resources
  required.forEach(resource => {
    needed[resource] = (needed[resource] || 0) + 1
  })

  // Check if we have enough of each resource (gold can substitute)
  let goldAvailable = available.gold || 0

  for (const [resource, count] of Object.entries(needed)) {
    const have = available[resource] || 0
    const shortage = count - have

    if (shortage > 0) {
      // Try to use gold as substitute
      if (shortage <= goldAvailable) {
        goldAvailable -= shortage
      } else {
        // Not enough resources
        return false
      }
    }
  }

  return true
}

/**
 * Get missing resources for a build
 * @param {Array<string>} required
 * @param {Object} available
 * @returns {Array<string>} List of missing resource names
 */
export function getMissingResources(required, available) {
  const needed = {}
  
  required.forEach(resource => {
    needed[resource] = (needed[resource] || 0) + 1
  })

  const missing = []
  let goldAvailable = available.gold || 0

  for (const [resource, count] of Object.entries(needed)) {
    const have = available[resource] || 0
    const shortage = count - have

    if (shortage > 0) {
      if (shortage <= goldAvailable) {
        goldAvailable -= shortage
      } else {
        // Add missing resources
        for (let i = 0; i < (shortage - goldAvailable); i++) {
          missing.push(resource)
        }
      }
    }
  }

  return missing
}

/**
 * Format resource name for display
 */
export function formatResourceName(resource) {
  return resource.charAt(0).toUpperCase() + resource.slice(1)
}
