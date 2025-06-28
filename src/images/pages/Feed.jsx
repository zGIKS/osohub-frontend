import { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import ImageCard from '../components/ImageCard';
import { imageService } from '../services/imageService';
import './Feed.css';

const Feed = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');

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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // In a real app, this would upload to your backend
      // const result = await imageService.uploadImage(file, uploadDescription);
      
      // For demo, just add a mock image
      const newImage = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        description: uploadDescription,
        userId: currentUserId,
        user: { username: 'you' },
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      };
      
      setImages(prev => [newImage, ...prev]);
      setShowUpload(false);
      setUploadDescription('');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
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
          onClick={() => setShowUpload(!showUpload)}
        >
          <Plus size={20} />
          New Image
        </button>
      </div>

      {showUpload && (
        <div className="upload-section">
          <div className="upload-form">
            <input
              type="text"
              placeholder="Image description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="upload-description"
            />
            <label className="upload-label">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Select Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      )}

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
            onClick={() => setShowUpload(true)}
          >
            <Plus size={20} />
            Upload the first image
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
