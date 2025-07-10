import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import ImageCard from '../components/ImageCard';
import ImageUploadModal from '../components/ImageUploadModal';
import FullPostView from '../components/FullPostView';
import { imageService } from '../services/imageService';
import { getCurrentUserId, debugLog } from '../../config';
import './Feed.css';

const Feed = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get current user ID from config helper
  const currentUserId = getCurrentUserId() || '1';

  useEffect(() => {
    loadFeed();
    
    // Escuchar eventos de actualización de perfil para recargar el feed
    const handleUserProfileUpdate = () => {
      debugLog('User profile updated, reloading feed...');
      loadFeed();
    };
    
    window.addEventListener('userProfileUpdated', handleUserProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate);
    };
  }, []);

  // Función para generar rango de fechas
  const generateDateRange = (daysBack = 30) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      let allImages = [];
      
      // Generar fechas de los últimos 30 días para asegurar que veamos todas las imágenes
      const dates = generateDateRange(30);
      debugLog(`Loading feed for ${dates.length} dates`);
      
      // Procesar en lotes para evitar sobrecarga del servidor
      const BATCH_SIZE = 5;
      for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const batch = dates.slice(i, i + BATCH_SIZE);
        debugLog(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} with dates:`, batch);
        
        const promises = batch.map(async (date) => {
          try {
            const feedData = await imageService.getFeed(date);
            debugLog(`Date ${date}: ${feedData?.length || 0} images found`);
            return feedData && Array.isArray(feedData) ? feedData : [];
          } catch (error) {
            debugLog(`Date ${date}: No images or error`, error.message);
            return []; // Si falla, devolver array vacío
          }
        });
        
        const batchResults = await Promise.all(promises);
        batchResults.forEach(result => {
          if (result.length > 0) {
            allImages = [...allImages, ...result];
          }
        });
        
        debugLog(`Total images so far: ${allImages.length}`);
        
        // Pequeña pausa entre lotes para no sobrecargar el servidor
        if (i + BATCH_SIZE < dates.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      debugLog(`Total raw images loaded: ${allImages.length}`);
      
      // Remover duplicados basado en image_id
      const uniqueImages = allImages.filter((image, index, self) => 
        index === self.findIndex(img => img.image_id === image.image_id)
      );
      
      debugLog(`Unique images after deduplication: ${uniqueImages.length}`);
      
      // Transformar y ordenar por fecha (más reciente primero)
      const transformedImages = transformImages(uniqueImages);
      transformedImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      debugLog(`Final transformed images: ${transformedImages.length}`);
      setImages(transformedImages);
    } catch (error) {
      console.error('Error loading feed:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const transformImages = (images) => {
    debugLog('Raw images data before transform:', images.slice(0, 2)); // Solo los primeros 2 para no saturar logs
    
    return images.map(image => ({
      id: image.image_id,
      url: image.image_url === 'null' || !image.image_url ? 
           'https://via.placeholder.com/400x400?text=No+Image' : 
           image.image_url,
      description: image.title || 'Sin título',
      title: image.title || 'Sin título',
      userId: image.user_id,
      user: { 
        username: image.username || 'Usuario desconocido',
        user_id: image.user_id,
        profile_picture_url: image.user_profile_picture_url || null
      },
      likeCount: Math.max(0, image.like_count || 0), // Ensure non-negative like count
      isLiked: image.is_liked || false, // Use backend data if available
      createdAt: image.uploaded_at,
      image_id: image.image_id
    }));
  };

  const handleImageUpload = async (file, title) => {
    try {
      debugLog('Starting image upload...', { fileName: file.name, title });
      const result = await imageService.uploadImage(file, title);
      debugLog('Upload completed successfully:', result);
      
      // Reload feed after successful upload
      await loadFeed();
      setShowUploadModal(false);
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      debugLog('Upload failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Re-throw the error so the modal can handle it
      throw error;
    }
  };

  const handleImageDelete = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseFullPost = () => {
    setSelectedImage(null);
  };

  const handleNavigate = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    
    if (direction === 'next' && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  const getCurrentImageIndex = () => {
    if (!selectedImage) return -1;
    return images.findIndex(img => img.id === selectedImage.id);
  };

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <h3>OSOHUB - for foodies</h3>
        <div className="feed-actions">
          <button 
            className="refresh-btn"
            onClick={loadFeed}
            disabled={loading}
            title="Refresh feed"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
          <button 
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Upload Image
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="empty-feed">
          <div className="empty-feed-icon">
            <Plus size={48} />
          </div>
          <h2>No images yet</h2>
          <p>Be the first to share something amazing!</p>
          <button 
            className="upload-btn primary"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Your First Image
          </button>
        </div>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              currentUserId={currentUserId}
              onDelete={handleImageDelete}
              onClick={handleImageClick}
            />
          ))}
        </div>
      )}

      {showUploadModal && (
        <ImageUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleImageUpload}
        />
      )}

      {selectedImage && (
        <FullPostView
          image={selectedImage}
          images={images}
          currentUserId={currentUserId}
          onClose={handleCloseFullPost}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default Feed;
