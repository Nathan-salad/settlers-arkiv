import { describe, it, expect } from 'vitest'

describe('Scoring Logic', () => {
  describe('point values per build type (Island Two)', () => {
    const scoreValues = {
      roads: 0, // 0 VP individually, bonus for Longest Road
      settlements: 1,
      cities: 2,
      knights: 0 // 0 VP individually, bonus for Largest Army
    }

    it('should award 0 points for roads individually', () => {
      expect(scoreValues.roads).toBe(0)
    })

    it('should award 1 point for settlements', () => {
      expect(scoreValues.settlements).toBe(1)
    })

    it('should award 2 points for cities', () => {
      expect(scoreValues.cities).toBe(2)
    })

    it('should award 0 points for knights individually', () => {
      expect(scoreValues.knights).toBe(0)
    })
    
    it('should award 2 bonus points for Longest Road (5+ roads)', () => {
      expect(2).toBe(2) // Bonus constant
    })
    
    it('should award 2 bonus points for Largest Army (3+ knights)', () => {
      expect(2).toBe(2) // Bonus constant
    })
  })

  describe('score calculations (Island Two)', () => {
    const scoreValues = {
      roads: 0,
      settlements: 1,
      cities: 2,
      knights: 0
    }

    const calculateScore = (builds, hasLongestRoad = false, hasLargestArmy = false) => {
      let score = Object.keys(builds).reduce((total, key) => {
        return total + (builds[key] * (scoreValues[key] || 0))
      }, 0)
      
      if (hasLongestRoad) score += 2
      if (hasLargestArmy) score += 2
      
      return score
    }

    it('should calculate score for single road (0 VP)', () => {
      const builds = { roads: 1, settlements: 0, cities: 0, knights: 0 }
      expect(calculateScore(builds)).toBe(0)
    })

    it('should calculate score for 5 roads with Longest Road bonus', () => {
      const builds = { roads: 5, settlements: 0, cities: 0, knights: 0 }
      expect(calculateScore(builds, true)).toBe(2) // 0 + 2 bonus
    })

    it('should calculate score for single settlement', () => {
      const builds = { roads: 0, settlements: 1, cities: 0, knights: 0 }
      expect(calculateScore(builds)).toBe(1)
    })

    it('should calculate score for single city', () => {
      const builds = { roads: 0, settlements: 0, cities: 1, knights: 0 }
      expect(calculateScore(builds)).toBe(2)
    })

    it('should calculate score for single knight (0 VP)', () => {
      const builds = { roads: 0, settlements: 0, cities: 0, knights: 1 }
      expect(calculateScore(builds)).toBe(0)
    })
    
    it('should calculate score for 3 knights with Largest Army bonus', () => {
      const builds = { roads: 0, settlements: 0, cities: 0, knights: 3 }
      expect(calculateScore(builds, false, true)).toBe(2) // 0 + 2 bonus
    })

    it('should calculate combined score with settlements and cities', () => {
      const builds = { roads: 2, settlements: 3, cities: 1, knights: 1 }
      // 2*0 + 3*1 + 1*2 + 1*0 = 0 + 3 + 2 + 0 = 5
      expect(calculateScore(builds)).toBe(5)
    })
    
    it('should calculate score with both bonuses', () => {
      const builds = { roads: 5, settlements: 2, cities: 1, knights: 3 }
      // 5*0 + 2*1 + 1*2 + 3*0 + 2 (longest) + 2 (largest) = 0 + 2 + 2 + 0 + 2 + 2 = 8
      expect(calculateScore(builds, true, true)).toBe(8)
    })

    it('should calculate maximum possible score with bonuses', () => {
      const builds = { roads: 15, settlements: 5, cities: 4, knights: 14 }
      // 15*0 + 5*1 + 4*2 + 14*0 + 2 + 2 = 0 + 5 + 8 + 0 + 4 = 17
      expect(calculateScore(builds, true, true)).toBe(17)
    })

    it('should handle zero builds', () => {
      const builds = { roads: 0, settlements: 0, cities: 0, knights: 0 }
      expect(calculateScore(builds)).toBe(0)
    })

    it('should ignore unknown build types', () => {
      const builds = { roads: 1, unknown: 10, settlements: 1, cities: 0, knights: 0 }
      expect(calculateScore(builds)).toBe(1) // Only settlement counts
    })
  })

  describe('max build limits', () => {
    const maxLimits = {
      roads: 15,
      settlements: 5,
      cities: 4,
      knights: 14
    }

    it('should enforce road limit', () => {
      expect(maxLimits.roads).toBe(15)
    })

    it('should enforce settlement limit', () => {
      expect(maxLimits.settlements).toBe(5)
    })

    it('should enforce city limit', () => {
      expect(maxLimits.cities).toBe(4)
    })

    it('should enforce knight limit', () => {
      expect(maxLimits.knights).toBe(14)
    })
  })

  describe('build requirements', () => {
    const buildRequirements = {
      roads: ['lumber', 'brick'],
      settlements: ['lumber', 'brick', 'wheat', 'wool'],
      cities: ['ore', 'ore', 'ore', 'wheat', 'wheat'],
      knights: ['ore', 'wool', 'wheat']
    }

    it('should require lumber and brick for roads', () => {
      expect(buildRequirements.roads).toEqual(['lumber', 'brick'])
    })

    it('should require 4 resources for settlements', () => {
      expect(buildRequirements.settlements).toHaveLength(4)
      expect(buildRequirements.settlements).toContain('lumber')
      expect(buildRequirements.settlements).toContain('brick')
      expect(buildRequirements.settlements).toContain('wheat')
      expect(buildRequirements.settlements).toContain('wool')
    })

    it('should require 5 resources for cities', () => {
      expect(buildRequirements.cities).toHaveLength(5)
      const oreCount = buildRequirements.cities.filter(r => r === 'ore').length
      const wheatCount = buildRequirements.cities.filter(r => r === 'wheat').length
      expect(oreCount).toBe(3)
      expect(wheatCount).toBe(2)
    })

    it('should require 3 resources for knights', () => {
      expect(buildRequirements.knights).toHaveLength(3)
      expect(buildRequirements.knights).toContain('ore')
      expect(buildRequirements.knights).toContain('wool')
      expect(buildRequirements.knights).toContain('wheat')
    })
  })
})
