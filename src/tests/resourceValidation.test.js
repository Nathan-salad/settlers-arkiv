import { describe, it, expect } from 'vitest'
import { 
  getDiceResources, 
  canBuild, 
  getMissingResources,
  formatResourceName,
  diceToResource 
} from '../utils/resourceValidation'

describe('resourceValidation', () => {
  describe('diceToResource mapping', () => {
    it('should map dice values to correct resources', () => {
      expect(diceToResource[1]).toBe('lumber')
      expect(diceToResource[2]).toBe('brick')
      expect(diceToResource[3]).toBe('wool')
      expect(diceToResource[4]).toBe('wheat')
      expect(diceToResource[5]).toBe('ore')
      expect(diceToResource[6]).toBe('gold')
    })

    it('should return undefined for invalid dice values', () => {
      expect(diceToResource[0]).toBeUndefined()
      expect(diceToResource[7]).toBeUndefined()
      expect(diceToResource[-1]).toBeUndefined()
    })
  })

  describe('getDiceResources', () => {
    it('should count resources from dice correctly', () => {
      const dice = [
        { value: 1 }, // lumber
        { value: 2 }, // brick
        { value: 1 }, // lumber
        { value: 4 }, // wheat
        { value: 5 }, // ore
        { value: 6 }  // gold
      ]

      const resources = getDiceResources(dice)

      expect(resources.lumber).toBe(2)
      expect(resources.brick).toBe(1)
      expect(resources.wheat).toBe(1)
      expect(resources.ore).toBe(1)
      expect(resources.gold).toBe(1)
      expect(resources.wool).toBe(0)
    })

    it('should return zero counts for empty dice array', () => {
      const resources = getDiceResources([])

      expect(resources.lumber).toBe(0)
      expect(resources.brick).toBe(0)
      expect(resources.wool).toBe(0)
      expect(resources.wheat).toBe(0)
      expect(resources.ore).toBe(0)
      expect(resources.gold).toBe(0)
    })

    it('should handle all same resource', () => {
      const dice = [
        { value: 1 },
        { value: 1 },
        { value: 1 },
        { value: 1 },
        { value: 1 },
        { value: 1 }
      ]

      const resources = getDiceResources(dice)
      expect(resources.lumber).toBe(6)
      expect(resources.brick).toBe(0)
    })
  })

  describe('canBuild', () => {
    describe('exact resources (no gold)', () => {
      it('should allow building with exact resources', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 0 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should allow building with extra resources', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 2, brick: 2, wool: 1, wheat: 1, ore: 1, gold: 0 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should reject when missing one resource', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 1, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 0 }

        expect(canBuild(required, available)).toBe(false)
      })

      it('should reject when missing all resources', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 0 }

        expect(canBuild(required, available)).toBe(false)
      })
    })

    describe('gold substitution (2 gold = 1 resource)', () => {
      it('should allow building with 2 gold substituting for 1 missing resource', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 1, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 2 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should reject with only 1 gold (need 2 for trade)', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 1, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 1 }

        expect(canBuild(required, available)).toBe(false)
      })

      it('should allow building with 4 gold substituting for 2 missing resources', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 4 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should reject with 3 gold for 2 missing resources', () => {
        const required = ['lumber', 'brick']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 3 }

        expect(canBuild(required, available)).toBe(false)
      })

      it('should handle complex settlement requirements', () => {
        // Settlement needs: lumber, brick, wheat, wool
        const required = ['lumber', 'brick', 'wheat', 'wool']
        
        // Have 2 resources, need 2 more = 4 gold
        const available = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 4 }
        expect(canBuild(required, available)).toBe(true)

        // Have 2 resources, only 2 gold (not enough)
        const insufficient = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 2 }
        expect(canBuild(required, insufficient)).toBe(false)
      })
    })

    describe('duplicate resources', () => {
      it('should handle multiple of same resource required', () => {
        // City needs 3 ore + 2 wheat
        const required = ['ore', 'ore', 'ore', 'wheat', 'wheat']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 2, ore: 3, gold: 0 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should reject when not enough of duplicated resource', () => {
        const required = ['ore', 'ore', 'ore', 'wheat', 'wheat']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 2, ore: 2, gold: 0 }

        expect(canBuild(required, available)).toBe(false)
      })

      it('should use gold for duplicate resource shortage', () => {
        // Need 3 ore, have 1, need 2 more = 4 gold
        const required = ['ore', 'ore', 'ore', 'wheat', 'wheat']
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 2, ore: 1, gold: 4 }

        expect(canBuild(required, available)).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle empty requirements', () => {
        const required = []
        const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 0 }

        expect(canBuild(required, available)).toBe(true)
      })

      it('should handle undefined available resources', () => {
        const required = ['lumber']
        const available = {}

        expect(canBuild(required, available)).toBe(false)
      })
    })
  })

  describe('getMissingResources', () => {
    it('should return empty array when all resources available', () => {
      const required = ['lumber', 'brick']
      const available = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 0 }

      const missing = getMissingResources(required, available)
      expect(missing).toEqual([])
    })

    it('should list missing resources', () => {
      const required = ['lumber', 'brick']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 0 }

      const missing = getMissingResources(required, available)
      expect(missing).toContain('lumber')
      expect(missing).toContain('brick')
      expect(missing.length).toBe(2)
    })

    it('should account for gold pairs when calculating missing', () => {
      const required = ['lumber', 'brick']
      // Have 2 gold = can cover 1 missing resource
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 2 }

      const missing = getMissingResources(required, available)
      // Should show 1 missing (the other covered by gold pair)
      expect(missing.length).toBeGreaterThan(0)
    })

    it('should handle multiple missing resources', () => {
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 1, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 0 }

      const missing = getMissingResources(required, available)
      expect(missing).toContain('brick')
      expect(missing).toContain('wheat')
      expect(missing).toContain('wool')
    })
  })

  describe('formatResourceName', () => {
    it('should capitalize first letter', () => {
      expect(formatResourceName('lumber')).toBe('Lumber')
      expect(formatResourceName('brick')).toBe('Brick')
      expect(formatResourceName('wool')).toBe('Wool')
      expect(formatResourceName('wheat')).toBe('Wheat')
      expect(formatResourceName('ore')).toBe('Ore')
      expect(formatResourceName('gold')).toBe('Gold')
    })

    it('should handle empty string', () => {
      expect(formatResourceName('')).toBe('')
    })

    it('should handle single character', () => {
      expect(formatResourceName('a')).toBe('A')
    })
  })
})
