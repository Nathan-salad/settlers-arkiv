/**
 * Resource consumption utilities
 * Tracks which dice are used for builds
 */

import { diceToResource } from './resourceValidation'

/**
 * Mark dice as used for a build
 * Returns updated dice array with some dice marked as used
 * @param {Array} dice - Current dice state
 * @param {Array<string>} required - Required resources
 * @returns {Array} Updated dice with 'used' flags
 */
export function consumeResources(dice, required) {
  // Count what we need
  const needed = {}
  required.forEach(resource => {
    needed[resource] = (needed[resource] || 0) + 1
  })

  const updatedDice = [...dice]
  let shortages = []

  // First pass: use exact matches
  for (const [resource, count] of Object.entries(needed)) {
    let found = 0
    
    for (let i = 0; i < updatedDice.length && found < count; i++) {
      const diceResource = diceToResource[updatedDice[i].value]
      
      if (!updatedDice[i].used && diceResource === resource) {
        updatedDice[i] = { ...updatedDice[i], used: true }
        found++
      }
    }
    
    // Track shortfall for gold substitution
    const shortage = count - found
    if (shortage > 0) {
      shortages.push(shortage)
    }
  }

  // Second pass: use gold dice for shortfalls (2 gold = 1 resource)
  const totalShortage = shortages.reduce((sum, s) => sum + s, 0)
  const goldNeeded = totalShortage * 2 // Need 2 gold per shortage
  
  if (goldNeeded > 0) {
    let goldConsumed = 0
    
    for (let i = 0; i < updatedDice.length && goldConsumed < goldNeeded; i++) {
      const diceResource = diceToResource[updatedDice[i].value]
      
      if (!updatedDice[i].used && diceResource === 'gold') {
        updatedDice[i] = { ...updatedDice[i], used: true }
        goldConsumed++
      }
    }
  }

  return updatedDice
}

/**
 * Get available (unused) resources from dice
 * @param {Array} dice
 * @returns {Object} Resource counts (only unused dice)
 */
export function getAvailableResources(dice) {
  const resources = {
    lumber: 0,
    brick: 0,
    wool: 0,
    wheat: 0,
    ore: 0,
    gold: 0
  }

  dice.forEach(die => {
    if (!die.used) {
      const resource = diceToResource[die.value]
      if (resource) {
        resources[resource]++
      }
    }
  })

  return resources
}
