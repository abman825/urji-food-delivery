import { getImageUrl as getUrl } from '../data/menuData';

export const getItemName = (obj, lang) => {
  if (typeof obj === 'object' && obj !== null) {
    return obj[lang] || obj.am || obj.en || '';
  }
  return obj || '';
};

export const getImageUrl = (imgPath) => {
  return getUrl(imgPath);
};