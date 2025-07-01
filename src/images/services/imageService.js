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

  // Delete image
  deleteImage: async (imageId) => {
    debugLog('Deleting image...', { imageId });
    const endpoint = config.endpoints.DELETE_IMAGE.replace(':image_id', imageId);
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  // Like image (usando POST)
  likeImage: async (imageId) => {
    debugLog('Liking image...', { imageId });
    try {
      const endpoint = config.endpoints.LIKE_IMAGE.replace(':image_id', imageId);
      const response = await apiClient.post(endpoint);
      debugLog('Like response:', { 
        imageId, 
        status: response.status, 
        data: response.data 
      });
      
      // Backend returns 204 No Content, so check status instead of data
      if (response.status === 204) {
        return { success: true };
      }
      return response.data || { success: true };
    } catch (error) {
      debugLog('Like error:', { imageId, error: error.message, status: error.response?.status });
      throw error; // Re-throw to allow calling code to handle
    }
  },

  // Remove like (usando DELETE)
  removeLike: async (imageId) => {
    debugLog('Removing like...', { imageId });
    try {
      const endpoint = config.endpoints.UNLIKE_IMAGE.replace(':image_id', imageId); 
      const response = await apiClient.delete(endpoint);
      debugLog('Unlike response:', { 
        imageId, 
        status: response.status, 
        data: response.data 
      });
      
      // Backend returns 204 No Content, so check status instead of data
      if (response.status === 204) {
        return { success: true };
      }
      return response.data || { success: true };
    } catch (error) {
      debugLog('Unlike error:', { imageId, error: error.message, status: error.response?.status });
      throw error; // Re-throw to allow calling code to handle
    }
  },

  // Get like count
  getLikeCount: async (imageId) => {
    debugLog('Getting like count...', { imageId });
    try {
      const endpoint = config.endpoints.GET_LIKES_COUNT.replace(':image_id', imageId);
      const response = await apiClient.get(endpoint);
      debugLog('Like count response:', { imageId, response: response.data });
      
      // API returns a number or object with count - handle different response formats
      if (typeof response.data === 'number') {
        return { count: response.data };
      }
      // Handle different possible response formats from the API spec
      const count = response.data.count || response.data.likes || response.data.additionalProp1 || 0;
      return { count };
    } catch (error) {
      debugLog('Failed to get like count:', { imageId, error: error.message });
      return { count: 0 }; // Default to 0 on error
    }
  },

  // Check if current user liked the image
  checkIfLiked: async (imageId) => {
    debugLog('Checking if image is liked...', { imageId });
    try {
      const endpoint = config.endpoints.CHECK_IF_LIKED.replace(':image_id', imageId);
      const response = await apiClient.get(endpoint);
      debugLog('Like status response:', { imageId, response: response.data });
      
      // API returns {'liked': true/false} - handle the specific format
      return response.data.liked === true;
    } catch (error) {
      // If endpoint doesn't exist or fails, assume not liked
      debugLog('Could not check like status, assuming not liked', { imageId, error: error.message, status: error.response?.status });
      return false;
    }
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
