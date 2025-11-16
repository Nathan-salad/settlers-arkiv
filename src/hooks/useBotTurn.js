import { useState, useEffect } from 'react'
import { makeBotDecision } from '../utils/botAI'
import useGameStore from '../store/gameStore'

/**
 * Hook to handle bot turn automation with visual delays
 * @param {Array} bots - Array of bot player objects
 * @param {Function} onBotAction - Callback when bot performs action
 * @returns {Object} - { isBotThinking, currentBotAction }
 */
export function useBotTurn(bots = []) {
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [currentBotAction, setCurrentBotAction] = useState(null)
  
  const gameState = useGameStore(state => ({
    currentPlayerId: state.currentPlayerId,
    players: state.players,
    rollCount: state.rollCount,
    maxRolls: state.maxRolls,
    dice: state.dice,
    hasBuilt: state.hasBuilt,
    status: state.status
  }))
  
  const { rollDice, toggleLock, performBuild, endTurn } = useGameStore()

  useEffect(() => {
    // Check if current player is a bot
    if (gameState.status !== 'in_progress') {
      console.log('[BOT] Game not in progress:', gameState.status)
      return
    }
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId)
    if (!currentPlayer) {
      console.log('[BOT] No current player found')
      return
    }
    
    // Check if this player is marked as a bot
    const isBot = currentPlayer.isBot || bots.some(bot => bot.playerName === currentPlayer.name)
    console.log('[BOT] Current player:', currentPlayer.name, 'isBot:', isBot, 'hasFlag:', currentPlayer.isBot)
    
    if (!isBot) return
    
    // Bot's turn - execute with delay
    const executeBotTurn = async () => {
      console.log('[BOT] Starting bot turn for', currentPlayer.name)
      setIsBotThinking(true)
      
      // Wait a bit before bot "thinks"
      await delay(1000)
      
      // Get bot's decision
      const decision = makeBotDecision(gameState, gameState.currentPlayerId)
      
      // Show what bot is doing
      setCurrentBotAction(decision)
      
      // Wait to show the action
      await delay(800)
      
      // Execute the action
      try {
        switch (decision.action) {
          case 'roll':
            setCurrentBotAction({ ...decision, message: '🎲 Rolling dice...' })
            console.log('[BOT] Rolling dice...')
            await rollDice()
            await delay(600)
            break
            
          case 'lock':
            setCurrentBotAction({ ...decision, message: '🔒 Locking dice...' })
            console.log('[BOT] Locking dice:', decision.indices)
            decision.indices.forEach(index => {
              toggleLock(index)
            })
            await delay(500)
            // Roll again after locking
            await delay(300)
            console.log('[BOT] Re-rolling after lock...')
            await rollDice()
            await delay(600)
            break
            
          case 'build':
            // Find required resources for build
            const buildMap = {
              roads: ['wood', 'brick'],
              settlements: ['wood', 'brick', 'wheat', 'wool'],
              cities: ['wheat', 'wheat', 'ore', 'ore', 'ore'],
              knights: ['wool', 'ore']
            }
            
            const required = buildMap[decision.buildType] || []
            console.log('[BOT] Building', decision.buildType, 'with resources:', required)
            performBuild(decision.buildType, required)
            
            const buildEmojis = {
              roads: '🛣️',
              settlements: '🏠',
              cities: '🏰',
              knights: '⚔️'
            }
            
            setCurrentBotAction({ 
              ...decision, 
              message: `${buildEmojis[decision.buildType]} Building ${decision.buildType}...` 
            })
            await delay(1000)
            break
            
          case 'endTurn':
            setCurrentBotAction({ ...decision, message: '✅ Ending turn...' })
            console.log('[BOT] Ending turn...')
            await delay(800)
            await endTurn()
            console.log('[BOT] Turn ended')
            break
        }
      } catch (error) {
        console.error('Bot action error:', error)
      }
      
      setIsBotThinking(false)
      setCurrentBotAction(null)
    }
    
    executeBotTurn()
  }, [gameState.currentPlayerId, gameState.rollCount, gameState.hasBuilt, gameState.status, bots.length])

  return {
    isBotThinking,
    currentBotAction
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default useBotTurn
