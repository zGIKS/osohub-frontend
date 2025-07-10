import { useState, useEffect, useRef } from 'react';
import PreviewCard from './PreviewCard';
import './MasonryGrid.css';

const MasonryGrid = ({ 
  images = [], 
  variant = 'feed', // 'feed' or 'profile'
  onImageClick = () => {}
}) => {
  const [columnCount, setColumnCount] = useState(3);
  const [imageColumns, setImageColumns] = useState([]);
  const gridRef = useRef(null);

  // Calculate optimal column count based on container width and variant
  useEffect(() => {
    const calculateColumns = () => {
      if (!gridRef.current) return;
      
      const containerWidth = gridRef.current.offsetWidth;
      
      // Different card widths for different variants
      const minCardWidth = variant === 'profile' ? 300 : 250;
      const gap = variant === 'profile' ? 20 : 16;
      
      // Calculate how many columns can fit
      let cols = Math.floor((containerWidth + gap) / (minCardWidth + gap));
      
      // Set limits based on variant and screen size
      if (variant === 'profile') {
        cols = Math.max(1, Math.min(cols, 4)); // 1-4 columns for profile
      } else {
        cols = Math.max(2, Math.min(cols, 5)); // 2-5 columns for feed
      }
      
      setColumnCount(cols);
    };

    // Calculate on mount and resize
    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    
    const resizeObserver = new ResizeObserver(calculateColumns);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculateColumns);
      resizeObserver.disconnect();
    };
  }, [variant]);

  // Distribute images across columns for masonry layout
  useEffect(() => {
    const distributeImages = () => {
      if (!images.length) {
        setImageColumns([]);
        return;
      }

      const columns = Array.from({ length: columnCount }, () => []);
      const columnHeights = new Array(columnCount).fill(0);

      images.forEach((image) => {
        // Find the shortest column
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        
        // Add image to shortest column
        columns[shortestColumnIndex].push(image);
        
        // Estimate height based on image aspect ratio if available
        // This is approximate since we don't know the actual rendered height
        let estimatedHeight = 300; // base height
        
        // If we have image dimensions, calculate better estimate
        if (image.width && image.height) {
          const aspectRatio = image.height / image.width;
          const cardWidth = variant === 'profile' ? 300 : 250;
          estimatedHeight = Math.min(Math.max(cardWidth * aspectRatio, 200), 600);
        }
        
        columnHeights[shortestColumnIndex] += estimatedHeight + (variant === 'profile' ? 20 : 16);
      });

      setImageColumns(columns);
    };

    distributeImages();
  }, [images, columnCount, variant]);

  if (!images.length) {
    return (
      <div className="masonry-empty">
        <p>No images to display</p>
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      className={`masonry-grid masonry-${variant}`}
      style={{ 
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        '--column-count': columnCount
      }}
    >
      {imageColumns.map((columnImages, columnIndex) => (
        <div key={columnIndex} className="masonry-column">
          {columnImages.map((image) => (
            <PreviewCard
              key={image.id}
              image={image}
              variant={variant}
              onClick={() => onImageClick(image)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
