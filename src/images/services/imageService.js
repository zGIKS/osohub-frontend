import apiClient, { config } from '../../shared/api/client';
import { debugLog, getCurrentUserId, getCurrentUsername } from '../../config';

export const imageService = {
  // Get global feed - requires day_bucket parameter (YYYY-MM-DD)
  getFeed: async (dayBucket = null) => {
    debugLog('Getting feed...');
    
    // Use provided dayBucket or default to today
    const targetDate = dayBucket || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const response = await apiClient.get(`${config.endpoints.GET_FEED}?day_bucket=${targetDate}`);
    return response.data;
  },

  // Upload new image - usando Cloudinary con FormData
  uploadImage: async (imageFile, title = '') => {
    debugLog('Uploading image file to Cloudinary...', { 
      fileName: imageFile.name, 
      fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: imageFile.type,
      title 
    });
    
    try {
      // Crear FormData según tu API spec
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      
      debugLog('FormData created, sending to backend...');
      
      // Enviar usando FormData (Content-Type se establece automáticamente)
      const response = await apiClient.post(config.endpoints.UPLOAD_IMAGE, formData, {
        // No establecer headers para FormData - axios lo manejará automáticamente
      });
      
      debugLog('Upload successful:', {
        image_id: response.data.image_id,
        image_url: response.data.image_url,
        title: response.data.title,
        user_id: response.data.user_id,
        username: response.data.username,
        uploaded_at: response.data.uploaded_at,
        day_bucket: response.data.day_bucket
      });
      
      return response.data;
    } catch (error) {
      debugLog('Upload error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Upload image URL - nuevo método para tu spec exacta
  uploadImageURL: async (imageUrl, title = '') => {
    debugLog('Uploading image URL...', { imageUrl, title });
    const response = await apiClient.post(config.endpoints.UPLOAD_IMAGE, {
      image_url: imageUrl,
      title: title
    });
    return response.data;
  },

  // Get image by ID
  getImageById: async (imageId) => {
    debugLog('Getting image by ID...', { imageId });
    const endpoint = config.endpoints.GET_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Delete image
  deleteImage: async (imageId) => {
    debugLog('Deleting image...', { imageId });
    const endpoint = config.endpoints.DELETE_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  // Like image
  likeImage: async (imageId) => {
    debugLog('Liking image...', { imageId });
    const endpoint = config.endpoints.LIKE_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.post(endpoint);
    return response.data;
  },

  // Remove like (usando el mismo endpoint con DELETE)
  removeLike: async (imageId) => {
    debugLog('Removing like...', { imageId });
    const endpoint = config.endpoints.UNLIKE_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  // Get like count
  getLikeCount: async (imageId) => {
    debugLog('Getting like count...', { imageId });
    const endpoint = config.endpoints.GET_LIKES_COUNT.replace(':image_id', imageId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Report image - según tu spec: { "reason": "string" }
  reportImage: async (imageId, reason = '') => {
    debugLog('Reporting image...', { imageId, reason });
    const endpoint = config.endpoints.REPORT_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.post(endpoint, { reason });
    return response.data;
  },

  // Get reports count
  getReportsCount: async (imageId) => {
    debugLog('Getting reports count...', { imageId });
    const endpoint = config.endpoints.GET_REPORTS_COUNT.replace(':image_id', imageId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Get user images (profile)
  getUserImages: async (userId) => {
    debugLog('Getting user images...', { userId });
    const endpoint = config.endpoints.GET_USER_IMAGES.replace(':user_id', userId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },
};
