import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ImageCard from '../components/ImageCard';
import ImageUploadModal from '../components/ImageUploadModal';
import { imageService } from '../services/imageService';
import './Feed.css';

const Feed = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock current user ID - in a real app, this would come from auth context
  const currentUserId = localStorage.getItem('currentUserId') || '1';

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      // For demo purposes, using mock data
      // const feedData = await imageService.getFeed();
      
      // Mock data for demonstration
      const mockData = [
        {
          id: '1',
          url: 'https://picsum.photos/400/400?random=1',
          description: 'Beautiful sunset over the mountains',
          userId: '1',
          user: { username: 'photographer1' },
          likeCount: 15,
          isLiked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          url: 'https://picsum.photos/400/400?random=2',
          description: 'Urban architecture and city lights',
          userId: '2',
          user: { username: 'cityexplorer' },
          likeCount: 23,
          isLiked: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          url: 'https://picsum.photos/400/400?random=3',
          description: 'Minimalist design inspiration',
          userId: '3',
          user: { username: 'designer' },
          likeCount: 8,
          isLiked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          url: 'https://picsum.photos/400/400?random=4',
          description: 'Nature photography at its finest',
          userId: '1',
          user: { username: 'photographer1' },
          likeCount: 42,
          isLiked: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          url: 'https://picsum.photos/400/400?random=5',
          description: 'Street art and urban culture',
          userId: '4',
          user: { username: 'streetartist' },
          likeCount: 31,
          isLiked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '6',
          url: 'https://picsum.photos/400/400?random=6',
          description: 'Black and white photography',
          userId: '5',
          user: { username: 'bnwlover' },
          likeCount: 18,
          isLiked: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      setImages(mockData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, description) => {
    try {
      // In a real app, this would upload to your backend
      // const result = await imageService.uploadImage(file, description);
      
      // For demo, just add a mock image
      const newImage = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        description: description,
        userId: currentUserId,
        user: { username: 'you' },
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      };
      
      setImages(prev => [newImage, ...prev]);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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
