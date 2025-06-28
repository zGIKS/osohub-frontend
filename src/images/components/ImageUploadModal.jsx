import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import './ImageUploadModal.css';

const ImageUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !description.trim()) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile, description);
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    setIsUploading(false);
    setDragActive(false);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    onClose();
  };

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload New Image</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {!selectedFile ? (
            <div className="upload-section">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <ImageIcon size={48} />
                <h3>Choose a photo or drag it here</h3>
                <p>Support for JPG, PNG, GIF up to 10MB</p>
              </div>
              <button 
                type="button" 
                className="browse-btn"
                onClick={() => document.getElementById('file-upload').click()}
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                <img src={preview} alt="Preview" />
                <button type="button" className="remove-image" onClick={removeFile}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="description-section">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your image..."
                  rows="4"
                  required
                />
                <p className="char-count">{description.length}/500</p>
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="upload-btn"
                disabled={!description.trim() || isUploading}
              >
                {isUploading ? (
                  <>
                    <Upload size={16} className="spinning" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;
