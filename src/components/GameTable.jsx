import { useState, useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'
import Dice from './Dice'
import ResourceIcon from './ResourceIcon'
import ResourceDisplay from './ResourceDisplay'
import ScoreSheet from './ScoreSheet'
import BuildBoard from './BuildBoard'
import TurnNotification from './TurnNotification'
import BuildAnimation from './BuildAnimation'
import HelpModal from './HelpModal'
import { getDiceResources, canBuild, getMissingResources, formatResourceName } from '../utils/resourceValidation'
import { getAvailableResources } from '../utils/resourceConsumption'

export default function GameTable({ onNavigate }) {
  const store = useGameStore()
  
  const players = store.players || []
  const currentPlayerId = store.currentPlayerId || '1'
  const turnNumber = store.turnNumber || 1
  const rollCount = store.rollCount || 0
  const maxRolls = store.maxRolls || 3
  const victoryPointGoal = store.victoryPointGoal || 10
  const dice = store.dice || []
  const status = store.status || 'in_progress'
  const hasBuilt = store.hasBuilt || false
  const longestRoadHolder = store.longestRoadHolder
  const largestArmyHolder = store.largestArmyHolder
  const rollDice = store.rollDice
  const toggleLock = store.toggleLock
  const performBuild = store.performBuild
  const endTurn = store.endTurn

  const [isRolling, setIsRolling] = useState(false)
  const [showScoreSheet, setShowScoreSheet] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showTurnNotification, setShowTurnNotification] = useState(false)
  const [lastBuild, setLastBuild] = useState(null)
  const [showBuildAnimation, setShowBuildAnimation] = useState(false)
  const [bonusAchievement, setBonusAchievement] = useState(null) // { type: 'longestRoad' | 'largestArmy', playerName: string }
  
  // Track bonus changes to show achievement notification
  const prevLongestRoadHolder = useRef(longestRoadHolder)
  const prevLargestArmyHolder = useRef(largestArmyHolder)
  
  useEffect(() => {
    // Check if Longest Road changed
    if (longestRoadHolder && longestRoadHolder !== prevLongestRoadHolder.current) {
      const player = players.find(p => p.id === longestRoadHolder)
      if (player) {
        setBonusAchievement({ type: 'longestRoad', playerName: player.name })
        setTimeout(() => setBonusAchievement(null), 3000)
      }
    }
    prevLongestRoadHolder.current = longestRoadHolder
    
    // Check if Largest Army changed
    if (largestArmyHolder && largestArmyHolder !== prevLargestArmyHolder.current) {
      const player = players.find(p => p.id === largestArmyHolder)
      if (player) {
        setBonusAchievement({ type: 'largestArmy', playerName: player.name })
        setTimeout(() => setBonusAchievement(null), 3000)
      }
    }
    prevLargestArmyHolder.current = largestArmyHolder
  }, [longestRoadHolder, largestArmyHolder, players])

  const currentPlayer = players.find(p => p.id === currentPlayerId) || { name: 'Player 1', score: 0 }
  const canRoll = rollCount < maxRolls && !hasBuilt // Can't roll after building
  const hasRolled = rollCount > 0
  
  // Get available resources from current dice (only unused dice)
  const availableResources = getAvailableResources(dice)

  useEffect(() => {
    if (status === 'finished') {
      onNavigate('results')
    }
  }, [status, onNavigate])

  const handleRoll = () => {
    if (!canRoll) return
    // Dismiss turn notification immediately when rolling
    setShowTurnNotification(false)
    setIsRolling(true)
    rollDice()
    setTimeout(() => setIsRolling(false), 500)
  }

  const handleEndTurn = () => {
    endTurn()
    setShowTurnNotification(true)
  }

  const handleBuild = (buildType, required) => {
    // Check max limits
    const maxLimits = {
      roads: 15,
      settlements: 5,
      cities: 4,
      knights: 14
    }
    
    // Check current player's individual build count
    const currentCount = (currentPlayer && currentPlayer[buildType]) || 0
    if (currentCount >= maxLimits[buildType]) {
      console.log(`[BUILD] ${buildType}: Already at max (${maxLimits[buildType]})`)
      return
    }
    
    // Get fresh available resources (accounting for already-used dice this turn)
    const currentAvailableResources = getAvailableResources(dice)
    
    // Validate resources before building
    if (!canBuild(required, currentAvailableResources)) {
      console.log(`[BUILD] Insufficient resources for ${buildType}`)
      return
    }
    
    console.log(`[BUILD] Building ${buildType}`)
    performBuild(buildType, required)
    setLastBuild(buildType)
    setShowBuildAnimation(true)
  }

  // Build requirements with resource icons and max limits
  // Ordered: Roads, Knights (left) | Settlements, Cities (right)
  const buildActions = [
    { 
      type: 'roads', 
      label: 'Road', 
      resources: ['lumber', 'brick'],
      color: 'cyber-blue',
      borderColor: 'border-cyber-blue',
      textColor: 'text-cyber-blue',
      maxBuilds: 15  // Catan rule: max 15 roads
    },
    { 
      type: 'knights', 
      label: 'Knight', 
      resources: ['ore', 'wool', 'wheat'],
      color: 'cyber-pink',
      borderColor: 'border-cyber-pink',
      textColor: 'text-cyber-pink',
      maxBuilds: 14  // Catan rule: max 14 knights
    },
    { 
      type: 'settlements', 
      label: 'Settlement', 
      resources: ['lumber', 'brick', 'wheat', 'wool'],
      color: 'cyber-green',
      borderColor: 'border-cyber-green',
      textColor: 'text-cyber-green',
      maxBuilds: 5   // Catan rule: max 5 settlements
    },
    { 
      type: 'cities', 
      label: 'City', 
      resources: ['ore', 'ore', 'ore', 'wheat', 'wheat'],
      color: 'cyber-purple',
      borderColor: 'border-cyber-purple',
      textColor: 'text-cyber-purple',
      maxBuilds: 4   // Catan rule: max 4 cities
    },
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* HUD */}
        <div className="bg-cyber-darker border-2 border-cyber-blue p-6 mb-6 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center font-mono">
            <div>
              <div className="text-cyber-blue text-sm">CURRENT PLAYER</div>
              <div className="text-2xl font-bold text-cyber-green">{currentPlayer?.name || 'Player 1'}</div>
            </div>
            <div>
              <div className="text-cyber-blue text-sm">VICTORY POINTS</div>
              <div className="text-2xl font-bold text-cyber-purple">{currentPlayer?.score || 0} / {victoryPointGoal}</div>
            </div>
            <div>
              <div className="text-cyber-blue text-sm">TURN</div>
              <div className="text-2xl font-bold text-cyber-pink">#{turnNumber}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Dice Area & Build Board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice */}
            <div className="bg-cyber-darker border-2 border-cyber-blue p-6 rounded-lg">
              <h3 className="text-xl font-bold text-cyber-blue mb-4 font-mono">[DICE]</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                {dice.map((die, index) => (
                  <Dice
                    key={index}
                    value={die.value}
                    locked={die.locked}
                    used={die.used}
                    onToggleLock={() => hasRolled && !die.used && toggleLock(index)}
                    isRolling={isRolling && !die.locked}
                  />
                ))}
              </div>
              
              {/* Resource Summary */}
              {hasRolled && (
                <div className="mb-4 p-3 bg-cyber-blue/5 border border-cyber-blue/30 rounded">
                  <div className="text-xs text-cyber-blue font-mono mb-2 text-center">
                    YOUR RESOURCES
                  </div>
                  <ResourceDisplay dice={dice} />
                </div>
              )}
              
              <button
                onClick={handleRoll}
                disabled={!canRoll}
                className={`neon-btn w-full ${
                  canRoll
                    ? 'text-cyber-blue border-cyber-blue'
                    : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {rollCount === 0 
                  ? 'ROLL DICE' 
                  : canRoll 
                  ? `RE-ROLL (${maxRolls - rollCount} left)` 
                  : hasBuilt
                  ? 'NO MORE ROLLS (already built)'
                  : 'NO ROLLS LEFT'}
              </button>
            </div>

            {/* Build Actions */}
            <div className="bg-cyber-darker border-2 border-cyber-green p-6 rounded-lg">
              <h3 className="text-xl font-bold text-cyber-green mb-4 font-mono">[BUILD ACTIONS]</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buildActions.map(action => {
                  // Check current player's individual build count
                  const currentBuilds = (currentPlayer && currentPlayer[action.type]) || 0
                  const isAtMax = currentBuilds >= action.maxBuilds
                  const canAfford = hasRolled && canBuild(action.resources, availableResources) && !isAtMax
                  const missingResources = hasRolled ? getMissingResources(action.resources, availableResources) : []
                  
                  return (
                    <button
                      key={action.type}
                      onClick={() => handleBuild(action.type, action.resources)}
                      disabled={!canAfford}
                      className={`border-2 p-4 rounded transition-all text-left ${
                        canAfford
                          ? `${action.borderColor} ${action.textColor} hover:bg-${action.color}/10 hover:scale-105`
                          : 'border-gray-600 text-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-lg">{action.label}</div>
                          {/* Victory Point Badge */}
                          {action.type === 'settlements' && (
                            <span className="bg-cyber-green/20 border border-cyber-green text-cyber-green px-2 py-0.5 rounded text-xs font-bold">
                              +1 VP
                            </span>
                          )}
                          {action.type === 'cities' && (
                            <span className="bg-cyber-purple/20 border border-cyber-purple text-cyber-purple px-2 py-0.5 rounded text-xs font-bold">
                              +2 VP
                            </span>
                          )}
                        </div>
                        {canAfford && !isAtMax && (
                          <span className="text-cyber-green text-xs font-mono">✓ CAN BUILD</span>
                        )}
                        {isAtMax && (
                          <span className="text-cyber-pink text-xs font-mono">MAX REACHED</span>
                        )}
                      </div>
                      
                      {/* Resource icons */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {action.resources.map((resource, idx) => (
                          <div key={idx} className={canAfford ? "opacity-100" : "opacity-40"}>
                            <ResourceIcon resource={resource} size="sm" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className={currentBuilds >= action.maxBuilds ? "text-cyber-pink" : "opacity-70"}>
                          Built: {currentBuilds}/{action.maxBuilds}
                        </span>
                        {missingResources.length > 0 && hasRolled && !isAtMax && (
                          <span className="text-cyber-pink text-xs">
                            Need: {missingResources.map(formatResourceName).join(', ')}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Build Progress Board */}
            {currentPlayer && (
              <BuildBoard 
                builds={{
                  roads: currentPlayer.roads || 0,
                  settlements: currentPlayer.settlements || 0,
                  cities: currentPlayer.cities || 0,
                  knights: currentPlayer.knights || 0
                }} 
                playerName={currentPlayer.name || 'Player 1'} 
              />
            )}
          </div>

          {/* Right: Player List & Controls */}
          <div className="space-y-6">
            {/* Player List */}
            <div className="bg-cyber-darker border-2 border-cyber-pink p-6 rounded-lg">
              <h3 className="text-xl font-bold text-cyber-pink mb-4 font-mono">[PLAYERS]</h3>
              <div className="space-y-3">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`p-3 border-2 rounded transition-all ${
                      player.id === currentPlayerId
                        ? 'border-cyber-green bg-cyber-green/10 shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                        : 'border-cyber-blue/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-cyber-blue">{player.name}</div>
                          {/* Longest Road Badge */}
                          {longestRoadHolder === player.id && (
                            <div className="inline-flex items-center gap-1 bg-cyber-blue/20 border border-cyber-blue text-cyber-blue px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                              <span>══</span>
                              <span>LONGEST</span>
                            </div>
                          )}
                          {/* Largest Army Badge */}
                          {largestArmyHolder === player.id && (
                            <div className="inline-flex items-center gap-1 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                              <span>⚔️</span>
                              <span>ARMY</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-cyber-pink font-mono mt-1">
                          VP: {player.score}/{victoryPointGoal}
                        </div>
                        <div className="text-xs text-cyber-blue/70 font-mono mt-1 flex gap-3">
                          <span title="Roads (5+ for Longest Road bonus)">
                            ══ {player.roads || 0}
                          </span>
                          <span title="Knights (3+ for Largest Army bonus)">
                            ⚔️ {player.knights || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-cyber-green ml-2">
                        {player.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <button
                onClick={() => setShowHelp(true)}
                className="neon-btn text-cyber-blue border-cyber-blue w-full text-sm"
              >
                📖 HELP / RULES
              </button>

              <button
                onClick={() => setShowScoreSheet(!showScoreSheet)}
                className="neon-btn text-cyber-purple border-cyber-purple w-full"
              >
                {showScoreSheet ? 'HIDE' : 'SHOW'} SCORE SHEET
              </button>
              
              <button
                onClick={handleEndTurn}
                disabled={!hasRolled}
                className={`neon-btn w-full ${
                  hasRolled
                    ? hasBuilt 
                      ? 'text-cyber-green border-cyber-green pulse-green'
                      : 'text-cyber-green border-cyber-green'
                    : 'text-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {hasBuilt ? '✓ END TURN' : 'END TURN'}
              </button>

              <button
                onClick={() => onNavigate('landing')}
                className="neon-btn text-cyber-pink border-cyber-pink w-full text-sm"
              >
                QUIT GAME
              </button>
            </div>
          </div>
        </div>

        {/* Score Sheet Modal */}
        {showScoreSheet && (
          <ScoreSheet 
            players={players}
            currentPlayerId={currentPlayerId}
            onClose={() => setShowScoreSheet(false)}
          />
        )}

        {/* Help Modal */}
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}

        {/* Turn Notification */}
        <TurnNotification 
          playerName={currentPlayer?.name}
          show={showTurnNotification}
          onComplete={() => setShowTurnNotification(false)}
        />

        {/* Build Animation */}
        <BuildAnimation 
          buildType={lastBuild}
          show={showBuildAnimation}
          onComplete={() => setShowBuildAnimation(false)}
        />
        
        {/* Bonus Achievement Notification */}
        {bonusAchievement && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="animate-bounce bg-gradient-to-r from-cyber-blue/90 to-cyber-purple/90 border-4 border-cyber-green p-8 rounded-lg shadow-[0_0_30px_rgba(57,255,20,0.5)]">
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {bonusAchievement.type === 'longestRoad' ? '══' : '⚔️'}
                </div>
                <div className="text-3xl font-bold text-cyber-green mb-2 glitch">
                  {bonusAchievement.type === 'longestRoad' ? 'LONGEST ROAD' : 'LARGEST ARMY'}
                </div>
                <div className="text-2xl text-cyber-blue font-bold mb-2">
                  ACHIEVED!
                </div>
                <div className="text-xl text-cyber-pink font-mono">
                  {bonusAchievement.playerName}
                </div>
                <div className="text-4xl font-bold text-cyber-green mt-3 animate-pulse">
                  +2 VP
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
