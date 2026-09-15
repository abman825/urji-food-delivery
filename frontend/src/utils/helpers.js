const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getItemName = (obj, lang) => {
  if (typeof obj === 'object' && obj !== null) {
    return obj[lang] || obj.am || obj.en || '';
  }
  return obj || '';
};

export const getImageUrl = (imgSrc) => {
  if (!imgSrc) return 'https://via.placeholder.com/300?text=No+Image';

  // የራሱ URL ከሆነ (http/https)
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
    return imgSrc;
  }

  // Backend /uploads ፎልደር ከሆነ
  if (imgSrc.startsWith('/uploads') || imgSrc.startsWith('uploads/')) {
    const path = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
    return `${BACKEND_URL}${path}`;
  }

  // Public ፎልደር ከሆነ
  return imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
};