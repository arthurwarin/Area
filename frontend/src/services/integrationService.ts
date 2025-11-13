const API_BASE_URL = process.env.NEXT_PUBLIC_LINK_URL || 'http://localhost:8084';

class IntegrationService {
  private getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    if (typeof window === 'undefined') {
      return includeContentType ? {
        'Content-Type': 'application/json',
      } : {};
    }
    const token = localStorage.getItem('authToken'); // Use same key as authService
    console.log('Auth token found:', token ? 'Yes' : 'No');
    const headers: Record<string, string> = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async connectDiscord(): Promise<{ url: string }> {
    try {
      console.log('Attempting to connect to Discord with URL:', `${API_BASE_URL}/oauth/discord`);
      const response = await fetch(`${API_BASE_URL}/oauth/discord`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord auth request failed:', response.status, errorText);
        throw new Error(`Failed to get Discord auth URL: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to Discord:', error);
      throw error;
    }
  }

  async connectGithub(): Promise<{ url: string }> {
    try {
      console.log('Attempting to connect to GitHub with URL:', `${API_BASE_URL}/oauth/github`);
      const response = await fetch(`${API_BASE_URL}/oauth/github`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub auth request failed:', response.status, errorText);
        throw new Error(`Failed to get GitHub auth URL: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      throw error;
    }
  }

  async connectReddit(): Promise<{ url: string }> {
    try {
      console.log('Attempting to connect to Reddit with URL:', `${API_BASE_URL}/oauth/reddit`);
      const response = await fetch(`${API_BASE_URL}/oauth/reddit`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reddit auth request failed:', response.status, errorText);
        throw new Error(`Failed to get Reddit auth URL: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to Reddit:', error);
      throw error;
    }
  }

  async connectSpotify(): Promise<{ url: string }> {
    try {
      console.log('Attempting to connect to Spotify with URL:', `${API_BASE_URL}/oauth/spotify`);
      const response = await fetch(`${API_BASE_URL}/oauth/spotify`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify auth request failed:', response.status, errorText);
        throw new Error(`Failed to get Spotify auth URL: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      throw error;
    }
  }

  async connectSlack(): Promise<{ url: string }> {
    try {
      console.log('Attempting to connect to Slack with URL:', `${API_BASE_URL}/oauth/slack`);
      const response = await fetch(`${API_BASE_URL}/oauth/slack`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Slack auth request failed:', response.status, errorText);
        throw new Error(`Failed to get Slack auth URL: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to Slack:', error);
      throw error;
    }
  }

  async getUserConnections() {
    try {
      console.log('Attempting to get user connections with URL:', `${API_BASE_URL}/connections`);
      const response = await fetch(`${API_BASE_URL}/connections`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get user connections failed:', response.status, errorText);
        throw new Error(`Failed to get user connections: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  }

  async disconnectService(serviceType: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/connections/${serviceType}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(false), // Don't send Content-Type for DELETE
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${serviceType}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error disconnecting ${serviceType}:`, error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();
