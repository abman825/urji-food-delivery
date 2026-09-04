import React from 'react';
import { Edit3, Plus, Trash2, Save, Upload, X, CheckCircle, XCircle } from 'lucide-react';

export default function MenuManagementTab({
  menuItems = [],
  newItem,
  setNewItem,
  categories = ['ምግብ', 'Fast Food', 'Juice', 'ቀዝቃዛ መጠጥ', 'ትኩስ መጠጥ'],
  handleAddItem,
  handleImageUpload,
  addVariantToNewItem,
  handleNewVariantChange,
  deleteVariantFromNewItem,
  editingId,
  editForm,
  setEditForm,
  startEdit,
  saveEdit,
  deleteItem,
  renderPriceTag,
  addVariantToEditForm,
  handleVariantChange,
  deleteVariantFromEditForm,
  toggleAvailability,
  lang = 'am'
}) {
  const getTranslatedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'object') {
      return nameObj[lang] || nameObj.am || nameObj.en || '';
    }
    return String(nameObj);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. አዲስ ምግብ / መጠጥ መጨመሪያ Form */}
      <form onSubmit={handleAddItem} className="bg-zinc-800/50 border border-zinc-700/60 rounded-2xl p-4 md:p-5 space-y-4">
        <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
          <Plus size={16} /> አዲስ ምግብ / መጠጥ ጨምር
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="የምግብ/መጠጥ ስም"
            value={newItem.name || ''}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500"
            required
          />

          <input
            type="number"
            placeholder="ዋጋ (ETB)"
            value={newItem.price || ''}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            disabled={newItem.variants && newItem.variants.length > 0}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 disabled:opacity-50"
          />

          {/* Category Dropdown Select */}
          <select
            value={newItem.category || categories[0]}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          {/* ፎቶ መስቀያ */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, false)}
              className="hidden"
              id="new-item-img-input"
            />
            <label
              htmlFor="new-item-img-input"
              className="flex items-center justify-center gap-2 w-full bg-zinc-900 border border-dashed border-zinc-700 hover:border-orange-500 text-zinc-400 hover:text-white rounded-xl px-3.5 py-2.5 text-xs cursor-pointer transition"
            >
              <Upload size={14} /> {newItem.img ? 'ፎቶ ተመርጧል ✅' : 'ፎቶ ምረጥ'}
            </label>
          </div>
        </div>

        {/* Dynamic Variants Section (አማራጮች መጨመሪያ) */}
        <div className="space-y-2 border-t border-zinc-700/50 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400 font-medium">አማራጮች (Variants - ለምሳሌ፡ ሙሉ/half, በስጋ/በጨው)</span>
            <button
              type="button"
              onClick={addVariantToNewItem}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              + አማራጭ/Variants ጨምር
            </button>
          </div>

          {newItem.variants?.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded-xl">
              <input
                type="text"
                placeholder="የአማራጭ ስም (ለምሳሌ፡ ሙሉ)"
                value={v.nameStr || ''}
                onChange={(e) => handleNewVariantChange(idx, 'nameStr', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
              />
              <input
                type="number"
                placeholder="ዋጋ (ETB)"
                value={v.price || ''}
                onChange={(e) => handleNewVariantChange(idx, 'price', e.target.value)}
                className="w-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => deleteVariantFromNewItem(idx)}
                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg cursor-pointer"
        >
          + መዝግብ
        </button>
      </form>

      {/* 2. የምግቦች ዝርዝር (Existing Menu Items List) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-300">የምግቦች ዝርዝር ({menuItems.length})</h3>

        <div className="grid grid-cols-1 gap-3">
          {menuItems.map((item) => {
            const id = item.id || item._id;
            const isEditing = editingId === id;
            const itemName = getTranslatedName(item.name);
            const isAvailable = item.isAvailable !== false;

            if (isEditing) {
              return (
                <div key={id} className="bg-zinc-800 border border-orange-500/50 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs"
                      placeholder="ስም"
                    />
                    <input
                      type="number"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      disabled={editForm.variants && editForm.variants.length > 0}
                      className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs disabled:opacity-50"
                      placeholder="ዋጋ"
                    />
                    
                    {/* Category Select for Edit Form */}
                    <select
                      value={editForm.category || categories[0]}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs cursor-pointer"
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        id={`edit-img-${id}`}
                      />
                      <label
                        htmlFor={`edit-img-${id}`}
                        className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <Upload size={13} /> ፎቶ ቀይር
                      </label>
                    </div>
                  </div>

                  {/* Edit Variants */}
                  <div className="space-y-2 border-t border-zinc-700/50 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-400">አማራጮችን አስተካክል</span>
                      <button
                        type="button"
                        onClick={addVariantToEditForm}
                        className="text-xs text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
                      >
                        + አማራጭ ጨምር
                      </button>
                    </div>
                    {editForm.variants?.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v.nameStr || ''}
                          onChange={(e) => handleVariantChange(idx, 'nameStr', e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-1 text-xs"
                        />
                        <input
                          type="number"
                          value={v.price || ''}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="w-20 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => deleteVariantFromEditForm(idx)}
                          className="text-red-400 p-1 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Save size={13} /> አስቀምጥ
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={id} 
                className={`flex items-center justify-between bg-zinc-800/40 border rounded-2xl p-3 transition ${
                  isAvailable ? 'border-zinc-800 hover:border-zinc-700' : 'border-red-900/40 bg-zinc-900/60 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.img || item.image || 'https://via.placeholder.com/150'}
                    alt={itemName}
                    className={`w-12 h-12 object-cover rounded-xl border border-zinc-700 ${!isAvailable && 'grayscale'}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold ${isAvailable ? 'text-white' : 'text-zinc-400 line-through'}`}>
                        {itemName}
                      </h4>
                      {!isAvailable && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 font-semibold px-1.5 py-0.5 rounded border border-red-500/30">
                          ለዛሬ አልቋል
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-md">
                        {item.category || 'ምግብ'}
                      </span>
                      <span className="text-xs font-bold text-orange-400">
                        {renderPriceTag(item)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 🔘 ቶግል በተን (Toggle Availability Button) */}
                  <button
                    type="button"
                    onClick={() => toggleAvailability && toggleAvailability(id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                      isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                    }`}
                    title={isAvailable ? 'ለዛሬ አልቋል ለማድረግ ተጫን' : 'አለ ለማድረግ ተጫን'}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle size={13} />
                        <span className="hidden sm:inline">አለ</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} />
                        <span className="hidden sm:inline">ለዛሬ አልቋል</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => deleteItem(id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}