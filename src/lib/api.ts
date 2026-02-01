const API_BASE = 'https://functions.poehali.dev';

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Robot {
  id: number;
  name: string;
  model: string;
  has_cleaning: boolean;
  battery_level: number;
  status: string;
  current_task: string;
  is_active: boolean;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async register(data: { email: string; first_name: string; last_name: string; birth_date: string }) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setToken(result.token);
    return result;
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  async getRobots(): Promise<Robot[]> {
    const result = await this.request('/robots');
    return result.robots;
  }

  async connectRobot(data: { name?: string; has_cleaning: boolean }): Promise<Robot> {
    return this.request('/robots/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRobot(id: number, data: Partial<Robot>): Promise<Robot> {
    return this.request(`/robots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async controlRobot(id: number, action: 'start' | 'stop' | 'pause'): Promise<Robot> {
    return this.request(`/robots/${id}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async deleteRobot(id: number): Promise<void> {
    return this.request(`/robots/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
