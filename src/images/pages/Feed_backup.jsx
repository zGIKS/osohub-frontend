import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ImageCard from '../components/ImageCard';
import ImageUploadModal from '../components/ImageUploadModal';
import { imageService } from '../services/imageService';
import { getCurrentUserId } from '../../config';
import config from '../../config';
import './Feed.css';

const Feed = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Get current user ID from config helper
  const currentUserId = getCurrentUserId() || '1';

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedData = await imageService.getFeed();
      setImages(feedData);
    } catch (error) {
      console.error('Error loading feed:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, title) => {
    try {
      const result = await imageService.uploadImage(file, title);
      await loadFeed(); // Reload feed after upload
      setShowUploadModal(false);
      return result;
    } catch (uploadError) {
      console.error('Error uploading to backend, using mock:', uploadError);
      // Fallback: agregar imagen mock para demo
      try {
        const newImage = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file),
          description: title,
          userId: currentUserId,
          user: { username: 'you' },
          likeCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString()
        };
        setImages(prev => [newImage, ...prev]);
        setShowUploadModal(false);
      } catch (error) {
        console.error('Error creating mock image:', error);
        throw error;
      }
    }
  };

  const handleImageDelete = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
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
        <h1>FEED</h1>
        <button
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus size={20} />
          New Image
        </button>
      </div>

      <div className="feed-grid">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={handleImageDelete}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {images.length === 0 && !loading && (
        <div className="empty-feed">
          <p>No images in the feed</p>
          <button
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Upload the first image
          </button>
        </div>
      )}

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
};
export default Feed;
