/**
 * MetaMask Wallet Integration
 */

/**
 * Check if MetaMask is installed
 * @returns {boolean}
 */
export function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask and get the user's wallet address
 * @returns {Promise<string>} The user's Ethereum address (public key)
 */
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return accounts[0]; // Return the first account address
  } catch (error) {
    if (error.code === 4001) {
      // User rejected the request
      throw new Error('Please connect your wallet to continue.');
    }
    throw error;
  }
}

/**
 * Get the currently connected wallet address (if already connected)
 * @returns {Promise<string|null>} The user's address or null if not connected
 */
export async function getCurrentWallet() {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current wallet:', error);
    return null;
  }
}

/**
 * Listen for account changes
 * @param {Function} callback - Called when the account changes with new address
 * @returns {Function} Cleanup function to remove the listener
 */
export function onAccountChanged(callback) {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      callback(null);
    } else {
      callback(accounts[0]);
    }
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);

  // Return cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
}

/**
 * Listen for chain/network changes
 * @param {Function} callback - Called when the chain changes with new chainId
 * @returns {Function} Cleanup function to remove the listener
 */
export function onChainChanged(callback) {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handleChainChanged = (chainId) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handleChainChanged);

  // Return cleanup function
  return () => {
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };
}

/**
 * Get the current network/chain ID
 * @returns {Promise<string>} The chain ID in hex format
 */
export async function getCurrentChainId() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  return await window.ethereum.request({ method: 'eth_chainId' });
}

/**
 * Format address for display (0x1234...5678)
 * @param {string} address - Full Ethereum address
 * @param {number} chars - Number of chars to show on each side (default: 4)
 * @returns {string} Formatted address
 */
export function formatAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export default {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentWallet,
  onAccountChanged,
  onChainChanged,
  getCurrentChainId,
  formatAddress
};
