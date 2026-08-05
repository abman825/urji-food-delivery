import React from 'react';
import { X, ShoppingBag, Utensils, CreditCard, Image, Camera } from 'lucide-react';

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
  lang 
}) {
  if (!isOpen) return null;

  // የቋንቋዎች ተርጓሚ ዳታ (Translations)
  const modalText = {
    am: {
      title1: "ትዕዛዝዎን",
      title2: "ያረጋግጡ",
      takeaway: "ለታሸገ",
      dineIn: "እዚሁ",
      chapa: "Chapa",
      photo: "ፎቶ",
      namePlaceholder: "ሙሉ ስምዎን እዚህ ያስገቡ",
      phonePlaceholder: "ስልክ ቁጥር ያስገቡ",
      timeText: "ምግብ እንዲደርስ የሚፈልጉበት ሰዓት",
      addressPlaceholder: "ትክክለኛ አድራሻ",
      uploadReceipt: "የከፈሉበትን ደረሰኝ እዚህ ያያይዙ",
      telebirrNote: "0947493716 telebirr ከፍለው ደረሰኝ ይላኩ",
      totalPayment: "ጠቅላላ ክፍያ",
      payChapa: "በ Chapa ይክፈሉ",
      sendOrder: "ትዕዛዝ ይላኩ"
    },
    om: {
      title1: "Ajaja Keessan",
      title2: "Mirkaneessaa",
      takeaway: "Gara Manaatti",
      dineIn: "Asumaa",
      chapa: "Chapa",
      photo: "Fakkii",
      namePlaceholder: "Maqaa Guutuu Asitti Galchaa",
      phonePlaceholder: "Lakkoofsa Bilbilaa Galchaa",
      timeText: "Sa'aatii nyaanni akka isin ga'u barbaaddan",
      addressPlaceholder: "Teessoo Sirrii",
      uploadReceipt: "Nagahee Kaffaltii Asitti Maxxansaa",
      telebirrNote: "0947493716 telebirr kaffaltanii nagahee ergaa",
      totalPayment: "Gatii Dimshaasha",
      payChapa: "Chapa'n Kaffalaa",
      sendOrder: "Ajaja Ergaa"
    },
    en: {
      title1: "Confirm Your",
      title2: "Order",
      takeaway: "Takeaway",
      dineIn: "Dine-in",
      chapa: "Chapa",
      photo: "Photo",
      namePlaceholder: "Enter your full name here",
      phonePlaceholder: "Enter phone number",
      timeText: "Time you want the food delivered",
      addressPlaceholder: "Exact Address",
      uploadReceipt: "Attach your payment receipt here",
      telebirrNote: "Pay to 0947493716 telebirr and send receipt",
      totalPayment: "Total Payment",
      payChapa: "Pay with Chapa",
      sendOrder: "Send Order"
    }
  };

  const t = modalText[lang] || modalText.am;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto max-h-[94vh]">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 p-2.5 rounded-full">
          <X size={24} />
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <h3 className="text-3xl font-black text-gray-900 leading-tight">
            {t.title1} <span className="text-orange-600">{t.title2}</span>
          </h3>
        </div>

        {/* Takeaway / Dine-in Buttons */}
        <div className="grid grid-cols-2 gap-5 mb-10">
          <button 
            onClick={() => setCustomerInfo({...customerInfo, orderType: 'Takeaway'})} 
            className={`flex flex-col items-center gap-3 py-6 rounded-[2rem] border-2 transition-all font-black ${customerInfo.orderType === 'Takeaway' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
          >
            <ShoppingBag size={30} /> {t.takeaway}
          </button>

          <button 
            onClick={() => setCustomerInfo({...customerInfo, orderType: 'Dine-in'})} 
            className={`flex flex-col items-center gap-3 py-6 rounded-[2rem] border-2 transition-all font-black ${customerInfo.orderType === 'Dine-in' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
          >
            <Utensils size={30} /> {t.dineIn}
          </button>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-4 mb-10 p-2 bg-gray-100 rounded-[1.5rem]">
          <button 
            onClick={() => setPaymentMethod('Chapa')} 
            className={`flex-1 py-4 rounded-2xl font-black transition-all ${paymentMethod === 'Chapa' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'}`}
          >
            <CreditCard size={18} className="inline mr-2" /> {t.chapa}
          </button>
          <button 
            onClick={() => setPaymentMethod('Screenshot')} 
            className={`flex-1 py-4 rounded-2xl font-black transition-all ${paymentMethod === 'Screenshot' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'}`}
          >
            <Image size={18} className="inline mr-2" /> {t.photo}
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <input 
            type="text" 
            placeholder={t.namePlaceholder} 
            className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" 
            value={customerInfo.name || ''}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} 
          />

          <input 
            type="tel" 
            placeholder={t.phonePlaceholder} 
            className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" 
            value={customerInfo.phone || ''}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} 
          />

          <div className="relative">
            <input 
              type="time" 
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" 
              onClick={(e) => e.target.showPicker()} 
              value={customerInfo.time || ''}
              onChange={(e) => setCustomerInfo({...customerInfo, time: e.target.value})} 
            />
            <span className="absolute right-14 top-5 text-gray-400 text-xs font-medium pointer-events-none">
              {t.timeText}
            </span>
          </div>

          {customerInfo.orderType === 'Takeaway' && (
            <input 
              type="text" 
              placeholder={t.addressPlaceholder} 
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 font-bold" 
              value={customerInfo.address || ''}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} 
            />
          )}

          {paymentMethod === 'Screenshot' && (
            <div className="border-2 border-dashed border-orange-200 rounded-[2rem] p-8 bg-orange-50/30 text-center cursor-pointer">
              <label className="cursor-pointer flex flex-col items-center gap-4">
                <Camera size={45} className="text-orange-600" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-gray-700 uppercase">
                    {selectedFile ? selectedFile.name : t.uploadReceipt}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">
                    {t.telebirrNote}
                  </span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                />
              </label>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleOrder} 
          className="w-full mt-12 py-6 bg-orange-600 text-white rounded-[2rem] font-black text-2xl hover:bg-orange-700 active:scale-95 transition-all shadow-2xl shadow-orange-100 tracking-widest uppercase flex flex-col items-center justify-center gap-1"
        >
          <span className="text-sm opacity-80 font-bold">{t.totalPayment}: {totalPrice} ETB</span>
          <span>{paymentMethod === 'Chapa' ? t.payChapa : t.sendOrder}</span>
        </button>

      </div>
    </div>
  );
}