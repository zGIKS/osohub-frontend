import apiClient from '../../shared/api/client';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Create user
  register: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/users/me', profileData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Ban/unban user (admin only)
  banUser: async (userId, banned = true) => {
    const response = await apiClient.patch(`/users/${userId}/ban`, { banned });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get current user ID
  getCurrentUserId: () => {
    return localStorage.getItem('currentUserId');
  }
};
