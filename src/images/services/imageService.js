import apiClient from '../../shared/api/client';

export const imageService = {
  // Get global feed
  getFeed: async () => {
    const response = await apiClient.get('/feed');
    return response.data;
  },

  // Upload new image
  uploadImage: async (imageFile, description = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('description', description);
    
    const response = await apiClient.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get image by ID
  getImageById: async (imageId) => {
    const response = await apiClient.get(`/images/byid/${imageId}`);
    return response.data;
  },

  // Delete image
  deleteImage: async (imageId) => {
    const response = await apiClient.delete(`/images/${imageId}`);
    return response.data;
  },

  // Like image
  likeImage: async (imageId) => {
    const response = await apiClient.post(`/images/${imageId}/like`);
    return response.data;
  },

  // Remove like
  removeLike: async (imageId) => {
    const response = await apiClient.delete(`/images/${imageId}/like`);
    return response.data;
  },

  // Get like count
  getLikeCount: async (imageId) => {
    const response = await apiClient.get(`/images/${imageId}/likes/count`);
    return response.data;
  },

  // Report image
  reportImage: async (imageId, reason = '') => {
    const response = await apiClient.post(`/images/${imageId}/report`, { reason });
    return response.data;
  },

  // Get user images (profile)
  getUserImages: async (userId) => {
    const response = await apiClient.get(`/users/${userId}/images`);
    return response.data;
  },
};
