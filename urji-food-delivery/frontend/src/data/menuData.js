export const getImageUrl = (imgSrc) => {
  if (!imgSrc) return 'https://via.placeholder.com/300?text=No+Image';
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) return imgSrc;
  if (imgSrc.startsWith('/uploads') || imgSrc.startsWith('uploads')) {
    return `http://localhost:5000${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
  }
  return imgSrc;
};

export const menuItems = [
  {
    id: 1,
    name: "ልዩ ጨጨብሳ (Special Chechebsa)",
    price: 150,
    category: "ምግብ",
    subcategory: "ቁርስ",
    img: "/bb.jpg"
  },
  
  {
    id: 3,
    name: "ቺዝ በርገር (Cheese Burger)",
    price: 280,
    category: "ምግብ",
    subcategory: "ቁርስ",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"
  },
  {
    id: 4,
    name: "ዶሮ ወጥ (Doro Wet)",
    price: 550,
    category: "ምግብ",
    subcategory: "እራት",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"
  },
  {
    id: 5,
    name: "ትኩስ ቡና (Coffee)",
    price: 40,
    category: "መጠጥ",
    subcategory: "ትኩስ",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80"
  },
  {
    id: 6,
    name: "ቀዝቃዛ ኮካ ኮላ",
    price: 60,
    category: "መጠጥ",
    subcategory: "ቀዝቃዛ",
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80"
  }
];