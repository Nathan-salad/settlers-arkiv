/**
 * Quick Reference: MetaMask + API Client
 */

import { connectWallet } from '../utils/metamask';
import { createLobby, joinLobby } from '../api/apiClient';

// ============================================
// Example 1: Connect wallet and create lobby
// ============================================

async function createGameWithMetaMask() {
  try {
    // Step 1: Connect MetaMask and get wallet address
    const walletAddress = await connectWallet();
    console.log('Connected:', walletAddress); // e.g., "0x1234567890abcdef..."

    // Step 2: Create lobby using wallet address as publicKey
    const lobby = await createLobby({
      playerName: 'Alice',
      publicKey: walletAddress  // Use the Ethereum address as publicKey
    });

    console.log('Lobby created:', lobby.gameId);
    return lobby;

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// Example 2: Join lobby with MetaMask
// ============================================

async function joinGameWithMetaMask(gameId) {
  try {
    // Get wallet address
    const walletAddress = await connectWallet();

    // Join lobby
    await joinLobby(gameId, {
      playerName: 'Bob',
      publicKey: walletAddress
    });

    console.log('Joined lobby:', gameId);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// Example 3: Simple inline usage
// ============================================

async function quickExample() {
  // Get wallet address from MetaMask
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  const currentAddress = accounts[0];

  // Create lobby with that address
  const lobby = await createLobby({
    playerName: 'Player 1',
    publicKey: currentAddress  // This is your "publicKey"
  });

  console.log('Game ID:', lobby.gameId);
}

// ============================================
// Example 4: Handle account switching
// ============================================

import { onAccountChanged } from '../utils/metamask';

function setupAccountListener() {
  const cleanup = onAccountChanged((newAddress) => {
    if (newAddress) {
      console.log('Switched to:', newAddress);
      // Update your app state with new address
    } else {
      console.log('Wallet disconnected');
      // Handle disconnect
    }
  });

  // Call cleanup when component unmounts
  return cleanup;
}

export {
  createGameWithMetaMask,
  joinGameWithMetaMask,
  quickExample,
  setupAccountListener
};
