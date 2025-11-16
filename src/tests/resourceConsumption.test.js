import { describe, it, expect } from 'vitest'
import { consumeResources, getAvailableResources } from '../utils/resourceConsumption'

describe('resourceConsumption', () => {
  describe('consumeResources', () => {
    it('should mark exact match dice as used', () => {
      const dice = [
        { value: 1, locked: false, used: false }, // lumber
        { value: 2, locked: false, used: false }, // brick
        { value: 3, locked: false, used: false }, // wool
        { value: 4, locked: false, used: false }, // wheat
        { value: 5, locked: false, used: false }, // ore
        { value: 6, locked: false, used: false }  // gold
      ]

      const required = ['lumber', 'brick']
      const result = consumeResources(dice, required)

      // Lumber and brick should be marked as used
      expect(result[0].used).toBe(true) // lumber
      expect(result[1].used).toBe(true) // brick
      expect(result[2].used).toBe(false) // wool
      expect(result[3].used).toBe(false) // wheat
      expect(result[4].used).toBe(false) // ore
      expect(result[5].used).toBe(false) // gold
    })

    it('should use 2 gold for 1 missing resource', () => {
      const dice = [
        { value: 1, locked: false, used: false }, // lumber
        { value: 6, locked: false, used: false }, // gold
        { value: 6, locked: false, used: false }, // gold
        { value: 4, locked: false, used: false }, // wheat
        { value: 5, locked: false, used: false }, // ore
        { value: 3, locked: false, used: false }  // wool
      ]

      // Need lumber + brick, have lumber + 2 gold
      const required = ['lumber', 'brick']
      const result = consumeResources(dice, required)

      expect(result[0].used).toBe(true) // lumber used
      expect(result[1].used).toBe(true) // gold used
      expect(result[2].used).toBe(true) // gold used
      expect(result[3].used).toBe(false) // wheat not used
    })

    it('should use 4 gold for 2 missing resources', () => {
      const dice = [
        { value: 6, locked: false, used: false }, // gold
        { value: 6, locked: false, used: false }, // gold
        { value: 6, locked: false, used: false }, // gold
        { value: 6, locked: false, used: false }, // gold
        { value: 5, locked: false, used: false }, // ore
        { value: 3, locked: false, used: false }  // wool
      ]

      // Need lumber + brick, have 4 gold
      const required = ['lumber', 'brick']
      const result = consumeResources(dice, required)

      // All 4 gold should be used (2 per missing resource)
      expect(result[0].used).toBe(true)
      expect(result[1].used).toBe(true)
      expect(result[2].used).toBe(true)
      expect(result[3].used).toBe(true)
      expect(result[4].used).toBe(false) // ore not used
      expect(result[5].used).toBe(false) // wool not used
    })

    it('should handle duplicate resources', () => {
      const dice = [
        { value: 5, locked: false, used: false }, // ore
        { value: 5, locked: false, used: false }, // ore
        { value: 5, locked: false, used: false }, // ore
        { value: 4, locked: false, used: false }, // wheat
        { value: 4, locked: false, used: false }, // wheat
        { value: 3, locked: false, used: false }  // wool
      ]

      // City: 3 ore + 2 wheat
      const required = ['ore', 'ore', 'ore', 'wheat', 'wheat']
      const result = consumeResources(dice, required)

      expect(result[0].used).toBe(true) // ore
      expect(result[1].used).toBe(true) // ore
      expect(result[2].used).toBe(true) // ore
      expect(result[3].used).toBe(true) // wheat
      expect(result[4].used).toBe(true) // wheat
      expect(result[5].used).toBe(false) // wool
    })

    it('should preserve locked and value properties', () => {
      const dice = [
        { value: 1, locked: true, used: false },
        { value: 2, locked: false, used: false }
      ]

      const required = ['lumber', 'brick']
      const result = consumeResources(dice, required)

      expect(result[0].value).toBe(1)
      expect(result[0].locked).toBe(true)
      expect(result[1].value).toBe(2)
      expect(result[1].locked).toBe(false)
    })

    it('should not modify already used dice', () => {
      const dice = [
        { value: 1, locked: false, used: true }, // already used
        { value: 2, locked: false, used: false },
        { value: 3, locked: false, used: false }
      ]

      const required = ['lumber']
      const result = consumeResources(dice, required)

      // Should not use already-used dice
      expect(result[0].used).toBe(true)
    })

    it('should handle empty requirements', () => {
      const dice = [
        { value: 1, locked: false, used: false },
        { value: 2, locked: false, used: false }
      ]

      const required = []
      const result = consumeResources(dice, required)

      // No dice should be marked as used
      expect(result[0].used).toBe(false)
      expect(result[1].used).toBe(false)
    })

    it('should mix exact matches and gold', () => {
      const dice = [
        { value: 1, locked: false, used: false }, // lumber (exact)
        { value: 6, locked: false, used: false }, // gold
        { value: 6, locked: false, used: false }, // gold
        { value: 4, locked: false, used: false }, // wheat
        { value: 5, locked: false, used: false }, // ore
        { value: 3, locked: false, used: false }  // wool
      ]

      // Need lumber + brick + wheat + wool (settlement)
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const result = consumeResources(dice, required)

      expect(result[0].used).toBe(true) // lumber (exact)
      expect(result[1].used).toBe(true) // gold for brick
      expect(result[2].used).toBe(true) // gold for brick
      expect(result[3].used).toBe(true) // wheat (exact)
      expect(result[4].used).toBe(false) // ore
      expect(result[5].used).toBe(true) // wool (exact)
    })
  })

  describe('getAvailableResources', () => {
    it('should only count unused dice', () => {
      const dice = [
        { value: 1, used: false }, // lumber
        { value: 1, used: true },  // lumber (used)
        { value: 2, used: false }, // brick
        { value: 3, used: false }, // wool
        { value: 4, used: true },  // wheat (used)
        { value: 6, used: false }  // gold
      ]

      const resources = getAvailableResources(dice)

      expect(resources.lumber).toBe(1) // Only 1 unused lumber
      expect(resources.brick).toBe(1)
      expect(resources.wool).toBe(1)
      expect(resources.wheat).toBe(0) // Wheat is used
      expect(resources.gold).toBe(1)
    })

    it('should return zeros when all dice are used', () => {
      const dice = [
        { value: 1, used: true },
        { value: 2, used: true },
        { value: 3, used: true },
        { value: 4, used: true },
        { value: 5, used: true },
        { value: 6, used: true }
      ]

      const resources = getAvailableResources(dice)

      expect(resources.lumber).toBe(0)
      expect(resources.brick).toBe(0)
      expect(resources.wool).toBe(0)
      expect(resources.wheat).toBe(0)
      expect(resources.ore).toBe(0)
      expect(resources.gold).toBe(0)
    })

    it('should count all when none are used', () => {
      const dice = [
        { value: 1, used: false },
        { value: 1, used: false },
        { value: 2, used: false },
        { value: 3, used: false },
        { value: 4, used: false },
        { value: 6, used: false }
      ]

      const resources = getAvailableResources(dice)

      expect(resources.lumber).toBe(2)
      expect(resources.brick).toBe(1)
      expect(resources.wool).toBe(1)
      expect(resources.wheat).toBe(1)
      expect(resources.gold).toBe(1)
    })

    it('should handle empty dice array', () => {
      const resources = getAvailableResources([])

      expect(resources.lumber).toBe(0)
      expect(resources.brick).toBe(0)
      expect(resources.wool).toBe(0)
      expect(resources.wheat).toBe(0)
      expect(resources.ore).toBe(0)
      expect(resources.gold).toBe(0)
    })
  })
})
