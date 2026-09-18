import React, { useState, useEffect } from 'react';
import { X, Receipt, RefreshCw, ShoppingBag } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function MyOrder({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadMyOrders = () => {
    try {
      const savedOrders = localStorage.getItem('myOrders') || localStorage.getItem('userOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("ትዕዛዞችን መጫን አልተቻለም:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMyOrders();

      const handleStatusUpdate = (updatedData) => {
        setOrders(prevOrders => {
          const updated = prevOrders.map(o => {
            if (o.receiptId === updatedData.receiptId || o.id === updatedData.receiptId || o._id === updatedData.receiptId) {
              return { ...o, status: updatedData.status };
            }
            return o;
          });
          localStorage.setItem('myOrders', JSON.stringify(updated));
          return updated;
        });
      };

      socket.on('orderStatusUpdated', handleStatusUpdate);

      return () => {
        socket.off('orderStatusUpdated', handleStatusUpdate);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getScreenshotImg = (order) => {
    return order.screenshot || order.screenshotUrl || order.paymentProof || order.proofImg || order.receiptImage || null;
  };

  // ✅ የክፍያ መንገድን በትክክል የመለያ ተግባር (Chapa, Screenshot/Bank ወይም Cash)
  const getPaymentMethod = (order) => {
    // ከትዕዛዙ ዳታ ውስጥ ክፍያን የተመለከቱ ሁሉንም ፍልዶች መሰብሰብ
    const rawMethod = String(
      order.paymentMethod || 
      order.payment_method || 
      order.paymentMode || 
      order.method || 
      order.payment || 
      ''
    ).toLowerCase();

    const hasScreenshot = Boolean(getScreenshotImg(order));

    // 1. Chapa መሆኑን ማረጋገጫ (በፅሁፉ ወይም በ Tx Ref)
    if (
      rawMethod.includes('chapa') || 
      rawMethod.includes('online') || 
      rawMethod.includes('card') || 
      order.tx_ref || 
      order.txRef ||
      order.chapaRef
    ) {
      return 'Chapa';
    }

    // 2. የስክሪንሾት / የባንክ ክፍያ ማረጋገጫ
    if (
      hasScreenshot || 
      rawMethod.includes('screenshot') || 
      rawMethod.includes('bank') || 
      rawMethod.includes('transfer') || 
      rawMethod.includes('cbe') || 
      rawMethod.includes('telebirr') ||
      rawMethod.includes('ደረሰኝ')
    ) {
      return 'የስክሪንሾት / የባንክ ክፍያ ማረጋገጫ';
    }

    // 3. ከላይ ያሉት ካልሆኑ ብቻ በካሽ ነው
    return 'በካሽ (Cash)';
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6 sticky top-0 bg-zinc-900 z-10 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-orange-500">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">የእኔ ትዕዛዞች</h2>
              <p className="text-xs text-zinc-400">ያዘዟቸውን ምግቦች ሁኔታ እዚህ መከታተል ይችላሉ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-zinc-300">የእኔ የትዕዛዝ ታሪክ ({orders.length})</h3>
            <button
              onClick={loadMyOrders}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs text-zinc-300 flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> አዲስ
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-800/20 rounded-2xl border border-zinc-800">
              <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-400">ምንም ያቀመጡት ትዕዛዝ የለም</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, idx) => {
                const screenshotImg = getScreenshotImg(order);
                const paymentMethodStr = getPaymentMethod(order);

                return (
                  <div key={idx} className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    
                    <div className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                      <div>
                        <span className="text-xs font-bold text-orange-400">#{order.receiptId || order.id || order._id}</span>
                        <p className="text-xs text-zinc-400">{order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '')}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 bg-zinc-900/60 p-2.5 rounded-xl text-zinc-300">
                      {order.tableNo && <p><span className="text-zinc-500">ወንበር/ጠረጴዛ፡</span> <b className="text-orange-400">{order.tableNo}</b></p>}
                      {order.phone && order.phone !== '-' && <p><span className="text-zinc-500">ስልክ፡</span> {order.phone}</p>}
                      {order.orderType && <p><span className="text-zinc-500">ዓይነት፡</span> {order.orderType}</p>}
                      <p>
                        <span className="text-zinc-500">የክፍያ መንገድ፡</span>{' '}
                        <b className="text-orange-400">{paymentMethodStr}</b>
                      </p>
                    </div>

                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {order.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between items-center text-xs bg-zinc-900/30 p-2 rounded-lg">
                          <span>{(typeof item.name === 'object' ? item.name.am || item.name.en : item.name)} x{item.quantity || item.qty || 1}</span>
                          <span className="font-bold text-zinc-400">{((item.price || 0) * (item.quantity || item.qty || 1))} ETB</span>
                        </div>
                      ))}
                    </div>

                    {screenshotImg && (
                      <div className="mt-2 border-t border-zinc-700/50 pt-2">
                        <p className="text-[11px] text-green-400 font-bold mb-1 flex items-center gap-1">
                          🧾 የክፍያ ደረሰኝ፡
                        </p>
                        <div className="relative group cursor-pointer" onClick={() => setSelectedImage(screenshotImg)}>
                          <img 
                            src={screenshotImg} 
                            alt="Payment Proof" 
                            className="w-full h-24 object-cover rounded-xl border border-zinc-700 hover:opacity-85 transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-zinc-700/50 pt-2">
                      <span className="text-xs font-bold text-zinc-400">ጠቅላላ፡</span>
                      <span className="text-sm font-black text-orange-400">{order.totalPrice || order.total || 0} ETB</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[20000] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-orange-400 transition cursor-pointer"
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Enlarged proof" className="w-full max-h-[80vh] object-contain rounded-2xl border border-zinc-700 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}