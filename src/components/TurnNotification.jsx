import { useEffect, useState } from 'react'

/**
 * Animated turn notification overlay
 * Shows "YOUR TURN" briefly when it's your turn, or persists "WAITING FOR..." when spectating
 */
export default function TurnNotification({ playerName, show, isMyTurn = true, onComplete }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      
      // Only auto-dismiss if it's your turn
      if (isMyTurn) {
        const timer = setTimeout(() => {
          setVisible(false)
          onComplete?.()
        }, 1500)
        return () => clearTimeout(timer)
      }
      // When spectating, stay visible
    } else {
      setVisible(false)
    }
  }, [show, isMyTurn, onComplete])

  if (!visible) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
      <div className={isMyTurn ? "pop-in" : ""}>
        <div className={`${
          isMyTurn 
            ? 'bg-cyber-darker border-4 border-cyber-green shadow-[0_0_40px_rgba(57,255,20,0.6)]' 
            : 'bg-cyber-blue/90 border-2 border-cyber-blue shadow-[0_0_20px_rgba(0,212,255,0.4)]'
        } p-6 rounded-lg text-center`}>
          <div className={`text-xs font-mono mb-1 ${
            isMyTurn ? 'text-cyber-green' : 'text-white/70'
          }`}>
            {isMyTurn ? '[YOUR TURN]' : '[WAITING]'}
          </div>
          <div className={`text-2xl font-bold font-mono mb-1 ${
            isMyTurn ? 'text-cyber-green glitch' : 'text-white'
          }`}>
            {isMyTurn ? 'YOUR TURN!' : playerName}
          </div>
          <div className={`text-xs font-mono ${
            isMyTurn ? 'text-cyber-blue' : 'text-white/70'
          }`}>
            {isMyTurn ? 'Roll the dice!' : 'is playing...'}
          </div>
        </div>
      </div>
    </div>
  )
}
