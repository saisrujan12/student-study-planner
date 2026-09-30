const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Centralized API service for StudyFlow
 */
const api = {
  /**
   * Make a fetch request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      // Network error
      const networkError = new Error('Unable to connect to server. Please check your connection.');
      networkError.status = 0;
      throw networkError;
    }
  },

  // ==================== TASKS ====================

  /** Create a new task */
  createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  /** Get all tasks with optional filters */
  getTasks(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'All') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    return this.request(`/api/tasks${query ? `?${query}` : ''}`);
  },

  /** Get a single task */
  getTask(id) {
    return this.request(`/api/tasks/${id}`);
  },

  /** Update a task */
  updateTask(id, taskData) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  /** Toggle task completion */
  completeTask(id) {
    return this.request(`/api/tasks/${id}/complete`, {
      method: 'PUT',
    });
  },

  /** Delete a task */
  deleteTask(id) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

export default api;
