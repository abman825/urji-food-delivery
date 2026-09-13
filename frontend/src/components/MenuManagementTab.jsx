import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, Upload, Eye, Lock, Utensils } from 'lucide-react';

export default function MenuManagementTab({ 
  menuItems = [], 
  setMenuItems, 
  socket, 
  lang = 'am' 
}) {
  // 🔒 የራሱ ገለልተኛ የይለፍ ቃል ስቴቶች
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const MENU_ADMIN_PASSWORD = "123"; // 🔑 የሜኑ ማስተካከያ ፓስወርድ

  // 🍕 የሜኑ ማስተካከያ ስቴቶች
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', img: '', category: '', variants: [] });
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    img: '', 
    category: 'ምግብ', 
    hasVariants: false, 
    variants: [] 
  });

  const categories = ['ምግብ', 'Fast Food', 'Juice', 'ቀዝቃዛ መጠጥ', 'ትኩስ መጠጥ'];

  const t = {
    title: { am: "የሜኑ ማስተካከያ", om: "Sirreessaa Meenuu", en: "Menu Editor" },
    enterPasswordTitle: { am: "የሜኑ ማስተካከያ የይለፍ ቃል ያስገቡ", om: "Jecha darbi meenuu galchaa", en: "Enter Menu Password" },
    passwordPlaceholder: { am: "የይለፍ ቃል...", om: "Jecha darbi...", en: "Password..." },
    submitPassword: { am: "ግባ", om: "Seeni", en: "Submit" },
    wrongPassword: { am: "የተሳሳተ የይለፍ ቃል ነው!", om: "Jechi darbi dogoggora!", en: "Incorrect Password!" },
    addTitle: { am: "አዲስ የምግብ አይነት ጨምር", om: "Gosa Nyaataa Haarawa Dabali", en: "Add New Item" },
    itemName: { am: "የምግብ ስም", om: "Maqaa Nyaataa", en: "Item Name" },
    itemPrice: { am: "ዋጋ (ETB)", om: "Gatii (ETB)", en: "Price (ETB)" },
    category: { am: "ምድብ", om: "Kutaa", en: "Category" },
    uploadImage: { am: "ፎቶ ስቀል", om: "Fakkii Fe'i", en: "Upload Image" },
    addVariant: { am: "+ አማራጭ/ዓይነት ጨምር (ትልቅ/ትንሽ...)", om: "+ Filannoo Dabali", en: "+ Add Variant" },
    addItemBtn: { am: "ምግብ ጨምር", om: "Nyaata Dabali", en: "Add Item" },
    save: { am: "አስቀምጥ", om: "Olka'i", en: "Save" },
    cancel: { am: "ሰርዝ", om: "Dhiisi", en: "Cancel" },
    confirmDeleteItem: { am: "ይሁኑን ምግብ ማጥፋት እርግጠኛ ነዎት?", om: "Nyaata kana haquuf mirkanaa'aadhaa?", en: "Are you sure you want to delete this item?" },
    fillRequired: { am: "እባክዎን ስም እና ዋጋ (ወይም አማራጮችን) ያስገቡ!", om: "Maaloo maqaa fi gatii (ykn filannoowwan) galchaa!", en: "Please enter name and price (or variants)!" },
    priceNotSet: { am: "ዋጋ አልተወሰነም", om: "Gatiin Hin Murtaa'ine", en: "Price not set" },
    from: { am: "ከ", om: "Kaa'immaa", en: "From" },
    availableToday: { am: "ለዛሬ አለ", om: "Har'a Jira", en: "Available Today" },
    soldOutToday: { am: "ለዛሬ አልቋል", om: "Har'a Dhumera", en: "Sold Out Today" }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === MENU_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  const getTranslatedItemName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'object') {
      return nameObj[lang] || nameObj.am || nameObj.en || '';
    }
    if (typeof nameObj === 'string') {
      if (lang === 'am' && nameObj.includes('(')) return nameObj.split('(')[0].trim();
      if (lang === 'om' && nameObj.includes('(')) {
        const match = nameObj.match(/\(([^)]+)\)/);
        return match ? match[1].trim() : nameObj;
      }
      return nameObj;
    }
    return String(nameObj);
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditForm(prev => ({ ...prev, img: reader.result }));
        } else {
          setNewItem(prev => ({ ...prev, img: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariantToNewItem = () => {
    setNewItem(prev => ({
      ...prev,
      hasVariants: true,
      variants: [...prev.variants, { id: `v_${Date.now()}`, nameStr: '', price: 0 }]
    }));
  };

  const handleNewVariantChange = (index, field, value) => {
    const updated = [...newItem.variants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' ? Number(value) : value
    };
    setNewItem({ ...newItem, variants: updated });
  };

  const deleteVariantFromNewItem = (index) => {
    setNewItem(prev => {
      const updated = prev.variants.filter((_, i) => i !== index);
      return { ...prev, hasVariants: updated.length > 0, variants: updated };
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || (!newItem.price && newItem.variants.length === 0)) {
      alert(t.fillRequired[lang] || t.fillRequired.am);
      return;
    }

    const createdVariants = newItem.variants.map(v => ({
      id: v.id,
      name: { am: v.nameStr, om: v.nameStr, en: v.nameStr },
      price: Number(v.price)
    }));

    const createdItem = {
      id: `item_${Date.now()}`,
      category: newItem.category || 'ምግብ',
      img: newItem.img || 'https://via.placeholder.com/150?text=Food',
      hasVariants: createdVariants.length > 0,
      name: { am: newItem.name, om: newItem.name, en: newItem.name },
      price: Number(newItem.price || 0),
      variants: createdVariants,
      isAvailable: true
    };

    setMenuItems(prev => {
      const updated = [createdItem, ...prev];
      localStorage.setItem('customMenuItems', JSON.stringify(updated));
      if (socket) socket.emit('updateMenu', updated);
      return updated;
    });

    setNewItem({ name: '', price: '', img: '', category: 'ምግብ', hasVariants: false, variants: [] });
  };

  const startEdit = (item) => {
    const id = item.id || item._id;
    setEditingId(id);
    const itemName = getTranslatedItemName(item.name);

    const itemVariants = item.variants ? item.variants.map(v => ({
      ...v,
      nameStr: getTranslatedItemName(v.name)
    })) : [];

    setEditForm({
      name: itemName,
      price: item.price || 0,
      img: item.img || item.image || '',
      category: item.category || 'ምግብ',
      hasVariants: item.hasVariants || (itemVariants.length > 0),
      variants: itemVariants
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...editForm.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: field === 'price' ? Number(value) : value
    };
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  const addVariantToEditForm = () => {
    setEditForm(prev => ({
      ...prev,
      hasVariants: true,
      variants: [
        ...prev.variants,
        { id: `v_${Date.now()}`, nameStr: '', name: { am: '', om: '', en: '' }, price: 0 }
      ]
    }));
  };

  const deleteVariantFromEditForm = (index) => {
    setEditForm(prev => {
      const updated = prev.variants.filter((_, i) => i !== index);
      return { ...prev, hasVariants: updated.length > 0, variants: updated };
    });
  };

  const saveEdit = (id) => {
    setMenuItems(prev => {
      const updated = prev.map(item => {
        if ((item.id || item._id) === id) {
          const updatedVariants = editForm.variants.map(v => ({
            ...v,
            name: typeof v.name === 'object' ? { ...v.name, [lang]: v.nameStr || v.name[lang] } : (v.nameStr || v.name),
            price: Number(v.price)
          }));

          return {
            ...item,
            name: typeof item.name === 'object' ? { ...item.name, [lang]: editForm.name } : editForm.name,
            price: Number(editForm.price),
            img: editForm.img,
            category: editForm.category,
            hasVariants: updatedVariants.length > 0,
            variants: updatedVariants
          };
        }
        return item;
      });
      localStorage.setItem('customMenuItems', JSON.stringify(updated));
      if (socket) socket.emit('updateMenu', updated);
      return updated;
    });
    setEditingId(null);
  };

  const deleteItem = (id) => {
    if (confirm(t.confirmDeleteItem[lang] || t.confirmDeleteItem.am)) {
      setMenuItems(prev => {
        const updated = prev.filter(item => (item.id || item._id) !== id);
        localStorage.setItem('customMenuItems', JSON.stringify(updated));
        if (socket) socket.emit('updateMenu', updated);
        return updated;
      });
    }
  };

  const toggleAvailability = (itemId) => {
    setMenuItems(prev => {
      const updated = prev.map(item => {
        if ((item.id || item._id) === itemId) {
          const currentStatus = item.isAvailable !== false;
          return { ...item, isAvailable: !currentStatus };
        }
        return item;
      });
      localStorage.setItem('customMenuItems', JSON.stringify(updated));
      if (socket) socket.emit('updateMenu', updated);
      return updated;
    });
  };

  const renderPriceTag = (item) => {
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants.map(v => v.price).filter(p => p > 0);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `${min} ETB` : `${t.from[lang] || t.from.am} ${min} - ${max} ETB`;
      }
    }
    return item.price ? `${item.price} ETB` : (t.priceNotSet[lang] || t.priceNotSet.am);
  };

  // 🔒 የፓስወርድ መግቢያ ገጽ
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-zinc-800/30 border border-zinc-800 rounded-3xl p-6 max-w-md mx-auto text-center animate-fadeIn">
        <div className="p-4 bg-orange-600/20 border border-orange-500/30 rounded-full text-orange-500 mb-4">
          <Lock size={32} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{t.enterPasswordTitle[lang] || t.enterPasswordTitle.am}</h3>
        <p className="text-xs text-zinc-400 mb-6">የምግብ እና የፓኬጅ ማስተካከያ ገጽ ለመክፈት የይለፍ ቃል ያስገቡ</p>

        <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
          <div>
            <input
              type="password"
              placeholder={t.passwordPlaceholder[lang] || t.passwordPlaceholder.am}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white text-center focus:outline-none transition"
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-red-400 mt-2 font-bold animate-shake">
                {t.wrongPassword[lang] || t.wrongPassword.am}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg"
          >
            {t.submitPassword[lang] || t.submitPassword.am}
          </button>
        </form>
      </div>
    );
  }

  // 🍔 የሜኑ ማስተካከያ ዋና ገጽ
  return (
    <div className="space-y-6">
      
      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Utensils size={16} className="text-orange-500" />
          <h3 className="text-xs font-bold text-orange-400">{t.addTitle[lang] || t.addTitle.am}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder={t.itemName[lang] || t.itemName.am}
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white focus:border-orange-500 outline-none"
          />
          <input
            type="number"
            placeholder={t.itemPrice[lang] || t.itemPrice.am}
            value={newItem.price}
            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white focus:border-orange-500 outline-none"
          />
          <select
            value={newItem.category}
            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white focus:border-orange-500 outline-none"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Variants */}
        <div className="space-y-2 pt-2">
          {newItem.variants.map((v, vIdx) => (
            <div key={v.id || vIdx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="የአማራጭ ስም (ምሳሌ፡ ሙሉ/ግማሽ)"
                value={v.nameStr}
                onChange={e => handleNewVariantChange(vIdx, 'nameStr', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white flex-1 outline-none"
              />
              <input
                type="number"
                placeholder="ዋጋ"
                value={v.price}
                onChange={e => handleNewVariantChange(vIdx, 'price', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white w-24 outline-none"
              />
              <button
                type="button"
                onClick={() => deleteVariantFromNewItem(vIdx)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariantToNewItem}
            className="text-xs text-orange-400 hover:underline font-bold cursor-pointer"
          >
            {t.addVariant[lang] || t.addVariant.am}
          </button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white">
            <Upload size={14} />
            <span>{t.uploadImage[lang] || t.uploadImage.am}</span>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e)} className="hidden" />
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-lg"
          >
            <Plus size={14} /> {t.addItemBtn[lang] || t.addItemBtn.am}
          </button>
        </div>
      </form>

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map(item => {
          const id = item.id || item._id;
          const isEditing = editingId === id;
          const isAvailable = item.isAvailable !== false;

          return (
            <div key={id} className={`bg-zinc-800/40 border rounded-2xl p-4 transition-all ${isAvailable ? 'border-zinc-800' : 'border-red-900/40 opacity-75'}`}>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                    />
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white outline-none"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {editForm.variants.map((v, vIdx) => (
                      <div key={v.id || vIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={v.nameStr}
                          onChange={e => handleVariantChange(vIdx, 'nameStr', e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white flex-1 outline-none"
                        />
                        <input
                          type="number"
                          value={v.price}
                          onChange={e => handleVariantChange(vIdx, 'price', e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white w-20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => deleteVariantFromEditForm(vIdx)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVariantToEditForm}
                      className="text-xs text-orange-400 hover:underline font-bold cursor-pointer"
                    >
                      + አማራጭ ጨምር
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <label className="cursor-pointer bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs text-zinc-300">
                      ፎቶ ቀይር
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} className="hidden" />
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Save size={13} /> {t.save[lang] || t.save.am}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {t.cancel[lang] || t.cancel.am}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.img || item.image || 'https://via.placeholder.com/150'} 
                      alt={getTranslatedItemName(item.name)} 
                      className="w-14 h-14 object-cover rounded-xl border border-zinc-700" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{getTranslatedItemName(item.name)}</h4>
                      <p className="text-[11px] text-orange-400 font-semibold">{renderPriceTag(item)}</p>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/50 inline-block mt-1">
                        {item.category || 'ምግብ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleAvailability(id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isAvailable 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      <Eye size={12} /> {isAvailable ? (t.availableToday[lang] || t.availableToday.am) : (t.soldOutToday[lang] || t.soldOutToday.am)}
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteItem(id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}