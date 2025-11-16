/**
 * Real API Client
 * Connects to backend API using fetch
 */

/**
 * API Client class
 */
export class ApiClient {
  constructor(baseURL) {
    if (!baseURL) {
      throw new Error('baseURL is required');
    }
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  }

  /**
   * Helper method to make API requests
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response statuses
      if (response.status === 204) {
        // No content
        return null;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${url}`);
      }
      throw error;
    }
  }

  /**
   * Create a new lobby
   * @param {Object} params
   * @param {string} params.playerName
   * @param {string} params.publicKey
   * @returns {Promise<Object>} Lobby object
   */
  async createLobby({ playerName, publicKey }) {
    return this._request('/lobbies', {
      method: 'POST',
      body: JSON.stringify({ playerName, publicKey })
    });
  }

  /**
   * Get lobby by game ID
   * @param {string} gameId
   * @returns {Promise<Object>} Lobby object
   */
  async getLobby(gameId) {
    return this._request(`/lobbies/${gameId}`, {
      method: 'GET'
    });
  }

  /**
   * Join an existing lobby
   * @param {string} gameId
   * @param {Object} params
   * @param {string} params.playerName
   * @param {string} params.publicKey
   * @returns {Promise<void>}
   */
  async joinLobby(gameId, { playerName, publicKey }) {
    return this._request(`/lobbies/${gameId}/players`, {
      method: 'POST',
      body: JSON.stringify({ playerName, publicKey })
    });
  }

  /**
   * Add a bot player to lobby
   * @param {string} gameId
   * @returns {Promise<void>}
   */
  async addBot(gameId) {
    return this._request(`/lobbies/${gameId}/bot`, {
      method: 'POST'
    });
  }

  /**
   * Start game (close lobby)
   * @param {string} gameId
   * @returns {Promise<void>}
   */
  async startGame(gameId) {
    return this._request(`/lobbies/${gameId}/open`, {
      method: 'PUT',
      body: JSON.stringify(true)
    });
  }

  /**
   * Get game state
   * @param {string} gameId
   * @returns {Promise<Object>} Game object
   */
  async getGame(gameId) {
    return this._request(`/games/${gameId}`, {
      method: 'GET'
    });
  }

  /**
   * Roll dice for the current turn
   * @param {string} gameId
   * @param {Array<number>} [heldDice] - Dice to hold from previous roll
   * @returns {Promise<Object>} Updated game state
   */
  async rollDice(gameId, heldDice = []) {
    return this._request(`/games/${gameId}/roll`, {
      method: 'POST',
      body: JSON.stringify({ heldDice })
    });
  }

  /**
   * End the current player's turn
   * @param {string} gameId
   * @returns {Promise<Object>} Updated game state
   */
  async endTurn(gameId) {
    return this._request(`/games/${gameId}/end-turn`, {
      method: 'POST'
    });
  }

  /**
   * Subscribe to game updates via polling
   * @param {string} gameId
   * @param {Function} callback - Called with updated game state
   * @param {number} interval - Polling interval in milliseconds (default: 2000)
   * @returns {Function} Unsubscribe function
   */
  subscribeToGame(gameId, callback, interval = 2000) {
    let isActive = true;
    let timeoutId = null;

    const poll = async () => {
      if (!isActive) return;

      try {
        const gameState = await this.getGame(gameId);
        callback(gameState);
      } catch (error) {
        console.error('[API] Polling error:', error);
        callback(null, error);
      }

      if (isActive) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return unsubscribe function
    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Subscribe to game updates via WebSocket (if backend supports it)
   * @param {string} gameId
   * @param {Function} callback - Called with updated game state
   * @param {string} wsURL - WebSocket URL (defaults to baseURL with ws:// protocol)
   * @returns {Function} Unsubscribe function
   */
  subscribeToGameWS(gameId, callback, wsURL = null) {
    // Convert http(s) to ws(s)
    const url = wsURL || this.baseURL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${url}/games/${gameId}/subscribe`);

    ws.onmessage = (event) => {
      try {
        const gameState = JSON.parse(event.data);
        callback(gameState);
      } catch (error) {
        console.error('[API] WebSocket parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[API] WebSocket error:', error);
      callback(null, error);
    };

    ws.onclose = () => {
      console.log('[API] WebSocket closed');
    };

    // Return unsubscribe function
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }
}

/**
 * Create a new API client instance
 * @param {string} baseURL - Base URL of the API
 * @returns {ApiClient}
 */
export function createApiClient(baseURL) {
  return new ApiClient(baseURL);
}

export default ApiClient;
