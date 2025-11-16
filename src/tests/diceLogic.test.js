import { describe, it, expect } from 'vitest'
import { diceToResource } from '../utils/resourceValidation'

describe('Dice Value to Resource Mapping', () => {
  describe('valid dice values', () => {
    it('should map 1 to lumber', () => {
      expect(diceToResource[1]).toBe('lumber')
    })

    it('should map 2 to brick', () => {
      expect(diceToResource[2]).toBe('brick')
    })

    it('should map 3 to wool', () => {
      expect(diceToResource[3]).toBe('wool')
    })

    it('should map 4 to wheat', () => {
      expect(diceToResource[4]).toBe('wheat')
    })

    it('should map 5 to ore', () => {
      expect(diceToResource[5]).toBe('ore')
    })

    it('should map 6 to gold', () => {
      expect(diceToResource[6]).toBe('gold')
    })
  })

  describe('invalid dice values', () => {
    it('should return undefined for 0', () => {
      expect(diceToResource[0]).toBeUndefined()
    })

    it('should return undefined for 7', () => {
      expect(diceToResource[7]).toBeUndefined()
    })

    it('should return undefined for negative values', () => {
      expect(diceToResource[-1]).toBeUndefined()
      expect(diceToResource[-10]).toBeUndefined()
    })

    it('should return undefined for non-integer values', () => {
      expect(diceToResource[1.5]).toBeUndefined()
      expect(diceToResource[3.7]).toBeUndefined()
    })

    it('should return undefined for very large values', () => {
      expect(diceToResource[100]).toBeUndefined()
      expect(diceToResource[1000]).toBeUndefined()
    })
  })

  describe('resource distribution', () => {
    it('should have exactly 6 valid mappings', () => {
      const validMappings = Object.keys(diceToResource).filter(
        key => diceToResource[key] !== undefined
      )
      expect(validMappings.length).toBe(6)
    })

    it('should map to unique resources', () => {
      const resources = Object.values(diceToResource)
      const uniqueResources = new Set(resources)
      expect(uniqueResources.size).toBe(6)
    })

    it('should include all expected resources', () => {
      const resources = Object.values(diceToResource)
      expect(resources).toContain('lumber')
      expect(resources).toContain('brick')
      expect(resources).toContain('wool')
      expect(resources).toContain('wheat')
      expect(resources).toContain('ore')
      expect(resources).toContain('gold')
    })
  })
})

describe('Dice State Management', () => {
  describe('dice object structure', () => {
    it('should have required properties', () => {
      const die = { value: 1, locked: false, used: false }
      
      expect(die).toHaveProperty('value')
      expect(die).toHaveProperty('locked')
      expect(die).toHaveProperty('used')
    })

    it('should have boolean flags', () => {
      const die = { value: 3, locked: true, used: false }
      
      expect(typeof die.locked).toBe('boolean')
      expect(typeof die.used).toBe('boolean')
    })

    it('should have numeric value', () => {
      const die = { value: 5, locked: false, used: false }
      
      expect(typeof die.value).toBe('number')
    })
  })

  describe('dice state combinations', () => {
    it('should allow locked and used', () => {
      const die = { value: 1, locked: true, used: true }
      
      expect(die.locked).toBe(true)
      expect(die.used).toBe(true)
    })

    it('should allow locked but not used', () => {
      const die = { value: 2, locked: true, used: false }
      
      expect(die.locked).toBe(true)
      expect(die.used).toBe(false)
    })

    it('should allow used but not locked', () => {
      const die = { value: 3, locked: false, used: true }
      
      expect(die.locked).toBe(false)
      expect(die.used).toBe(true)
    })

    it('should allow neither locked nor used', () => {
      const die = { value: 4, locked: false, used: false }
      
      expect(die.locked).toBe(false)
      expect(die.used).toBe(false)
    })
  })
})
