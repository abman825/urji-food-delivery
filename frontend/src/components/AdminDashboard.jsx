import React, { useState, useEffect } from 'react';
import { 
  X, Edit3, Plus, Trash2, Save, Utensils, Upload, 
  Clock, CheckCircle, Receipt, RefreshCw, ShoppingBag, Eye, ChefHat 
} from 'lucide-react';
import { io } from 'socket.io-client';
import MenuManagementTab from './MenuManagementTab';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function AdminDashboard({ isOpen, onClose, menuItems = [], setMenuItems, lang = 'am' }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🌐 Dynamic Translations Dictionary
  const t = {
    title: { am: "የአድሚን ዳሽቦርድ", om: "Daeashboordii Adminii", en: "Admin Dashboard" },
    subtitle: { am: "የትዕዛዞች ማያ እና የምግብ ዝርዝር ማስተካከያ", om: "To'annoo ajaja fi sirreessaa tarree nyaataa", en: "Order management and menu catalog editor" },
    ordersTab: { am: "ትዕዛዞች", om: "Ajajawwan", en: "Orders" },
    menuTab: { am: "ሜኑ ማስተካከያ", om: "Sirreessaa Meenuu", en: "Menu Editor" },
    incomingOrders: { am: "የገቡ ትዕዛዞች", om: "Ajajawwan Seenan", en: "Incoming Orders" },
    refresh: { am: "አዲስ", om: "Haaromsi", en: "Refresh" },
    clearAll: { am: "ሁሉንም አጥፋ", om: "Hunda Qulqulleessi", en: "Clear All" },
    noOrders: { am: "ምንም ያልተሰራ አዲስ ትዕዛዝ የለም", om: "Ajajni haarawni tokkollee hin jiru", en: "No new orders available" },
    accept: { am: "ተቀበል (Accept)", om: "Fudhadhu", en: "Accept" },
    inProgress: { am: "በመስራት ላይ (ተጠናቋል በል)", om: "Hojjetamaa Jira (Xumurame)", en: "In Progress (Complete)" },
    completed: { am: "ተጠናቋል (Locked)", om: "Xumurameera", en: "Completed" },
    tableNo: { am: "ወንበር/ጠረጴዛ፡", om: "Teessoo/Mesa:", en: "Table/Seat:" },
    phone: { am: "ስልክ፡", om: "Lak.Bilbilaa:", en: "Phone:" },
    type: { am: "አይነት፡", om: "Gosa:", en: "Type:" },
    paymentMethod: { am: "የክፍያ መንገድ፡", om: "Mala Kaffaltii:", en: "Payment Method:" },
    screenshotTitle: { am: "🧾 የክፍያ ስክሪንሾት (ለመክፈት ይጫኑ)፡", om: "🧾 Nagahee Kaffaltii (Banachuuf cuqasaa):", en: "🧾 Payment Proof (Click to view):" },
    noScreenshot: { am: "💵 በካሽ የሚከፈል (ስክሪንሾት የለውም)", om: "💵 Kaffaltii Harkaa (Nagahee hin qabu)", en: "💵 Cash Payment (No screenshot)" },
    total: { am: "ጠቅላላ፡", om: "Walii Galaa:", en: "Total:" },
    confirmDeleteOrder: { am: "ይህንን ትዕዛዝ ማጥፋት ይፈልጋሉ?", om: "Ajaja kana haquu ni barbaadduu?", en: "Are you sure you want to delete this order?" },
    confirmClearAll: { am: "ሁሉንም ትዕዛዞች ማጽዳት ይፈልጋሉ?", om: "Ajajawwan hunda qulqulleessuu ni barbaadduu?", en: "Are you sure you want to clear all orders?" },
    confirmDeleteItem: { am: "ይህንን ምግብ ማጥፋት እርግጠኛ ነዎት?", om: "Nyaata kana haquuf mirkanaa'aadhaa?", en: "Are you sure you want to delete this item?" },
    fillRequired: { am: "እባክዎን ስም እና ዋጋ (ወይም አማራጮችን) ያስገቡ!", om: "Maaloo maqaa fi gatii (ykn filannoowwan) galchaa!", en: "Please enter name and price (or variants)!" },
    cash: { am: "በካሽ (Cash)", om: "Kaffaltii Harkaa (Cash)", en: "Cash" },
    screenshotBank: { am: "በስክሪንሾት / ባንክ", om: "Nagahee / Baankii", en: "Screenshot / Bank" },
    priceNotSet: { am: "ዋጋ አልተወሰነም", om: "Gatiin Hin Murtaa'ine", en: "Price not set" },
    from: { am: "ከ", om: "Kaa'immaa", en: "From" }
  };

  const getTranslatedItemName = (nameObj) => {
    if (!nameObj) return '';

    if (typeof nameObj === 'object') {
      return nameObj[lang] || nameObj.am || nameObj.en || '';
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

  // Menu Management States
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

  const loadOrders = () => {
    try {
      const savedOrders = localStorage.getItem('adminOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Failed to load admin orders:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();

      const handleNewOrder = (incomingOrder) => {
        setOrders(prevOrders => {
          const exists = prevOrders.some(o => 
            (o.receiptId && o.receiptId === incomingOrder.receiptId) || 
            (o._id && o._id === incomingOrder._id) ||
            (o.id && o.id === incomingOrder.id)
          );
          
          let updated;
          if (exists) {
            updated = prevOrders.map(o => 
              (o.receiptId === incomingOrder.receiptId || o._id === incomingOrder.id || o.id === incomingOrder.id) 
                ? incomingOrder 
                : o
            );
          } else {
            updated = [{ ...incomingOrder, status: incomingOrder.status || 'Pending' }, ...prevOrders];
          }
          
          localStorage.setItem('adminOrders', JSON.stringify(updated));
          return updated;
        });
      };

      socket.on('newOrder', handleNewOrder);
      const interval = setInterval(loadOrders, 4000);

      return () => {
        clearInterval(interval);
        socket.off('newOrder', handleNewOrder);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextStatus = (index, order) => {
    if (order.status === 'Completed') return;

    const updatedOrders = [...orders];
    let nextStatus = 'Pending';

    if (!order.status || order.status === 'Pending') {
      nextStatus = 'In Progress';
    } else if (order.status === 'In Progress') {
      nextStatus = 'Completed';
    }

    updatedOrders[index].status = nextStatus;
    setOrders(updatedOrders);
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));

    const receiptId = order.receiptId || order.id || order._id;

    socket.emit('updateOrderStatus', {
      receiptId: receiptId,
      status: nextStatus
    });
  };

  const deleteOrder = (index) => {
    if (confirm(t.confirmDeleteOrder[lang] || t.confirmDeleteOrder.am)) {
      const updated = orders.filter((_, i) => i !== index);
      setOrders(updated);
      localStorage.setItem('adminOrders', JSON.stringify(updated));
    }
  };

  const clearAllOrders = () => {
    if (confirm(t.confirmClearAll[lang] || t.confirmClearAll.am)) {
      setOrders([]);
      localStorage.removeItem('adminOrders');
    }
  };

  const getScreenshotImg = (order) => {
    return order.screenshot || order.screenshotUrl || order.paymentProof || order.proofImg || null;
  };

  // የክፍያ መንገድ የመለያ Logic
  const getPaymentMethod = (order) => {
    const rawMethod = (order.paymentMethod || order.payment_method || order.paymentMode || '').toLowerCase();
    const hasScreenshot = Boolean(getScreenshotImg(order));

    if (rawMethod.includes('chapa')) {
      return 'Chapa Online Payment';
    }

    if (hasScreenshot) {
      return t.screenshotBank[lang] || t.screenshotBank.am;
    }

    return t.cash[lang] || t.cash.am;
  };

  // 🔑 የምግቦችን Availability (ለዛሬ አለ / አልቋል) የመቆጣጠሪያ Function
  const toggleAvailability = (itemId) => {
    setMenuItems(prev => {
      const updated = prev.map(item => {
        if ((item.id || item._id) === itemId) {
          // isAvailable true ከሆነ false ያደርገዋል (ለዛሬ አልቋል)፤ false ከሆነ true ያደርገዋል (አለ)
          const currentStatus = item.isAvailable !== false;
          return { ...item, isAvailable: !currentStatus };
        }
        return item;
      });
      
      // LocalStorage ላይ ሴቭ ማድረግ
      localStorage.setItem('customMenuItems', JSON.stringify(updated));
      
      // Socket.io ካለ ለሁሉም ተጠቃሚዎች በሪልታይም እንዲደርስ መላክ
      if (socket) {
        socket.emit('updateMenu', updated);
      }
      return updated;
    });
  };

  // --- የምኑ መቆጣጠሪያ Functions ---
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
      return {
        ...prev,
        hasVariants: updated.length > 0,
        variants: updated
      };
    });
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
      return {
        ...prev,
        hasVariants: updated.length > 0,
        variants: updated
      };
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
      
      if (socket) {
        socket.emit('updateMenu', updated);
      }
      return updated;
    });
    setEditingId(null);
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
      
      if (socket) {
        socket.emit('updateMenu', updated);
      }
      return updated;
    });

    setNewItem({ name: '', price: '', img: '', category: 'ምግብ', hasVariants: false, variants: [] });
  };

  const deleteItem = (id) => {
    if (confirm(t.confirmDeleteItem[lang] || t.confirmDeleteItem.am)) {
      setMenuItems(prev => {
        const updated = prev.filter(item => (item.id || item._id) !== id);
        localStorage.setItem('customMenuItems', JSON.stringify(updated));
        
        if (socket) {
          socket.emit('updateMenu', updated);
        }
        return updated;
      });
    }
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 mb-6 gap-4 sticky top-0 bg-zinc-900 z-10 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-orange-500">
              <Utensils size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{t.title[lang] || t.title.am}</h2>
              <p className="text-xs text-zinc-400">{t.subtitle[lang] || t.subtitle.am}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-700/50">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={14} /> {t.ordersTab[lang] || t.ordersTab.am} ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'menu' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Utensils size={14} /> {t.menuTab[lang] || t.menuTab.am}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ==================== TAB 1: ORDERS TAB ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-zinc-300">{t.incomingOrders[lang] || t.incomingOrders.am}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadOrders}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs text-zinc-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} /> {t.refresh[lang] || t.refresh.am}
                </button>
                {orders.length > 0 && (
                  <button
                    onClick={clearAllOrders}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} /> {t.clearAll[lang] || t.clearAll.am}
                  </button>
                )}
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-800/20 rounded-2xl border border-zinc-800">
                <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-400">{t.noOrders[lang] || t.noOrders.am}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order, idx) => {
                  const screenshotImg = getScreenshotImg(order);
                  const paymentMethodStr = getPaymentMethod(order);
                  const currentStatus = order.status || 'Pending';

                  return (
                    <div key={idx} className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      
                      {/* Order Card Header */}
                      <div className="flex justify-between items-start border-b border-zinc-700/50 pb-2">
                        <div>
                          <span className="text-xs font-bold text-orange-400">#{order.receiptId || order.id || order._id}</span>
                          <p className="text-xs text-zinc-400">{order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '')}</p>
                        </div>

                        {/* Status Action Buttons */}
                        {currentStatus === 'Pending' && (
                          <button
                            onClick={() => handleNextStatus(idx, order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                          >
                            <Clock size={13} /> {t.accept[lang] || t.accept.am}
                          </button>
                        )}

                        {currentStatus === 'In Progress' && (
                          <button
                            onClick={() => handleNextStatus(idx, order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ChefHat size={13} className="animate-bounce" /> {t.inProgress[lang] || t.inProgress.am}
                          </button>
                        )}

                        {currentStatus === 'Completed' && (
                          <button
                            disabled={true}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 opacity-80 cursor-not-allowed flex items-center gap-1"
                          >
                            <CheckCircle size={13} /> {t.completed[lang] || t.completed.am}
                          </button>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="text-xs space-y-1 bg-zinc-900/60 p-2.5 rounded-xl text-zinc-300">
                        {order.tableNo && <p><span className="text-zinc-500">{t.tableNo[lang] || t.tableNo.am}</span> <b className="text-orange-400">{order.tableNo}</b></p>}
                        {order.phone && order.phone !== '-' && <p><span className="text-zinc-500">{t.phone[lang] || t.phone.am}</span> {order.phone}</p>}
                        {order.orderType && <p><span className="text-zinc-500">{t.type[lang] || t.type.am}</span> {order.orderType}</p>}
                        <p>
                          <span className="text-zinc-500">{t.paymentMethod[lang] || t.paymentMethod.am}</span>{' '}
                          <b className={paymentMethodStr.includes('Chapa') || paymentMethodStr.includes('ስክሪንሾት') || paymentMethodStr.includes('Nagahee') || paymentMethodStr.includes('Screenshot') ? 'text-green-400' : 'text-orange-400'}>
                            {paymentMethodStr}
                          </b>
                        </p>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {order.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-center text-xs bg-zinc-900/30 p-2 rounded-lg">
                            <span>{getTranslatedItemName(item.name)} x{item.quantity || item.qty || 1}</span>
                            <span className="font-bold text-zinc-400">{((item.price || 0) * (item.quantity || item.qty || 1))} ETB</span>
                          </div>
                        ))}
                      </div>

                      {/* Screenshot Section */}
                      {screenshotImg ? (
                        <div className="mt-2 border-t border-zinc-700/50 pt-2">
                          <p className="text-[11px] text-green-400 font-bold mb-1 flex items-center gap-1">
                            {t.screenshotTitle[lang] || t.screenshotTitle.am}
                          </p>
                          <div className="relative group cursor-pointer" onClick={() => setSelectedImage(screenshotImg)}>
                            <img 
                              src={screenshotImg} 
                              alt="Payment Proof" 
                              className="w-full h-28 object-cover rounded-xl border border-zinc-700 hover:opacity-85 transition"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-[10px] italic pt-1">
                          {paymentMethodStr.includes('Chapa') ? '✅ Chapa Online Payment' : (t.noScreenshot[lang] || t.noScreenshot.am)}
                        </p>
                      )}

                      <div className="flex justify-between items-center border-t border-zinc-700/50 pt-2">
                        <span className="text-xs font-bold text-orange-400">{t.total[lang] || t.total.am} {order.totalPrice || order.total || 0} ETB</span>
                        <button
                          onClick={() => deleteOrder(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: MENU MANAGEMENT TAB ==================== */}
        {activeTab === 'menu' && (
          <MenuManagementTab
            menuItems={menuItems}
            newItem={newItem}
            setNewItem={setNewItem}
            categories={categories}
            handleAddItem={handleAddItem}
            handleImageUpload={handleImageUpload}
            addVariantToNewItem={addVariantToNewItem}
            handleNewVariantChange={handleNewVariantChange}
            deleteVariantFromNewItem={deleteVariantFromNewItem}
            editingId={editingId}
            editForm={editForm}
            setEditForm={setEditForm}
            startEdit={startEdit}
            saveEdit={saveEdit}
            deleteItem={deleteItem}
            renderPriceTag={renderPriceTag}
            addVariantToEditForm={addVariantToEditForm}
            handleVariantChange={handleVariantChange}
            deleteVariantFromEditForm={deleteVariantFromEditForm}
            toggleAvailability={toggleAvailability}
            lang={lang}
          />
        )}

      </div>

      {/* Screenshot Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[20000] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-orange-400 transition"
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