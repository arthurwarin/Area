const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8082'
  : 'http://auth:8082';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async signup(credentials: SignupCredentials): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Signup failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  },

  // Sauvegarder le token dans localStorage
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  // Récupérer le token depuis localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  // Supprimer le token (déconnexion)
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  // Récupérer les informations de l'utilisateur actuel
  async getCurrentUser(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL.replace('8082', '8080')}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  },

  async updateUser(userData: { email?: string; password?: string; currentPassword?: string }): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL.replace('8082', '8080')}/user/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Authentification Microsoft OAuth
  async microsoftAuth(data: {
    microsoftToken: string;
    email: string;
    displayName: string;
    microsoftId: string;
  }): Promise<{ token: string; user: { id: number; email: string; name: string | null } }> {
    const response = await fetch(`${API_BASE_URL}/microsoft/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Microsoft authentication failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};
