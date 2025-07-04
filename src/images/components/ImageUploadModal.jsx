import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../auth/hooks/useToast';
import './ImageUploadModal.css';

const ImageUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastDescriptionErrorType, setLastDescriptionErrorType] = useState(null);
  const toast = useToast();

  const validateDescription = (value) => {
    let errorType = null;
    
    // 1. Límite de caracteres totales (500 caracteres máximo - igual que biografía)
    if (value.length > 500) {
      errorType = 'char_limit';
      if (lastDescriptionErrorType !== errorType) {
        toast.error('Image title cannot exceed 500 characters.');
        setLastDescriptionErrorType(errorType);
      }
      return false;
    }

    // 2. Contar palabras y validar longitud máxima por palabra
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // 3. Verificar que ninguna palabra sea demasiado larga (30 caracteres máximo por palabra - igual que biografía)
    const longWords = words.filter(word => word.length > 30);
    if (longWords.length > 0) {
      errorType = 'long_word';
      if (lastDescriptionErrorType !== errorType) {
        toast.error(`Words cannot exceed 30 characters. Found: "${longWords[0].substring(0, 20)}..."`);
        setLastDescriptionErrorType(errorType);
      }
      return false;
    }

    // 4. Límite de palabras (50 palabras máximo - igual que biografía)
    if (wordCount > 50) {
      errorType = 'word_limit';
      if (lastDescriptionErrorType !== errorType) {
        toast.error('Image title cannot exceed 50 words.');
        setLastDescriptionErrorType(errorType);
      }
      return false;
    }

    // 5. Verificar que no sea solo espacios o caracteres repetitivos
    const cleanText = value.trim().replace(/\s+/g, ' ');
    if (cleanText.length > 0) {
      // Detectar texto repetitivo (más del 70% del mismo carácter)
      const charCount = {};
      let maxCharCount = 0;
      for (let char of cleanText.toLowerCase()) {
        if (char !== ' ') {
          charCount[char] = (charCount[char] || 0) + 1;
          maxCharCount = Math.max(maxCharCount, charCount[char]);
        }
      }
      const nonSpaceChars = cleanText.replace(/\s/g, '').length;
      if (nonSpaceChars > 10 && (maxCharCount / nonSpaceChars) > 0.7) {
        errorType = 'repetitive';
        if (lastDescriptionErrorType !== errorType) {
          toast.error('Title contains too many repeated characters. Please write meaningful content.');
          setLastDescriptionErrorType(errorType);
        }
        return false;
      }
    }

    // Si llegamos aquí, no hay errores, limpiar el último error
    if (lastDescriptionErrorType !== null) {
      setLastDescriptionErrorType(null);
    }
    return true;
  };

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

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    
    // Solo actualizar si la validación pasa o si están borrando texto
    if (value.length <= description.length || validateDescription(value)) {
      setDescription(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select an image file.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a title for your image.');
      return;
    }

    // Validación final antes del envío
    if (!validateDescription(description)) {
      toast.error('Please fix the title before uploading.');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(selectedFile, description.trim());
      toast.success('Image uploaded successfully!');
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
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
    setLastDescriptionErrorType(null);
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
                <label htmlFor="description">Image Title</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Add a title for your image..."
                  rows="4"
                  required
                />
                <div className="description-info">
                  <p className={`char-count ${description.length > 450 ? 'warning' : ''} ${description.length > 500 ? 'error' : ''}`}>
                    {description.length}/500 characters
                  </p>
                  <p className={`word-count ${(() => {
                    const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).filter(word => word.length > 0).length;
                    return wordCount > 45 ? 'warning' : wordCount > 50 ? 'error' : '';
                  })()}`}>
                    {description.trim() === '' ? 0 : description.trim().split(/\s+/).filter(word => word.length > 0).length}/50 words
                  </p>
                </div>
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
