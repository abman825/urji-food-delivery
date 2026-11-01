import React, { useEffect } from 'react';
import { X, CheckCircle, Clock, ChefHat, Utensils } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

export default function OrderStatusModal({ isOpen, onClose, currentOrder, setCurrentOrder, lang = 'am' }) {
  if (!isOpen || !currentOrder) return null;

  // 1. receiptId በትክክል String ሆኖ እንዲወጣ አውጥቶ ማፅዳት
  const rawId = currentOrder.receiptId || currentOrder.id || currentOrder._id || currentOrder?.order?.receiptId || '';
  
  let receiptId = 'N/A';
  if (typeof rawId === 'object' && rawId !== null) {
    receiptId = rawId.receiptId || rawId.id || rawId._id || JSON.stringify(rawId);
  } else if (rawId) {
    receiptId = String(rawId);
  }

  // 2. orderType String መሆኑን ማረጋገጥ
  const rawOrderType = currentOrder.orderType || '';
  const orderTypeStr = typeof rawOrderType === 'object' && rawOrderType !== null
    ? (rawOrderType[lang] || rawOrderType.am || rawOrderType.en || JSON.stringify(rawOrderType))
    : String(rawOrderType);

  const status = typeof currentOrder.status === 'string' ? currentOrder.status : 'Pending';

  const t = {
    title: { am: "የዝግጅቱ መቆጣጠሪያ", om: "To'annoo Ajaja Keessanii", en: "Order Tracker" },
    statusLabel: { am: "ሁኔታው", om: "Haala Ajajaa", en: "Status" },
    pending: { am: "በዝግጅት ላይ...", om: "Eegaa Jira", en: "Pending" },
    inProgress: { am: "በሥራ ላይ", om: "Qophaa'aa Jira", en: "In Progress" },
    completed: { am: "ተጠናቋል (ምግብ ተደርሷል)", om: "Xumurameera", en: "Completed" },
    orderType: { am: "የዝግጅት ዓይነት", om: "Gosa Ajajaa", en: "Order Type" },
    tableNo: { am: "የወንበር ቁጥር", om: "Lakk. Teessoo", en: "Table No." },
    orderedItems: { am: "የታዘዙ ምግቦች", om: "Nyaatawwan Ajajaman", en: "Ordered Items" },
    totalPrice: { am: "ጠቅላላ ዋጋ", om: "Gatiiyyaa Walii Galaa", en: "Total Price" },
    dineIn: { am: "ቦታው ላይ ለመመገብ", om: "Bakka Kanatti", en: "Dine-in" }
  };

  const getTranslatedItemName = (nameObj) => {
    if (!nameObj) return '';

    if (typeof nameObj === 'object') {
      const val = nameObj[lang] || nameObj.am || nameObj.en || '';
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }

    if (typeof nameObj === 'string') {
      if (lang === 'am' && nameObj.includes('(')) {
        return nameObj.split('(')[0].trim();
      }
      if (lang === 'om' && nameObj.includes('(')) {
        const match = nameObj.match(/\(([^)]+)\)/);
        return match ? match[1].trim() : nameObj;
      }
      return nameObj;
    }

    return String(nameObj);
  };

  useEffect(() => {
    if (receiptId && receiptId !== 'N/A') {
      socket.emit('joinOrderRoom', receiptId);
    }

    const handleStatusUpdate = (data) => {
      const incomingId = String(data.receiptId || data.orderId || data.id || '').trim();
      const currentId = String(receiptId || '').trim();

      if (data && currentId && incomingId && currentId === incomingId) {
        const updatedStatus = data.status || 'In Progress';

        setCurrentOrder(prevOrder => ({
          ...prevOrder,
          status: updatedStatus
        }));

        try {
          const savedOrder = localStorage.getItem('myPersonalOrder');
          if (savedOrder) {
            const parsed = JSON.parse(savedOrder);
            parsed.status = updatedStatus;
            localStorage.setItem('myPersonalOrder', JSON.stringify(parsed));
          }
        } catch (e) {
          console.error("LocalStorage Update Error:", e);
        }

        if (
          updatedStatus === 'Delivered' || 
          updatedStatus === 'Completed' || 
          updatedStatus === 'Finished' || 
          updatedStatus === 'ተጠናቋል'
        ) {
          setTimeout(() => {
            localStorage.removeItem('myPersonalOrder');
            setCurrentOrder(null);
            if (onClose) onClose();
          }, 3000);
        }
      }
    };

    socket.on('orderStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('orderStatusUpdated', handleStatusUpdate);
    };
  }, [receiptId, setCurrentOrder, onClose]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl">
        
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-orange-500">
              <Utensils size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t.title[lang] || t.title.am}</h3>
              <p className="text-xs font-black text-orange-400">
                #{receiptId} ({status})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-zinc-400 shrink-0">{t.statusLabel[lang] || t.statusLabel.am}</span>
            
            {status === 'Pending' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                <Clock size={14} /> {t.pending[lang] || t.pending.am}
              </span>
            )}

            {(status === 'In Progress' || status === 'In-Progress' || status === 'Accepted') && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                <ChefHat size={14} className="animate-bounce" /> {t.inProgress[lang] || t.inProgress.am}
              </span>
            )}

            {(status === 'Completed' || status === 'Delivered' || status === 'Finished' || status === 'ተጠናቋል') && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle size={14} /> {t.completed[lang] || t.completed.am}
              </span>
            )}
          </div>

          <div className="text-xs space-y-1.5 pt-2 border-t border-zinc-700/40">
            <div className="flex justify-between">
              <span className="text-zinc-400">{t.orderType[lang] || t.orderType.am}</span>
              <span className="font-bold text-zinc-200">
                {orderTypeStr || t.dineIn[lang] || t.dineIn.am}
              </span>
            </div>
            {currentOrder.tableNo && (
              <div className="flex justify-between">
                <span className="text-zinc-400">{t.tableNo[lang] || t.tableNo.am}</span>
                <span className="font-bold text-orange-400">
                  {typeof currentOrder.tableNo === 'object' ? JSON.stringify(currentOrder.tableNo) : String(currentOrder.tableNo)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <h4 className="text-xs font-bold text-zinc-400">{t.orderedItems[lang] || t.orderedItems.am}</h4>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {Array.isArray(currentOrder.items) && currentOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-zinc-800/30 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">
                  {getTranslatedItemName(item.name)} x{item.quantity || item.qty || 1}
                </span>
                <span className="font-bold text-orange-400">
                  {((item.price || 0) * (item.quantity || item.qty || 1))} ETB
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
          <span className="text-sm font-bold text-zinc-400">{t.totalPrice[lang] || t.totalPrice.am}</span>
          <span className="text-lg font-black text-orange-500">
            {typeof currentOrder.totalPrice === 'number' || typeof currentOrder.totalPrice === 'string' 
              ? currentOrder.totalPrice 
              : 0} ETB
          </span>
        </div>

      </div>
    </div>
  );
}