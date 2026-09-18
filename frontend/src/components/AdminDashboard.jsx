import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar, TrendingUp, DollarSign, ShoppingBag, 
  Eye, X, User, Phone, CreditCard, FileText, CheckCircle 
} from 'lucide-react';

const AdminDashboard = () => {
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

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`);
      const fetchedOrders = response.data.allOrders || [];
      setOrders(fetchedOrders);
      
      // ከስታቲስቲክስ በተጨማሪ የዛሬ ቀን ሽያጭን ማስላት
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
      console.error("የዳሽቦርድ ዳታ መጫን አልተቻለም:", err);
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
          የአድሚን ዳሽቦርድ በመጫን ላይ ነው...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-900 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title and Refresh */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-orange-500">
            የአድሚን ዳሽቦርድ (Admin Dashboard)
          </h1>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            አድስ (Refresh)
          </button>
        </div>

        {/* 1. የሽያጭ ስታቲስቲክስ ካርዶች (Daily, Weekly, Monthly, Yearly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Calendar size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">የዛሬ ቀን ሽያጭ</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.dailySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">የሳምንት ሽያጭ</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.weeklySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">የወር ሽያጭ</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.monthlySales.toLocaleString()} ETB</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShoppingBag size={18} />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">የዓመት ሽያጭ</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{stats.yearlySales.toLocaleString()} ETB</p>
          </div>
        </div>

        {/* 2. በከፍተኛ ሁኔታ የተሸጡ ምግቦች (Top Items) */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <h2 className="text-lg font-bold text-orange-400 mb-4">
            በከፍተኛ ሁኔታ የተሸጡ ምግቦች (Top Items)
          </h2>
          <div className="space-y-3">
            {topItems.length > 0 ? (
              topItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200 text-sm">{index + 1}. {item.name || item.title}</span>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs px-3 py-1 rounded-lg font-bold">
                    {item.quantity || item.count || 0} ተሸጧል
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">ምንም የተሸጠ ምግብ የለም</p>
            )}
          </div>
        </div>

        {/* 3. የሁሉም ትዕዛዞች ዝርዝር (All Orders List Table) */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          <h2 className="text-lg font-bold text-orange-400 mb-4">የሁሉም ትዕዛዞች ዝርዝር</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">የትዕዛዝ ID</th>
                  <th className="p-3">የደንበኛ ስም</th>
                  <th className="p-3">ስልክ</th>
                  <th className="p-3">ዋጋ</th>
                  <th className="p-3">ሁኔታ</th>
                  <th className="p-3">ቀን</th>
                  <th className="p-3 text-center">ዝርዝር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {orders.map((order) => (
                  <tr key={order._id || order.receiptId} className="hover:bg-slate-700/40 transition">
                    <td className="p-3 font-mono font-bold text-orange-400">
                      {order.receiptId || order._id?.slice(-6)}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {order.name || order.customerName || order.customerInfo?.name || 'እንግዳ'}
                    </td>
                    <td className="p-3 text-slate-400">
                      {order.phone || order.phoneNumber || order.customerInfo?.phone || '-'}
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {order.totalPrice || order.totalAmount} ETB
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border ${
                        order.status === 'Completed' || order.status === 'ተጠናቋል'
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
                        className="bg-slate-900 hover:bg-orange-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center justify-center gap-1 mx-auto font-bold border border-slate-700"
                      >
                        <Eye size={14} />
                        <span>እይ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. የትዕዛዝ ዝርዝር Modal (Order Details Modal) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-orange-500 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText size={20} />
              የትዕዛዝ ሙሉ መረጃ (#{selectedOrder.receiptId || selectedOrder._id?.slice(-6)})
            </h3>

            {/* Customer Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-300">
                <User size={14} className="text-orange-400" />
                <span className="font-bold">ስም:</span> {selectedOrder.name || selectedOrder.customerName || selectedOrder.customerInfo?.name || 'እንግዳ'}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Phone size={14} className="text-orange-400" />
                <span className="font-bold">ስልክ:</span> {selectedOrder.phone || selectedOrder.phoneNumber || selectedOrder.customerInfo?.phone || 'አልተጠቀሰም'}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <CreditCard size={14} className="text-orange-400" />
                <span className="font-bold">የክፍያ መንገድ:</span> 
                <span className="font-bold text-orange-400 uppercase ml-1">
                  {selectedOrder.paymentMethod || 'Chapa / Cash'}
                </span>
              </p>
            </div>

            {/* Ordered Items List */}
            <h4 className="font-bold text-xs text-slate-400 mb-2">የታዘዙ ምግቦች ዝርዝር፦</h4>
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

            {/* Screenshot Preview (If available) */}
            {selectedOrder.screenshotUrl && (
              <div className="mb-4">
                <h4 className="font-bold text-xs text-slate-400 mb-2">የክፍያ ደረሰኝ (Screenshot):</h4>
                <img 
                  src={selectedOrder.screenshotUrl} 
                  alt="Receipt Screenshot" 
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-800"
                />
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-400 text-sm">ጠቅላላ ዋጋ:</span>
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