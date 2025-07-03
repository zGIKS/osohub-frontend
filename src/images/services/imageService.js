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
      debugLog('Like count endpoint:', endpoint);
      const response = await apiClient.get(endpoint);
      debugLog('Like count response:', { imageId, response: response.data });
      
      // API returns a number or object with count - handle different response formats
      if (typeof response.data === 'number') {
        return { count: response.data };
      }
      // Handle different possible response formats from the API spec
      const count = response.data.count || response.data.likes || response.data.additionalProp1 || response.data.additionalProp2 || response.data.additionalProp3 || 0;
      return { count };
    } catch (error) {
      debugLog('Failed to get like count:', { 
        imageId, 
        error: error.message, 
        status: error.response?.status,
        statusText: error.response?.statusText,
        endpoint: config.endpoints.GET_LIKES_COUNT.replace(':image_id', imageId)
      });
      
      // If it's a 404, the endpoint might not be implemented yet
      if (error.response?.status === 404) {
        debugLog('Like count endpoint not found (404) - endpoint may not be implemented in backend');
      }
      
      return { count: 0 }; // Default to 0 on error
    }
  },

  // Check if current user liked the image
  checkIfLiked: async (imageId) => {
    debugLog('Checking if image is liked...', { imageId });
    try {
      const endpoint = config.endpoints.CHECK_IF_LIKED.replace(':image_id', imageId);
      debugLog('Like status endpoint:', endpoint);
      const response = await apiClient.get(endpoint);
      debugLog('Like status response:', { imageId, response: response.data });
      
      // API returns {'liked': true/false} - handle different possible formats
      const liked = response.data.liked === true || response.data.additionalProp1 === true || response.data.additionalProp2 === true || response.data.additionalProp3 === true;
      return liked;
    } catch (error) {
      // If endpoint doesn't exist or fails, assume not liked
      debugLog('Could not check like status, assuming not liked', { 
        imageId, 
        error: error.message, 
        status: error.response?.status,
        statusText: error.response?.statusText,
        endpoint: config.endpoints.CHECK_IF_LIKED.replace(':image_id', imageId)
      });
      
      if (error.response?.status === 404) {
        debugLog('Like status endpoint not found (404) - endpoint may not be implemented in backend');
      }
      
      return false;
    }
  },

  // Report image - según tu spec: { "category": "string", "reason": "string" }
  reportImage: async (imageId, category, reason = '') => {
    debugLog('Reporting image...', { imageId, category, reason });
    try {
      const endpoint = config.endpoints.REPORT_IMAGE.replace(':image_id', imageId);
      debugLog('Report endpoint:', endpoint);
      debugLog('Report payload:', { category, reason });
      
      const response = await apiClient.post(endpoint, { 
        category: category,
        reason: reason 
      });
      
      debugLog('Report response:', response.data);
      return response.data;
    } catch (error) {
      debugLog('Report error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Get available report categories - GET /reports/categories
  getReportCategories: async () => {
    debugLog('Getting report categories...');
    try {
      const response = await apiClient.get(config.endpoints.GET_REPORT_CATEGORIES);
      debugLog('Report categories response:', response.data);
      
      // Handle different response formats
      const categories = response.data.categories || response.data.additionalProp1 || response.data.additionalProp2 || response.data.additionalProp3 || [];
      
      // If API returns raw categories array, normalize it
      if (Array.isArray(categories)) {
        return categories;
      }
      
      // Fallback categories if API doesn't return proper format
      return [
        { id: "harassment", name: "Harassment", description: "Content that harasses, intimidates or bothers other users" },
        { id: "hate", name: "Hate Speech", description: "Content that promotes hatred against groups or individuals" },
        { id: "spam", name: "Spam", description: "Repetitive, unwanted or promotional content" },
        { id: "inappropriate", name: "Inappropriate Content", description: "Explicit sexual content or material not suitable for all audiences" },
        { id: "violence", name: "Violence", description: "Content that shows or promotes violence" },
        { id: "misinformation", name: "Misinformation", description: "False or misleading information" },
        { id: "copyright", name: "Copyright", description: "Unauthorized use of copyrighted content" },
        { id: "other", name: "Other", description: "Other reasons not listed above" }
      ];
    } catch (error) {
      debugLog('Failed to get report categories, using fallback:', error.message);
      // Return fallback categories
      return [
        { id: "harassment", name: "Harassment", description: "Content that harasses, intimidates or bothers other users" },
        { id: "hate", name: "Hate Speech", description: "Content that promotes hatred against groups or individuals" },
        { id: "spam", name: "Spam", description: "Repetitive, unwanted or promotional content" },
        { id: "inappropriate", name: "Inappropriate Content", description: "Explicit sexual content or material not suitable for all audiences" },
        { id: "violence", name: "Violence", description: "Content that shows or promotes violence" },
        { id: "misinformation", name: "Misinformation", description: "False or misleading information" },
        { id: "copyright", name: "Copyright", description: "Unauthorized use of copyrighted content" },
        { id: "other", name: "Other", description: "Other reasons not listed above" }
      ];
    }
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
