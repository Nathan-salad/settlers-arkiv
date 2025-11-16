import { describe, it, expect } from 'vitest'
import { canBuild, getDiceResources } from '../utils/resourceValidation'

describe('Gold Trading Rules (2 gold = 1 resource)', () => {
  describe('basic gold trading', () => {
    it('should require exactly 2 gold to substitute for 1 resource', () => {
      const required = ['lumber']
      const with2Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 2 }
      const with1Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 1 }
      
      expect(canBuild(required, with2Gold)).toBe(true)
      expect(canBuild(required, with1Gold)).toBe(false)
    })

    it('should require 4 gold to substitute for 2 resources', () => {
      const required = ['lumber', 'brick']
      const with4Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 4 }
      const with3Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 3 }
      const with2Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 2 }
      
      expect(canBuild(required, with4Gold)).toBe(true)
      expect(canBuild(required, with3Gold)).toBe(false)
      expect(canBuild(required, with2Gold)).toBe(false)
    })

    it('should require 6 gold to substitute for 3 resources', () => {
      const required = ['lumber', 'brick', 'wheat']
      const with6Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 6 }
      const with5Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 5 }
      const with4Gold = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 4 }
      
      expect(canBuild(required, with6Gold)).toBe(true)
      expect(canBuild(required, with5Gold)).toBe(false)
      expect(canBuild(required, with4Gold)).toBe(false)
    })
  })

  describe('mixed resource and gold', () => {
    it('should allow 1 resource + 2 gold for 2 resource requirement', () => {
      const required = ['lumber', 'brick']
      const available = { lumber: 1, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 2 }
      
      expect(canBuild(required, available)).toBe(true)
    })

    it('should allow 2 resources + 4 gold for 4 resource requirement', () => {
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 4 }
      
      expect(canBuild(required, available)).toBe(true)
    })

    it('should reject 2 resources + 2 gold for 4 resource requirement', () => {
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 1, brick: 1, wool: 0, wheat: 0, ore: 0, gold: 2 }
      
      expect(canBuild(required, available)).toBe(false)
    })

    it('should allow 3 resources + 2 gold for 4 resource requirement', () => {
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 1, brick: 1, wool: 1, wheat: 0, ore: 0, gold: 2 }
      
      expect(canBuild(required, available)).toBe(true)
    })
  })

  describe('odd number of gold dice', () => {
    it('should reject 1 gold (cannot trade)', () => {
      const required = ['lumber']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 1 }
      
      expect(canBuild(required, available)).toBe(false)
    })

    it('should reject 3 gold for 2 resource requirement (need 4)', () => {
      const required = ['lumber', 'brick']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 3 }
      
      expect(canBuild(required, available)).toBe(false)
    })

    it('should allow 5 gold for 2 resource requirement (use 4, 1 wasted)', () => {
      const required = ['lumber', 'brick']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 5 }
      
      expect(canBuild(required, available)).toBe(true)
    })

    it('should reject 7 gold for 4 resource requirement (need 8)', () => {
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 7 }
      
      expect(canBuild(required, available)).toBe(false)
    })
  })

  describe('complex scenarios', () => {
    it('should handle city build with partial gold', () => {
      // City needs 3 ore + 2 wheat = 5 resources
      const required = ['ore', 'ore', 'ore', 'wheat', 'wheat']
      
      // Have 2 ore + 1 wheat, need 1 ore + 1 wheat = 4 gold
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 1, ore: 2, gold: 4 }
      expect(canBuild(required, available)).toBe(true)
      
      // Have 2 ore + 1 wheat, only 2 gold (not enough)
      const insufficient = { lumber: 0, brick: 0, wool: 0, wheat: 1, ore: 2, gold: 2 }
      expect(canBuild(required, insufficient)).toBe(false)
    })

    it('should handle settlement with all gold', () => {
      // Settlement needs 4 resources = 8 gold
      const required = ['lumber', 'brick', 'wheat', 'wool']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 8 }
      
      expect(canBuild(required, available)).toBe(true)
    })

    it('should handle excess gold correctly', () => {
      // Need 2 resources, have 10 gold (way more than needed)
      const required = ['lumber', 'brick']
      const available = { lumber: 0, brick: 0, wool: 0, wheat: 0, ore: 0, gold: 10 }
      
      expect(canBuild(required, available)).toBe(true)
    })
  })

  describe('gold dice counting', () => {
    it('should count gold dice correctly', () => {
      const dice = [
        { value: 6 }, // gold
        { value: 6 }, // gold
        { value: 1 }, // lumber
        { value: 2 }, // brick
        { value: 3 }, // wool
        { value: 4 }  // wheat
      ]

      const resources = getDiceResources(dice)
      expect(resources.gold).toBe(2)
    })

    it('should count all gold dice', () => {
      const dice = [
        { value: 6 }, // gold
        { value: 6 }, // gold
        { value: 6 }, // gold
        { value: 6 }, // gold
        { value: 6 }, // gold
        { value: 6 }  // gold
      ]

      const resources = getDiceResources(dice)
      expect(resources.gold).toBe(6)
    })

    it('should count no gold when none present', () => {
      const dice = [
        { value: 1 }, // lumber
        { value: 2 }, // brick
        { value: 3 }, // wool
        { value: 4 }, // wheat
        { value: 5 }, // ore
        { value: 1 }  // lumber
      ]

      const resources = getDiceResources(dice)
      expect(resources.gold).toBe(0)
    })
  })
})
