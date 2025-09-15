import { transformPlayer, transformSettlement } from '../utils/dataTransformers';
import config from '../config';

// Types
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Token Management
const TOKEN_KEY = 'poker_ledger_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

class API {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = config.API_URL + '/api/v1';
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenManager.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      // Token expired or invalid
      tokenManager.removeToken();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Invalid credentials');
    }

    const data: AuthResponse = await response.json();
    tokenManager.setToken(data.access_token);
    return data;
  }

  async register(data: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    tokenManager.removeToken();
  }

  // Game Session endpoints
  async getGameSessions() {
    return this.request('/game-sessions/');
  }

  async getGameSession(id: number) {
    return this.request(`/game-sessions/${id}`);
  }

  async createGameSession(data: any) {
    return this.request('/game-sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGameSession(id: number, data: any) {
    return this.request(`/game-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGameSession(id: number) {
    return this.request(`/game-sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async calculateSettlements(gameSessionId: number) {
    return this.request(`/game-sessions/${gameSessionId}/calculate-settlements`, {
      method: 'POST',
    });
  }

  // Player endpoints
  async getUniquePlayerNames(): Promise<string[]> {
    const response = await this.request('/players/unique-names');
    return response as string[];
  }

  async addPlayer(gameSessionId: number, player: any): Promise<any> {
    return this.request(`/game-sessions/${gameSessionId}/players`, {
      method: 'POST',
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(playerId: number, data: any) {
    return this.request(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlayer(playerId: number) {
    return this.request(`/players/${playerId}`, {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const api = new API(); 