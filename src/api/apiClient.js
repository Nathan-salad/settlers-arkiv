/**
 * Unified API Client
 * Provides a single interface to switch between mock and real API clients
 */

import mockClient from './mockApiClient.js';
import { createApiClient } from './realApiClient.js';

/**
 * Configuration
 * Set USE_MOCK_API to true for local development with mock data
 * Set USE_MOCK_API to false to connect to real backend
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Initialize the appropriate API client
 */
let apiClient;

if (USE_MOCK_API) {
  console.log('[API] Using MOCK API client');
  apiClient = mockClient;
} else {
  console.log('[API] Using REAL API client with base URL:', API_BASE_URL);
  apiClient = createApiClient(API_BASE_URL);
}

/**
 * Export unified API interface
 */
export const createLobby = (...args) => apiClient.createLobby(...args);
export const getLobby = (...args) => apiClient.getLobby(...args);
export const joinLobby = (...args) => apiClient.joinLobby(...args);
export const addBot = (...args) => apiClient.addBot(...args);
export const startGame = (...args) => apiClient.startGame(...args);
export const getGame = (...args) => apiClient.getGame(...args);
export const rollDice = (...args) => apiClient.rollDice(...args);
export const endTurn = (...args) => apiClient.endTurn(...args);

/**
 * Get the current API client instance
 * Useful for advanced use cases
 */
export const getApiClient = () => apiClient;

/**
 * Switch to a different API client at runtime (for testing)
 * @param {'mock' | 'real'} type
 * @param {string} [baseURL] - Required when switching to real client
 */
export const switchApiClient = (type, baseURL) => {
  if (type === 'mock') {
    console.log('[API] Switching to MOCK API client');
    apiClient = mockClient;
  } else if (type === 'real') {
    if (!baseURL) {
      throw new Error('baseURL is required when switching to real API client');
    }
    console.log('[API] Switching to REAL API client with base URL:', baseURL);
    apiClient = createApiClient(baseURL);
  } else {
    throw new Error(`Unknown API client type: ${type}`);
  }
};

export default {
  createLobby,
  getLobby,
  joinLobby,
  addBot,
  startGame,
  getGame,
  rollDice,
  endTurn,
  getApiClient,
  switchApiClient
};
