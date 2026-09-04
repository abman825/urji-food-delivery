import React, { useState } from 'react';
import { Plus, Minus, CheckCircle2 } from 'lucide-react';
import { getImageUrl } from '../data/menuData';
import { useCart } from '../context/CartContext';

export default function MenuItemCard({ item, lang, t }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { cartItems = [], addToCart, removeFromCart } = useCart();

  const fallbackImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

  const getItemName = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      return obj[lang] || obj.am || obj.en || '';
    }
    return obj || '';
  };

  const mainName = getItemName(item.name);

  const getCount = (itemName) => {
    return cartItems.filter(cartItem => {
      if (typeof cartItem === 'string') return cartItem === itemName;
      return cartItem?.name === itemName || cartItem?.title === itemName;
    }).length;
  };

  // 1. ካርዱ አማራጮች (Variants) ከሌሉት
  if (!item.hasVariants || !item.variants || item.variants.length === 0) {
    const countInCart = getCount(mainName);

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full w-full">
        <div className="relative h-28 sm:h-36 md:h-72 overflow-hidden flex-shrink-0">
          <img 
            src={getImageUrl(item.img)} 
            alt={mainName} 
            className="w-full h-full object-cover brightness-95" 
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
          />
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 md:bottom-6 md:right-6 bg-orange-500 px-1.5 py-0.5 sm:px-3 sm:py-1 md:px-5 md:py-2 rounded-lg md:rounded-2xl shadow-lg font-black text-white text-[10px] sm:text-xs md:text-lg">
            {item.price} ETB
          </div>
        </div>
        <div className="p-2 sm:p-3 md:p-8 flex flex-col flex-grow justify-between bg-zinc-900">
          <div>
            {/* truncate ተነስቶ break-words እና leading-tight ተጨምሯል */}
            <h3 className="text-xs sm:text-sm md:text-2xl font-black text-white mb-0.5 md:mb-2 break-words leading-tight">
              {mainName}
            </h3>
            <div className="flex items-center gap-1 md:gap-2 text-zinc-300 text-[9px] sm:text-xs md:text-sm mb-2 md:mb-8 font-medium">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0 hidden sm:block" />
              <span className="break-words">{t?.freshAndSelected || "ትኩስ እና የተመረጠ"}</span>
            </div>
          </div>
          
          <div className="flex gap-1 md:gap-4 mt-auto items-center">
            {countInCart > 0 && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCart(mainName, item.price);
                }} 
                className="bg-zinc-800 text-zinc-200 p-1.5 md:p-4 rounded-lg md:rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center shrink-0 cursor-pointer border border-zinc-700"
              >
                <Minus className="w-3 h-3 md:w-6 md:h-6" />
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(mainName, item.price);
              }} 
              className="flex-grow bg-orange-500 text-white py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[10px] sm:text-xs md:text-base flex items-center justify-center gap-1 md:gap-2 hover:bg-orange-600 transition-all cursor-pointer shadow-md shadow-orange-950/30"
            >
              <Plus className="w-3 h-3 md:w-6 md:h-6" /> 
              <span>{countInCart > 0 ? `${countInCart}` : (t?.addToCart || "ጨምር")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ካርዱ አማራጮች (Variants) ካሉት (Flipping Card)
  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)} 
      className="min-h-[230px] sm:h-[280px] md:h-[490px] w-full [perspective:1000px] cursor-pointer group select-none"
    >
      <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* የፊተኛው ገፅ */}
        <div className="absolute inset-0 w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-[2.5rem] shadow-xl overflow-hidden [backface-visibility:hidden] flex flex-col justify-between p-2 sm:p-3 md:p-6">
          <div className="relative h-24 sm:h-36 md:h-64 rounded-xl md:rounded-3xl overflow-hidden mb-1 md:mb-4">
            <img 
              src={getImageUrl(item.img)} 
              alt={mainName} 
              className="w-full h-full object-cover brightness-95" 
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
            />
            <div className="absolute top-1 right-1 md:top-4 md:right-4 bg-black/80 border border-zinc-700 text-orange-400 text-[8px] sm:text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1.5 rounded-full font-bold">
              🔄
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-center text-center">
            {/* truncate ተነስቶ break-words ሆኗል */}
            <h3 className="text-xs sm:text-base md:text-3xl font-black text-white mb-0.5 md:mb-2 break-words leading-tight">
              {mainName}
            </h3>
            <p className="text-zinc-300 text-[8px] sm:text-[10px] md:text-sm font-semibold">
              {t?.cardHints?.viewOptions || "አማራጮችን ይመልከቱ"}
            </p>
          </div>
        </div>

        {/* የጀርባው ገፅ (Variants የሚታዩበት) */}
        <div className="absolute inset-0 w-full h-full bg-zinc-950 text-white rounded-2xl md:rounded-[2.5rem] p-2 sm:p-3 md:p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between border border-orange-500/40 shadow-2xl">
          <div>
            <div className="text-center mb-1 md:mb-4 pb-1 md:pb-3 border-b border-zinc-800">
              <h3 className="text-xs sm:text-base md:text-2xl font-black text-orange-400 break-words leading-tight">{mainName}</h3>
            </div>

            <div className="space-y-1 md:space-y-3 max-h-[150px] sm:max-h-[180px] md:max-h-[310px] overflow-y-auto pr-0.5">
              {item.variants.map((v, idx) => {
                const varName = getItemName(v.name);
                const countInCart = getCount(varName);

                return (
                  <div 
                    key={idx} 
                    onClick={(e) => e.stopPropagation()} 
                    className="bg-zinc-900 p-1.5 md:p-3.5 rounded-lg md:rounded-2xl border border-zinc-800 flex justify-between items-center hover:border-zinc-700 transition-colors"
                  >
                    {/* truncate ፈንታ break-words እና leading-tight ተደርጓል */}
                    <div className="overflow-hidden mr-1 flex-1">
                      <p className="font-extrabold text-[9px] sm:text-xs md:text-sm text-white break-words leading-tight">
                        {varName}
                      </p>
                      <p className="text-orange-400 font-black text-[9px] sm:text-xs md:text-sm">{v.price} ETB</p>
                    </div>
                    
                    <div className="flex items-center gap-0.5 md:gap-2 shrink-0">
                      {countInCart > 0 && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(varName, v.price);
                          }}
                          className="bg-zinc-800 p-1 md:p-2 rounded-md md:rounded-xl hover:bg-red-500/20 text-zinc-200 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer border border-zinc-700"
                        >
                          <Minus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                        </button>
                      )}
                      
                      <span className="font-black text-[9px] md:text-xs w-3 md:w-4 text-center text-white">{countInCart}</span>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(varName, v.price);
                        }}
                        className="bg-orange-500 p-1 md:p-2 rounded-md md:rounded-xl hover:bg-orange-600 text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
                      >
                        <Plus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[7px] sm:text-[9px] md:text-[11px] text-zinc-300 mt-1 hidden sm:block font-medium">
            {t?.cardHints?.clickAnywhereReturn || "ለመመለስ ካርዱን ይጫኑ"}
          </p>
        </div>

      </div>
    </div>
  );
}