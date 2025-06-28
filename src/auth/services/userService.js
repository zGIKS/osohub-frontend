import apiClient, { config } from '../../shared/api/client';
import { debugLog, getCurrentUserId } from '../../config';

export const userService = {
  // Login - POST /auth/login
  async login(email, password) {
    try {
      debugLog('Logging in user...', { email });
      const response = await apiClient.post(config.endpoints.LOGIN, {
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      debugLog('Login error:', error);
      throw error;
    }
  },

  // Create user - POST /users
  async createUser(userData) {
    try {
      debugLog('Creating user...', { username: userData.username, email: userData.email });
      const response = await apiClient.post(config.endpoints.CREATE_USER, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        bio: userData.bio || '',
        profile_picture_url: userData.profile_picture_url || ''
      });
      return response.data;
    } catch (error) {
      debugLog('User creation error:', error);
      throw error;
    }
  },

  // Get user by ID - GET /users/:user_id
  async getUserById(userId) {
    try {
      debugLog('Getting user by ID...', { userId });
      const endpoint = config.endpoints.GET_USER.replace(':user_id', userId);
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      debugLog('Get user error:', error);
      throw error;
    }
  },

  // Get current user - usando GET /users/me 
  async getCurrentUser() {
    try {
      debugLog('Getting current user...');
      const response = await apiClient.get(config.endpoints.UPDATE_PROFILE);
      return response.data;
    } catch (error) {
      debugLog('Current user error:', error);
      throw error; // No usar fallback, propagar el error
    }
  },

  // Update user profile - PATCH /users/me
  async updateUser(userData) {
    try {
      debugLog('Updating user...', userData);
      // Solo envía los campos que han cambiado
      const updateData = {};
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.profile_picture_url !== undefined) updateData.profile_picture_url = userData.profile_picture_url;
      if (userData.password !== undefined) updateData.password = userData.password;

      const response = await apiClient.patch(config.endpoints.UPDATE_PROFILE, updateData);
      return response.data;
    } catch (error) {
      debugLog('User update error:', error);
      throw error;
    }
  },

  // Ban user - POST /users/:user_id/ban (admin functionality)
  async banUser(userId) {
    try {
      debugLog('Banning user...', { userId });
      const endpoint = config.endpoints.BAN_USER.replace(':user_id', userId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      debugLog('Ban user error:', error);
      throw error;
    }
  },

  // Get user images - GET /users/:user_id/images
  async getUserImages(userId) {
    try {
      debugLog('Getting user images...', { userId });
      const endpoint = config.endpoints.GET_USER_IMAGES.replace(':user_id', userId);
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      debugLog('Get user images error:', error);
      throw error;
    }
  }
};
