const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Action {
  id: number;
  serviceId: number;
  service: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  data: string[];
}

export interface Reaction {
  id: number;
  serviceId: number;
  service: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  data: string[];
}

export interface Workflow {
  id: number;
  userId: number;
  name: string;
  description?: string;
  actionId: number;
  action?: Action;
  actionData: string[];
  reactionId: number;
  reaction?: Reaction;
  reactionData: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: number;
  name: string;
  actions: Action[];
  reactions: Reaction[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  action: {
    id: number;
    data: string[];
  };
  reaction: {
    id: number;
    data: string[];
  };
}

class WorkflowService {
  private getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    if (typeof window === 'undefined') {
      return includeContentType ? {
        'Content-Type': 'application/json',
      } : {};
    }
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/workflow`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch workflows: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  async getWorkflowById(id: number): Promise<Workflow> {
    try {
      const response = await fetch(`${API_BASE_URL}/workflow/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch workflow: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  }

  async createWorkflow(payload: CreateWorkflowPayload): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/workflow`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create workflow: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/workflow/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(false),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete workflow: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch services: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}

export const workflowService = new WorkflowService();
