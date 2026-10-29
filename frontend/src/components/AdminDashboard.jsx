import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, TrendingUp, DollarSign, ShoppingBag, 
  Eye, X, User, Phone, CreditCard, FileText, ArrowLeft 
} from 'lucide-react';

const AdminDashboard = ({ lang: propLang }) => {
  const [lang, setLang] = useState(() => {
    return propLang || localStorage.getItem('app_lang') || 'am';
  });

  useEffect(() => {
    if (propLang) {
      setLang(propLang);
      localStorage.setItem('app_lang', propLang);
    }
  }, [propLang]);

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ 
    dailySales: 0, 
    weeklySales: 0, 
    monthlySales: 0, 
    yearlySales: 0 
  });
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Multilingual labels for Admin Dashboard
  const adminLabels = {
    am: {
      title: "የአድሚን ዳሽቦርድ (Admin Dashboard)",
      back: "ተመለስ",
      refresh: "እድስ (Refresh)",
      daily: "የዛሬ ቀን ሽያጭ",
      weekly: "የሳምንት ሽያጭ",
      monthly: "የወር ሽያጭ",
      yearly: "የአመት ሽያጭ",
      topItemsTitle: "በከፍተኛ ሁኔታ የተሸጡ ምግቦች (Top Items)",
      sold: "ተሸጧል",
      noTopItems: "ምንም የተሸጠ ምግብ የለም",
      allOrdersTitle: "የሁሉም ትዕዛዞች ዝርዝር",
      orderId: "የትዕዛዝ ID",
      customerName: "የደንበኛ ስም",
      phone: "ስልክ",
      price: "ዋጋ",
      status: "ሁኔታ",
      date: "ቀን",
      details: "ዝርዝር",
      view: "እይ",
      guest: "እንግዳ",
      notRecorded: "አልተመዘገበም",
      orderDetailsTitle: "የትዕዛዝ ሙሉ መረጃ",
      paymentMethod: "የክፍያ መንገድ:",
      orderedItems: "የታዘዙ ምግቦች ዝርዝር:",
      screenshot: "የክፍያ ደረሰኝ (Screenshot):",
      totalPrice: "ጠቅላላ ዋጋ:",
      loadingText: "የአድሚን ዳሽቦርድ በመጫን ላይ ነው..."
    },
    om: {
      title: "Daashboardii Bulchaa (Admin Dashboard)",
      back: "Deebi'i",
      refresh: "Haaromsi (Refresh)",
      daily: "Gurgurtaa Har'aa",
      weekly: "Gurgurtaa Torbanootaa",
      monthly: "Gurgurtaa Ji'aa",
      yearly: "Gurgurtaa Waggaa",
      topItemsTitle: "Nyaata Baay'inaan Gurguraman (Top Items)",
      sold: "Gurgurameera",
      noTopItems: "Nyaanni gurgurame hin jiru",
      allOrdersTitle: "Tarree Ajajawwan Hundaa",
      orderId: "ID Ajajaa",
      customerName: "Maqaa Maamilaa",
      phone: "Bilbila",
      price: "Gatii",
      status: "Haala",
      date: "Guyyaa",
      details: "Bal'ina",
      view: "Ilaali",
      guest: "Keessummaa",
      notRecorded: "Hin galmoofne",
      orderDetailsTitle: "Bal'ina Ajajaa",
      paymentMethod: "Madda Kaffaltii:",
      orderedItems: "Tarree Nyaata Ajajamanii:",
      screenshot: "Ragaan Kaffaltii (Screenshot):",
      totalPrice: "Gatii Waliigalaa:",
      loadingText: "Daashboardiin bulchaa fe'amaa jira..."
    },
    en: {
      title: "Admin Dashboard",
      back: "Back",
      refresh: "Refresh",
      daily: "Daily Sales",
      weekly: "Weekly Sales",
      monthly: "Monthly Sales",
      yearly: "Yearly Sales",
      topItemsTitle: "Top Selling Items",
      sold: "sold",
      noTopItems: "No top items available",
      allOrdersTitle: "All Orders List",
      orderId: "Order ID",
      customerName: "Customer Name",
      phone: "Phone",
      price: "Price",
      status: "Status",
      date: "Date",
      details: "Details",
      view: "View",
      guest: "Guest",
      notRecorded: "Not recorded",
      orderDetailsTitle: "Order Details",
      paymentMethod: "Payment Method:",
      orderedItems: "Ordered Items List:",
      screenshot: "Payment Screenshot:",
      totalPrice: "Total Price:",
      loadingText: "Loading admin dashboard..."
    }
  };

  const t = adminLabels[lang] || adminLabels.am;

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`);
      const fetchedOrders = response.data.allOrders || [];
      setOrders(fetchedOrders);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTotal = fetchedOrders
        .filter(o => o.createdAt && o.createdAt.startsWith(todayStr))
        .reduce((sum, o) => sum + (Number(o.totalPrice || o.totalAmount) || 0), 0);

      setStats({
        dailySales: todayTotal,
        weeklySales: response.data.stats?.weeklySales || 0,
        monthlySales: response.data.stats?.monthlySales || 0,
        yearlySales: response.data.stats?.yearlySales || 0
      });

      setTopItems(response.data.topItems || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [BACKEND_URL]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-lg font-bold text-orange-500 animate-pulse">
          {t.loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-900 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title, Back Button and Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white rounded-2xl transition flex items-center gap-2 border border-slate-700 font-bold text-xs cursor-pointer shadow-md"
              title={t.back}
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
            <h1 className="text-xl md:text-3xl font-black text-orange-500">
              {t.title}
            </h1>
          </div>

          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            {t.refresh}
          </button>
        </div>

        {/* 1. Sales Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Calendar size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.daily}</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.dailySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.weekly}</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.weeklySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.monthly}</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.monthlySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShoppingBag size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.yearly}</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.yearlySales.toLocaleString()} ETB</p>
          </div>
        </div>

        {/* 2. Top Items */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <h2 className="text-lg font-bold text-orange-400 mb-4">
            {t.topItemsTitle}
          </h2>
          <div className="space-y-3">
            {topItems.length > 0 ? (
              topItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200 text-sm">{index + 1}. {item.name || item.title}</span>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs px-3 py-1 rounded-lg font-bold">
                    {item.quantity || item.count || 0} {t.sold}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">{t.noTopItems}</p>
            )}
          </div>
        </div>

        {/* 3. All Orders List Table */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          <h2 className="text-lg font-bold text-orange-400 mb-4">{t.allOrdersTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">{t.orderId}</th>
                  <th className="p-3">{t.customerName}</th>
                  <th className="p-3">{t.phone}</th>
                  <th className="p-3">{t.price}</th>
                  <th className="p-3">{t.status}</th>
                  <th className="p-3">{t.date}</th>
                  <th className="p-3 text-center">{t.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {orders.map((order) => (
                  <tr key={order._id || order.receiptId} className="hover:bg-slate-700/40 transition">
                    <td className="p-3 font-mono font-bold text-orange-400">
                      {order.receiptId || order._id?.slice(-6)}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {order.name || order.customerName || order.customerInfo?.name || t.guest}
                    </td>
                    <td className="p-3 text-slate-400">
                      {order.phone || order.phoneNumber || order.customerInfo?.phone || '-'}
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {order.totalPrice || order.totalAmount} ETB
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border ${
                        order.status === 'Completed' || order.status === 'ተጠናቀዋል'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-slate-900 hover:bg-orange-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center justify-center gap-1 mx-auto font-bold border border-slate-700 cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>{t.view}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-orange-500 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText size={20} />
              {t.orderDetailsTitle} (#{selectedOrder.receiptId || selectedOrder._id?.slice(-6)})
            </h3>

            {/* Customer Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-300">
                <User size={14} className="text-orange-400" />
                <span className="font-bold">{t.customerName}:</span> {selectedOrder.name || selectedOrder.customerName || selectedOrder.customerInfo?.name || t.guest}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Phone size={14} className="text-orange-400" />
                <span className="font-bold">{t.phone}:</span> {selectedOrder.phone || selectedOrder.phoneNumber || selectedOrder.customerInfo?.phone || t.notRecorded}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <CreditCard size={14} className="text-orange-400" />
                <span className="font-bold">{t.paymentMethod}</span> 
                <span className="font-bold text-orange-400 uppercase ml-1">
                  {selectedOrder.paymentMethod || 'Chapa / Cash'}
                </span>
              </p>
            </div>

            {/* Ordered Items List */}
            <h4 className="font-bold text-xs text-slate-400 mb-2">{t.orderedItems}</h4>
            <div className="space-y-2 mb-4">
              {(selectedOrder.items || selectedOrder.cartItems || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{item.name || item.title}</p>
                    <p className="text-slate-400">{item.price} ETB x {item.quantity || 1}</p>
                  </div>
                  <p className="font-black text-emerald-400">
                    {(Number(item.price) || 0) * (Number(item.quantity) || 1)} ETB
                  </p>
                </div>
              ))}
            </div>

            {/* Screenshot Preview */}
            {selectedOrder.screenshotUrl && (
              <div className="mb-4">
                <h4 className="font-bold text-xs text-slate-400 mb-2">{t.screenshot}</h4>
                <img 
                  src={selectedOrder.screenshotUrl} 
                  alt="Receipt Screenshot" 
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-800"
                />
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-400 text-sm">{t.totalPrice}</span>
              <span className="text-xl font-black text-emerald-400">
                {selectedOrder.totalPrice || selectedOrder.totalAmount} ETB
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;