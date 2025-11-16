/**
 * Simple bot AI for making game decisions
 * Bots make moves client-side and send through existing API
 */

/**
 * Determine which dice to lock for next roll
 * Simple strategy: Lock the most common resource
 * @param {Array} dice - Current dice values
 * @returns {Array<number>} - Indices of dice to lock
 */
export function decideDiceToLock(dice) {
  if (!dice || dice.length === 0) return []
  
  // Count occurrences of each value
  const counts = {}
  dice.forEach((die, index) => {
    if (!die.used) {
      counts[die.value] = counts[die.value] || []
      counts[die.value].push(index)
    }
  })
  
  // Find the value with the most occurrences
  let maxCount = 0
  let bestValue = null
  
  for (const [value, indices] of Object.entries(counts)) {
    if (indices.length > maxCount) {
      maxCount = indices.length
      bestValue = value
    }
  }
  
  // Return indices of the most common value
  return bestValue ? counts[bestValue] : []
}

/**
 * Decide what to build based on available resources
 * Priority: Settlement > Road > City > Knight
 * @param {Object} resources - Available resources {wood, brick, wheat, wool, ore, gold}
 * @param {Object} currentBuilds - Current player's builds
 * @returns {string|null} - Build type or null
 */
export function decideBuild(resources, currentBuilds = {}) {
  const { wood = 0, brick = 0, wheat = 0, wool = 0, ore = 0, gold = 0 } = resources
  
  // Settlement: wood + brick + wheat + wool
  if (wood >= 1 && brick >= 1 && wheat >= 1 && wool >= 1) {
    if ((currentBuilds.settlements || 0) < 5) {
      return 'settlements'
    }
  }
  
  // Road: wood + brick
  if (wood >= 1 && brick >= 1) {
    if ((currentBuilds.roads || 0) < 15) {
      return 'roads'
    }
  }
  
  // City: wheat + wheat + ore + ore + ore
  if (wheat >= 2 && ore >= 3) {
    if ((currentBuilds.cities || 0) < 4) {
      return 'cities'
    }
  }
  
  // Knight: wool + ore
  if (wool >= 1 && ore >= 1) {
    if ((currentBuilds.knights || 0) < 14) {
      return 'knights'
    }
  }
  
  return null
}

/**
 * Simple bot turn logic
 * @param {Object} gameState - Current game state
 * @param {string} botId - Bot's player ID
 * @returns {Object} - Bot's decision { action: 'roll' | 'lock' | 'build' | 'endTurn', data }
 */
export function makeBotDecision(gameState, botId) {
  const { rollCount, maxRolls, dice, hasBuilt } = gameState
  
  // If haven't rolled yet, roll
  if (rollCount === 0) {
    return { action: 'roll' }
  }
  
  // If rolled but can build, try to build
  if (rollCount > 0 && !hasBuilt) {
    // Get available resources from dice
    const resources = getResourcesFromDice(dice)
    const currentPlayer = gameState.players.find(p => p.id === botId)
    const buildDecision = decideBuild(resources, currentPlayer)
    
    if (buildDecision) {
      return { action: 'build', buildType: buildDecision }
    }
  }
  
  // If can still roll and haven't built, lock some dice and roll again
  if (rollCount < maxRolls && !hasBuilt) {
    const diceToLock = decideDiceToLock(dice)
    if (diceToLock.length > 0) {
      return { action: 'lock', indices: diceToLock }
    }
    return { action: 'roll' }
  }
  
  // End turn
  return { action: 'endTurn' }
}

/**
 * Convert dice to resource counts
 * @param {Array} dice
 * @returns {Object} resource counts
 */
function getResourcesFromDice(dice) {
  const resources = { wood: 0, brick: 0, wheat: 0, wool: 0, ore: 0, gold: 0 }
  const resourceMap = {
    1: 'wood',
    2: 'brick', 
    3: 'wheat',
    4: 'wool',
    5: 'ore',
    6: 'gold'
  }
  
  dice.forEach(die => {
    if (!die.used) {
      const resourceName = resourceMap[die.value]
      if (resourceName) {
        resources[resourceName]++
      }
    }
  })
  
  return resources
}

export default {
  decideDiceToLock,
  decideBuild,
  makeBotDecision
}
