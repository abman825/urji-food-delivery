import React, { useState, useEffect } from 'react';
import MenuItemCard from './MenuItemCard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function MenuSection({ activeCategory = 'all', lang = 'am', t }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        if (!res.ok) {
          throw new Error('የሜኑ መረጃዎችን መጫን አልተቻለም');
        }
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-orange-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item._id || item.id}
            item={item}
            lang={lang}
            t={t}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-zinc-400 font-semibold">
          በዚህ ካቴጎሪ ምንም አይነት ምግብ አልተገኘም።
        </div>
      )}
    </section>
  );
}