/**
 * Utilidades para generar avatares por defecto
 */

// Colores elegantes para avatares
const AVATAR_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FECA57', // Sunny Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Blue
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9F43', // Orange
  '#6C5CE7', // Lavender
  '#A29BFE', // Light Purple
  '#FD79A8', // Pink Rose
  '#FDCB6E', // Yellow Orange
  '#6C5CE7'  // Deep Purple
];

/**
 * Genera un color consistente basado en un string (username)
 * @param {string} text - El texto para generar el color
 * @returns {string} - Color hex
 */
export const getColorFromText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
};

/**
 * Genera un avatar por defecto como blob
 * @param {string} username - Nombre de usuario
 * @param {number} size - Tamaño del avatar (default: 200px)
 * @returns {Promise<Blob>} - Blob de la imagen del avatar
 */
export const generateDefaultAvatar = (username, size = 200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    // Obtener color basado en el username
    const backgroundColor = getColorFromText(username);
    
    // Dibujar fondo circular
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dibujar texto (primera letra del username)
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    
    const letter = username.charAt(0).toUpperCase() || 'U';
    ctx.fillText(letter, size / 2, size / 2);
    
    // Convertir canvas a blob
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.9);
  });
};

/**
 * Genera un URL de avatar por defecto (para usar como src directamente)
 * @param {string} username - Nombre de usuario
 * @param {number} size - Tamaño del avatar (default: 200px)
 * @returns {string} - Data URL de la imagen
 */
export const generateDefaultAvatarDataURL = (username, size = 200) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = size;
  canvas.height = size;
  
  // Obtener color basado en el username
  const backgroundColor = getColorFromText(username);
  
  // Dibujar fondo circular
  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Dibujar texto (primera letra del username)
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  
  const letter = username.charAt(0).toUpperCase() || 'U';
  ctx.fillText(letter, size / 2, size / 2);
  
  return canvas.toDataURL('image/png', 0.9);
};
