import ResourceIcon from './ResourceIcon'

/**
 * Help/Tutorial modal explaining game rules
 */
export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-cyber-darker border-4 border-cyber-blue rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cyber-darker border-b-2 border-cyber-blue p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyber-blue font-mono">
            [GAME RULES]
          </h2>
          <button
            onClick={onClose}
            className="text-cyber-pink hover:text-cyber-blue text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="text-xl font-bold text-cyber-green mb-3 font-mono">
              OBJECTIVE
            </h3>
            <p className="text-cyber-blue/90 font-mono text-sm leading-relaxed">
              Build roads, settlements, cities, and knights by rolling dice. 
              Complete 15 turns and score the most points to win!
            </p>
          </section>

          {/* Turn Structure */}
          <section className="border-t-2 border-cyber-blue/30 pt-6">
            <h3 className="text-xl font-bold text-cyber-green mb-3 font-mono">
              YOUR TURN
            </h3>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex items-start gap-3">
                <span className="text-cyber-pink font-bold">1.</span>
                <span className="text-cyber-blue/90">
                  <span className="text-cyber-green font-bold">ROLL DICE:</span> Roll all 6 dice showing resources
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyber-pink font-bold">2.</span>
                <span className="text-cyber-blue/90">
                  <span className="text-cyber-green font-bold">LOCK/UNLOCK:</span> Click dice to lock them (up to 3 rolls total)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyber-pink font-bold">3.</span>
                <span className="text-cyber-blue/90">
                  <span className="text-cyber-green font-bold">BUILD:</span> Use your dice to build structures
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyber-pink font-bold">4.</span>
                <span className="text-cyber-blue/90">
                  <span className="text-cyber-green font-bold">END TURN:</span> Pass to the next player
                </span>
              </div>
            </div>
          </section>

          {/* Resources */}
          <section className="border-t-2 border-cyber-blue/30 pt-6">
            <h3 className="text-xl font-bold text-cyber-green mb-3 font-mono">
              RESOURCES
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: 'lumber', name: 'Lumber' },
                { type: 'brick', name: 'Brick' },
                { type: 'wool', name: 'Wool' },
                { type: 'wheat', name: 'Wheat' },
                { type: 'ore', name: 'Ore' },
                { type: 'gold', name: 'Gold' }
              ].map(resource => (
                <div key={resource.type} className="flex items-center gap-2 p-2 border border-cyber-blue/30 rounded">
                  <ResourceIcon resource={resource.type} size="sm" />
                  <span className="text-cyber-blue text-sm font-mono">{resource.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Build Costs */}
          <section className="border-t-2 border-cyber-blue/30 pt-6">
            <h3 className="text-xl font-bold text-cyber-green mb-3 font-mono">
              BUILD COSTS
            </h3>
            <div className="space-y-4">
              <div className="bg-cyber-blue/10 p-4 rounded border-l-4 border-cyber-blue">
                <div className="text-cyber-blue font-bold mb-2">ROAD</div>
                <div className="flex gap-2 mb-2">
                  <ResourceIcon resource="lumber" size="sm" />
                  <ResourceIcon resource="brick" size="sm" />
                </div>
                <div className="text-xs text-cyber-blue/70 font-mono">1 point each</div>
              </div>

              <div className="bg-cyber-green/10 p-4 rounded border-l-4 border-cyber-green">
                <div className="text-cyber-green font-bold mb-2">SETTLEMENT</div>
                <div className="flex gap-2 mb-2">
                  <ResourceIcon resource="lumber" size="sm" />
                  <ResourceIcon resource="brick" size="sm" />
                  <ResourceIcon resource="wheat" size="sm" />
                  <ResourceIcon resource="wool" size="sm" />
                </div>
                <div className="text-xs text-cyber-green/70 font-mono">3 points each</div>
              </div>

              <div className="bg-cyber-purple/10 p-4 rounded border-l-4 border-cyber-purple">
                <div className="text-cyber-purple font-bold mb-2">CITY</div>
                <div className="flex gap-2 mb-2">
                  <ResourceIcon resource="ore" size="sm" />
                  <ResourceIcon resource="ore" size="sm" />
                  <ResourceIcon resource="ore" size="sm" />
                  <ResourceIcon resource="wheat" size="sm" />
                  <ResourceIcon resource="wheat" size="sm" />
                </div>
                <div className="text-xs text-cyber-purple/70 font-mono">5 points each</div>
              </div>

              <div className="bg-cyber-pink/10 p-4 rounded border-l-4 border-cyber-pink">
                <div className="text-cyber-pink font-bold mb-2">KNIGHT</div>
                <div className="flex gap-2 mb-2">
                  <ResourceIcon resource="ore" size="sm" />
                  <ResourceIcon resource="wool" size="sm" />
                  <ResourceIcon resource="wheat" size="sm" />
                </div>
                <div className="text-xs text-cyber-pink/70 font-mono">2 points each</div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="border-t-2 border-cyber-blue/30 pt-6">
            <h3 className="text-xl font-bold text-cyber-green mb-3 font-mono">
              TIPS
            </h3>
            <ul className="space-y-2 text-sm font-mono text-cyber-blue/90">
              <li className="flex items-start gap-2">
                <span className="text-cyber-green">▸</span>
                <span>Lock dice strategically to build specific structures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-green">▸</span>
                <span>Cities are worth the most points (5 each)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-green">▸</span>
                <span>You have 3 rolls per turn - use them wisely!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-green">▸</span>
                <span>Gold dice can be used as any resource</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cyber-darker border-t-2 border-cyber-blue p-6">
          <button
            onClick={onClose}
            className="neon-btn text-cyber-blue border-cyber-blue w-full"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  )
}
