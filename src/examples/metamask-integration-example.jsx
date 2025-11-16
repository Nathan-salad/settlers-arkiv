/**
 * Example: Using MetaMask with API Client
 * 
 * This shows how to integrate MetaMask wallet connection with the game API
 */

import { useState, useEffect } from 'react';
import { connectWallet, getCurrentWallet, onAccountChanged, formatAddress } from '../utils/metamask';
import { createLobby, joinLobby } from '../api/apiClient';

function MetaMaskExample() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if already connected on component mount
  useEffect(() => {
    getCurrentWallet().then(address => {
      if (address) {
        setWalletAddress(address);
      }
    });

    // Listen for account changes
    const cleanup = onAccountChanged((newAddress) => {
      setWalletAddress(newAddress);
      if (!newAddress) {
        setError('Wallet disconnected');
        setLobby(null);
      }
    });

    return cleanup;
  }, []);

  // Handle wallet connection
  const handleConnect = async () => {
    setError(null);
    setLoading(true);

    try {
      const address = await connectWallet();
      setWalletAddress(address);
      console.log('Connected wallet:', address);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new lobby
  const handleCreateLobby = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Use the wallet address as the publicKey
      const newLobby = await createLobby({
        playerName: playerName.trim(),
        publicKey: walletAddress
      });

      setLobby(newLobby);
      console.log('Created lobby:', newLobby);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Join an existing lobby
  const handleJoinLobby = async (gameId) => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Use the wallet address as the publicKey
      await joinLobby(gameId, {
        playerName: playerName.trim(),
        publicKey: walletAddress
      });

      console.log('Joined lobby:', gameId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MetaMask + API Integration</h1>

      {/* Wallet Connection */}
      <div className="mb-6">
        {walletAddress ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">
              Connected: {formatAddress(walletAddress)}
            </span>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Player Name Input */}
      {walletAddress && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      {/* Create Lobby */}
      {walletAddress && (
        <div className="mb-6">
          <button
            onClick={handleCreateLobby}
            disabled={loading || !playerName.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Lobby'}
          </button>
        </div>
      )}

      {/* Lobby Info */}
      {lobby && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Lobby Created!</h2>
          <p className="text-sm">Game ID: {lobby.gameId}</p>
          <p className="text-sm">Players: {lobby.players.length}</p>
          <div className="mt-2">
            {lobby.players.map((player, idx) => (
              <div key={idx} className="text-sm">
                {player.playerName} ({formatAddress(player.publicKey)})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MetaMaskExample;
