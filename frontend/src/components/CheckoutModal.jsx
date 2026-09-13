import React, { useState } from 'react';
import { X, Upload, CreditCard, Utensils, CheckSquare, Square, Smartphone, Building2 } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://urji-food-delivery-1.onrender.com';
const socket = io(BACKEND_URL);

export default function CheckoutModal({
  isOpen,
  onClose,
  customerInfo,
  setCustomerInfo,
  paymentMethod,
  setPaymentMethod,
  selectedFile,
  setSelectedFile,
  totalPrice,
  handleOrder,
  cartItems = [],
  lang = 'am'
}) {
  const [checkoutType, setCheckoutType] = useState('table'); 
  const [isSelfPickUp, setIsSelfPickUp] = useState(false);

  if (!isOpen) return null;

  const modalText = {
    am: {
      title: "ትዕዛዝዎን ያጠናቅቁ",
      orderByTable: "በወንበር ቁጥር ለማዘዝ",
      orderByPayment: "ክፍያ በመክፈል ለማዘዝ",
      dineIn: "እዚሁ (Dine-in)",
      takeaway: "ይዞ ለመሄድ (Takeaway)",
      tableNumber: "የወንበር/ጠረጴዛ ቁጥር",
      tablePlaceholder: "ምሳሌ: 5",
      phone: "ስልክ ቁጥር",
      optionalTag: "(ግዴታ አይደለም)",
      requiredTag: "(ግዴታ ነው)",
      phonePlaceholder: "09...",
      uploadReceipt: "የክፍያ ስክሪንሾት",
      uploadNote: "💡 በቴሌብር ወይም በባንክ የከፈሉበትን ደረሰኝ/ስክሪንሾት እዚህ ማያያዝ ይችላሉ።",
      uploadBtn: "ስክሪንሾት አያይዝ",
      fullName: "ሙሉ ስም",
      namePlaceholder: "ስምዎን ያስገቡ",
      pickupTime: "የመቀበያ ሰዓት",
      selfPickup: "መጥቼ እወስዳለሁ (Self Pick-up)",
      address: "አድራሻ",
      addressPlaceholder: "ቦታ/አድራሻ ያስገቡ",
      totalPrice: "ጠቅላላ ዋጋ",
      submitOrder: "ትዕዛዝ ላክ",
      payChapa: "በ Chapa ክፈል",
      paymentAccounts: "የክፍያ ሂሳብ ቁጥሮች",
      selectPaymentMethod: "የክፍያ መንገድ",
      payWithChapa: "በ Chapa (ኦንላይን)"
    },
    om: {
      title: "Ajaja Keessan Xumuraa",
      orderByTable: "Lakkoofsa Minjaalaan",
      orderByPayment: "Kaffaltiidhaan Ajajuuf",
      dineIn: "Asumaa (Dine-in)",
      takeaway: "Fudhatanii Deemuuf",
      tableNumber: "Lakkoofsa Barcumaa/Minjaala",
      tablePlaceholder: "Fakkeenya: 5",
      phone: "Lakkoofsa Bilbilaa",
      optionalTag: "(Dirqama Mitii)",
      requiredTag: "(Dirqama)",
      phonePlaceholder: "09...",
      uploadReceipt: "Nagahee Kaffaltii",
      uploadNote: "💡 Nagahee kaffaltii Telebirr fi Baankiin kaffaltan asitti maxxansuu drossuu.",
      uploadBtn: "Nagahee Maxxansaa",
      fullName: "Maqaa Guutuu",
      namePlaceholder: "Maqaa Keessan Galchaa",
      pickupTime: "Sa'aatii Fudhannaa",
      selfPickup: "Ofii Koof Dhufeen Fadha",
      address: "Teessoo",
      addressPlaceholder: "Teessoo Galchaa",
      totalPrice: "Gatii Dimshaasha",
      submitOrder: "Ajaja Ergaa",
      payChapa: "Chapa'n Kaffalaa",
      paymentAccounts: "Lakkoofsa Akkaawuntii Kaffaltii",
      selectPaymentMethod: "Filannoo Kaffaltii",
      payWithChapa: "Chapa (Online)"
    },
    en: {
      title: "Complete Your Order",
      orderByTable: "Order by Table",
      orderByPayment: "Order by Payment",
      dineIn: "Dine-in",
      takeaway: "Takeaway",
      tableNumber: "Table Number",
      tablePlaceholder: "e.g., 5",
      phone: "Phone Number",
      optionalTag: "(Optional)",
      requiredTag: "(Required)",
      phonePlaceholder: "09...",
      uploadReceipt: "Payment Receipt",
      uploadNote: "💡 You can attach the receipt/screenshot of your Telebirr or Bank transfer here.",
      uploadBtn: "Upload Screenshot",
      fullName: "Full Name",
      namePlaceholder: "Enter your name",
      pickupTime: "Pickup Time",
      selfPickup: "Self Pick-up",
      address: "Delivery Address",
      addressPlaceholder: "Enter address",
      totalPrice: "Total Price",
      submitOrder: "Submit Order",
      payChapa: "Pay with Chapa",
      paymentAccounts: "Payment Accounts",
      selectPaymentMethod: "Payment Method",
      payWithChapa: "Chapa (Online)"
    }
  };

  const t = modalText[lang] || modalText.am;

  const onCheckoutTypeChange = (type) => {
    setCheckoutType(type);
    if (type === 'table') {
      setPaymentMethod('Screenshot');
      setCustomerInfo(prev => ({ ...prev, orderType: 'Dine-in' }));
    } else {
      setPaymentMethod('Chapa');
    }
  };

  const handleOrderTypeChange = (type) => {
    setCustomerInfo(prev => ({ ...prev, orderType: type }));
    if (type === 'Takeaway') {
      setPaymentMethod('Chapa');
    }
  };

  const onSubmitClick = () => {
    // Validation
    if (checkoutType === 'table' || (checkoutType === 'online' && customerInfo.orderType === 'Dine-in')) {
      if (!customerInfo.tableNo || !customerInfo.tableNo.trim()) {
        alert(lang === 'am' ? 'እባክዎን የወንበር ቁጥር ያስገቡ!' : 'Please enter table number!');
        return;
      }
    }

    if (checkoutType === 'online' && customerInfo.orderType === 'Takeaway') {
      if (!customerInfo.name || !customerInfo.name.trim()) {
        alert(lang === 'am' ? 'እባክዎን ሙሉ ስምዎን ያስገቡ!' : 'Please enter your name!');
        return;
      }
      if (!customerInfo.phone || !customerInfo.phone.trim()) {
        alert(lang === 'am' ? 'እባክዎን ስልክ ቁጥርዎን ያስገቡ!' : 'Please enter your phone number!');
        return;
      }
      if (!customerInfo.time) {
        alert(lang === 'am' ? 'እባክዎን የተቀበያ ሰዓት ይምረጡ!' : 'Please select pickup time!');
        return;
      }
      if (!isSelfPickUp && (!customerInfo.address || !customerInfo.address.trim())) {
        alert(lang === 'am' ? 'እባክዎን አድራሻ ያስገቡ ወይም "መጥቼ እወስዳለሁ" የሚለውን ይምረጡ!' : 'Please enter address or check self pick-up!');
        return;
      }
    }

    // ------------------ ወሳኙ ክፍል ------------------
    const generatedReceiptId = `REC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderObj = {
      receiptId: generatedReceiptId,
      items: cartItems,
      totalPrice: totalPrice,
      status: 'Pending',
      tableNo: customerInfo.tableNo || null,
      customerInfo: customerInfo,
      lang: lang,
      createdAt: new Date().toISOString()
    };

    // 🟢 1. ደንበኛውን በ Socket.io ከዚህ Receipt ID Room ጋር ማቀላቀል
    if (socket) {
      socket.emit('joinOrderRoom', generatedReceiptId);
    }

    // 2. ለ Order Tracker Modal / myorder.jsx
    localStorage.setItem('myCurrentOrder', JSON.stringify(newOrderObj));

    // 3. ለ My Orders ታሪክ
    const existingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    localStorage.setItem('myOrders', JSON.stringify([newOrderObj, ...existingOrders]));

    // 4. ዋናውን Order Handler መጥራት (ከነ receiptId ጋር)
    handleOrder(generatedReceiptId);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black mb-6 text-center text-orange-500 tracking-wide">
          {t.title}
        </h2>

        {/* Main Order Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => onCheckoutTypeChange('table')}
            className={`p-3.5 rounded-2xl border font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition-all cursor-pointer ${
              checkoutType === 'table'
                ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/30'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Utensils size={22} />
            {t.orderByTable}
          </button>

          <button
            type="button"
            onClick={() => onCheckoutTypeChange('online')}
            className={`p-3.5 rounded-2xl border font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition-all cursor-pointer ${
              checkoutType === 'online'
                ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/30'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <CreditCard size={22} />
            {t.orderByPayment}
          </button>
        </div>

        {/* ሀ) በወንበር ቁጥር ለማዘዝ (Dine-In) */}
        {checkoutType === 'table' && (
          <div className="space-y-4">
            <div className="bg-zinc-800/70 border border-zinc-700/60 rounded-2xl p-3.5 space-y-2">
              <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">{t.paymentAccounts}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <Smartphone size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <span className="text-zinc-400 text-[10px] block">Telebirr</span>
                    <span className="font-mono font-bold text-white tracking-wide">0912345678</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <Building2 size={16} className="text-purple-400 shrink-0" />
                  <div>
                    <span className="text-zinc-400 text-[10px] block">CBE (ንግድ ባንክ)</span>
                    <span className="font-mono font-bold text-white tracking-wide">1000123456789</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                {t.tableNumber} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t.tablePlaceholder}
                value={customerInfo.tableNo || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, tableNo: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                {t.phone} <span className="text-zinc-500 font-normal text-[11px] ml-1">{t.optionalTag}</span>
              </label>
              <input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={customerInfo.phone || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-300">
                {t.uploadReceipt} <span className="text-zinc-500 font-normal text-[11px] ml-1">{t.optionalTag}</span>
              </label>
              <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                {t.uploadNote}
              </p>
              <label className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 py-3 rounded-xl cursor-pointer text-xs font-semibold transition-all">
                <Upload size={16} className="text-orange-500" />
                <span>{selectedFile ? selectedFile.name : t.uploadBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* ለ) በክፍያ ለማዘዝ (Dine-in / Takeaway) */}
        {checkoutType === 'online' && (
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleOrderTypeChange('Dine-in')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  customerInfo.orderType === 'Dine-in'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.dineIn}
              </button>
              <button
                type="button"
                onClick={() => handleOrderTypeChange('Takeaway')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  customerInfo.orderType === 'Takeaway'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.takeaway}
              </button>
            </div>

            {customerInfo.orderType === 'Takeaway' && (
              <div>
                <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                  {t.selectPaymentMethod}
                </label>
                <div className="p-3 rounded-xl border border-orange-500/50 bg-orange-600/10 text-orange-400 text-xs font-bold flex items-center justify-between">
                  <span>{t.payWithChapa}</span>
                  <CreditCard size={18} />
                </div>
              </div>
            )}

            {customerInfo.orderType === 'Dine-in' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                    {t.tableNumber} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.tablePlaceholder}
                    value={customerInfo.tableNo || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, tableNo: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                    {t.phone} <span className="text-zinc-500 font-normal text-[11px] ml-1">{t.optionalTag}</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={customerInfo.phone || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </>
            )}

            {customerInfo.orderType === 'Takeaway' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                    {t.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={customerInfo.name || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={customerInfo.phone || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                    {t.pickupTime} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={customerInfo.time || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, time: e.target.value })}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isSelfPickUp;
                    setIsSelfPickUp(nextVal);
                    if (nextVal) {
                      setCustomerInfo(prev => ({ ...prev, address: 'መጥቼ እወስዳለሁ' }));
                    } else {
                      setCustomerInfo(prev => ({ ...prev, address: '' }));
                    }
                  }}
                  className="flex items-center gap-2.5 text-xs text-orange-400 hover:text-orange-300 cursor-pointer pt-1"
                >
                  {isSelfPickUp ? <CheckSquare size={18} /> : <Square size={18} />}
                  <span>{t.selfPickup}</span>
                </button>

                {!isSelfPickUp && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-zinc-300">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t.addressPlaceholder}
                      value={customerInfo.address || ''}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Total Price & Submit Button */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">{t.totalPrice}</p>
            <p className="text-xl font-black text-orange-500">{totalPrice} ETB</p>
          </div>

          <button
            type="button"
            onClick={onSubmitClick}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            {paymentMethod === 'Chapa' ? t.payChapa : t.submitOrder}
          </button>
        </div>

      </div>
    </div>
  );
}