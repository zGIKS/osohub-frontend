import apiClient, { config } from '../../shared/api/client';
import { debugLog, getCurrentUserId } from '../../config';
import { generateDefaultAvatar } from '../../utils/avatarGenerator';

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
      const response = await apiClient.get(config.endpoints.GET_CURRENT_USER);
      
      debugLog('Current user data received:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Current user error:', error);
      throw error;
    }
  },

  // Update user profile - PATCH /users/me (usando FormData)
  async updateUser(userData) {
    try {
      debugLog('Updating user...', userData);
      
      // Crear FormData para enviar archivos y datos
      const formData = new FormData();
      
      // Solo agregar campos que no son undefined/null
      if (userData.username !== undefined && userData.username !== null) {
        formData.append('username', userData.username);
      }
      if (userData.bio !== undefined && userData.bio !== null) {
        formData.append('bio', userData.bio);
      }
      if (userData.password !== undefined && userData.password !== null) {
        formData.append('password', userData.password);
      }
      if (userData.profile_picture && userData.profile_picture instanceof File) {
        formData.append('profile_picture', userData.profile_picture);
      }

      debugLog('FormData created for user update');
      
      const response = await apiClient.patch(config.endpoints.UPDATE_PROFILE, formData, {
        // No establecer Content-Type para FormData - axios lo manejará automáticamente
      });
      
      debugLog('User update successful:', response.data);
      return response.data;
    } catch (error) {
      debugLog('User update error:', error);
      throw error;
    }
  },

  // Remover foto de perfil y establecer una por defecto
  async removeProfilePicture() {
    try {
      debugLog('Removing profile picture and setting default...');
      
      // Primero obtener datos del usuario actual para el username
      const currentUser = await this.getCurrentUser();
      
      // Generar avatar por defecto
      const defaultAvatarBlob = await generateDefaultAvatar(currentUser.username);
      
      // Crear FormData para subir el avatar por defecto
      const formData = new FormData();
      formData.append('profile_picture', defaultAvatarBlob, `default-avatar-${currentUser.username}.png`);
      
      debugLog('Uploading default avatar...');
      
      // Subir el avatar por defecto
      const response = await apiClient.patch(config.endpoints.UPDATE_PROFILE, formData);
      
      debugLog('Default avatar uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Remove profile picture error:', error);
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
