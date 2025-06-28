import apiClient from '../../shared/api/client';

export const userService = {
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Return mock data as fallback
      return {
        id: localStorage.getItem('currentUserId') || '1',
        username: 'photographer1',
        email: 'photographer1@example.com',
        bio: 'Passionate photographer capturing life\'s beautiful moments',
        profile_picture_url: null
      };
    }
  },

  async updateUser(userData) {
    try {
      const response = await apiClient.patch('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};
