import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { menuItems } from '../data/menuData';
import MenuItemCard from './MenuItemCard';

export default function MenuSection({ lang = 'am', t }) {
  const [activeCategory, setActiveCategory] = useState('UVP');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'UVP', label: { am: 'UVP', om: 'UVP', en: 'UVP' } },
    { id: 'ምግብ', label: { am: 'ምግብ', om: 'Nyaata', en: 'Food' } },
    { id: 'Fast Food', label: { am: 'Fast Food', om: 'Fast Food', en: 'Fast Food' } },
    { id: 'Juice', label: { am: 'ጁስ', om: 'Juusii', en: 'Juice' } },
    { id: 'ቀዝቃዛ መጠጥ', label: { am: 'ቀዝቃዛ መጠጥ', om: 'Waan Qorraa', en: 'Cold Drinks' } },
    { id: 'ትኩስ መጠጥ', label: { am: 'ትኩስ መጠጥ', om: 'Waan Ho\'aa', en: 'Hot Drinks' } },
  ];

  // Search filter logic
  const filteredItems = menuItems.filter((item) => {
    const itemName = typeof item.name === 'object' 
      ? (item.name[lang] || item.name.am || '').toLowerCase() 
      : item.name.toLowerCase();

    const matchesSearch = itemName.includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'UVP' || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto" id="menu">
      
      {/* 1. Search Bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder={
            lang === 'am' ? "ምግብ ወይም መጠጥ ይፈልጉ..." : 
            lang === 'om' ? "Barbaadi..." : "Search food or drinks..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-orange-500 transition-colors text-sm shadow-inner"
        />
        <Search className="absolute left-3.5 top-3.5 text-zinc-400 w-5 h-5" />
      </div>

      {/* 2. Category Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4 justify-start sm:justify-center no-scrollbar mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {cat.label[lang] || cat.label.am}
          </button>
        ))}
      </div>

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} lang={lang} t={t} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-zinc-500">
            {lang === 'am' ? "ምንም አይነት ምግብ አልተገኘም" : "No items found"}
          </div>
        )}
      </div>

    </section>
  );
}