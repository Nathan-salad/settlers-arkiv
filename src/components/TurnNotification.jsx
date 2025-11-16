import { useEffect, useState } from 'react'

/**
 * Animated turn notification overlay
 */
export default function TurnNotification({ playerName, show, onComplete }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1500) // Reduced from 2000ms to 1500ms
      return () => clearTimeout(timer)
    } else {
      // Immediately hide when show becomes false
      setVisible(false)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pop-in">
        <div className="bg-cyber-darker border-4 border-cyber-green p-8 rounded-lg text-center shadow-[0_0_40px_rgba(57,255,20,0.6)]">
          <div className="text-sm text-cyber-green font-mono mb-2">
            [TURN START]
          </div>
          <div className="text-4xl font-bold text-cyber-green glitch mb-2">
            {playerName}
          </div>
          <div className="text-sm text-cyber-blue font-mono">
            Roll the dice!
          </div>
        </div>
      </div>
    </div>
  )
}
