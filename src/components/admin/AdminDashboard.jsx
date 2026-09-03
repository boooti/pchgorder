import React, { useState, useEffect } from 'react';
import { Users, UserX, Coffee, DollarSign, Copy, Send, Lock, Unlock, Clock, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function AdminDashboard({ sessionData, onRefreshSession, onOpenMessageExporter, onOpenSessionManager }) {
  const [activeTab, setActiveTab] = useState('ordered'); // 'ordered' | 'not_ordered'
  const [todayOrders, setTodayOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (sessionData && sessionData.id) {
      setLoading(true);
      api.getTodayOrders(sessionData.id)
        .then(data => setTodayOrders(data))
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sessionData]);

  if (!sessionData) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center my-6">
        <Coffee className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-900">Chưa có quán nào được chọn cho hôm nay!</h3>
        <p className="text-xs text-amber-700 mt-1 mb-4">
          Hãy chọn một quán cà phê để mở phiên order cho nhân viên công ty.
        </p>
        <button
          onClick={onOpenSessionManager}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
        >
          HÔM NAY ORDER QUÁN NÀO?
        </button>
      </div>
    );
  }

  const isClosed = sessionData.status === 'CLOSED';

  const handleToggleCloseSession = async () => {
    try {
      if (isClosed) {
        await api.reopenSession(sessionData.id);
        showToast('Đã mở lại phiên order!');
      } else {
        await api.closeSession(sessionData.id);
        showToast('Đã chốt đơn hôm nay! Nhân viên không thể đặt thêm.');
      }
      onRefreshSession();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCopyNotOrderedList = () => {
    if (!todayOrders || !todayOrders.notOrderedList || todayOrders.notOrderedList.length === 0) {
      showToast('Tất cả nhân viên đang làm việc đều đã đặt nước!', 'warning');
      return;
    }

    const dateFormatted = new Date().toLocaleDateString('vi-VN');
    const names = todayOrders.notOrderedList.map((emp, i) => `${i + 1}. ${emp.name}`).join('\n');
    
    const text = `📢 **NHẮC BÁO ORDER NƯỚC - ${dateFormatted}** 📢
Các bạn sau đây chưa order nước hôm nay, tranh thủ chốt đơn trước ${sessionData.cutoff_time || '10:30'} nhé:

${names}

👉 Mở web app để order ngay!`;

    navigator.clipboard.writeText(text);
    showToast('Đã copy danh sách chưa order vào Clipboard!');
  };

  const stats = todayOrders ? todayOrders.stats : {
    orderedCount: 0,
    notOrderedCount: 0,
    totalCups: 0,
    totalAmount: 0
  };

  return (
    <div className="space-y-6 my-6">
      
      {/* Active Store Session Header & Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-coffee-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
              isClosed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isClosed ? '● Đã chốt đơn' : '● Phiên đang mở'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Giờ chốt: {sessionData.cutoff_time || '11:00'}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">{sessionData.store_name}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Người nhận: <span className="font-semibold text-white">{sessionData.recipient_name} ({sessionData.recipient_phone})</span> · {sessionData.delivery_address}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleCloseSession}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-md ${
              isClosed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isClosed ? 'MỞ LẠI ORDER' : 'CHỐT ĐƠN'}</span>
          </button>

          <button
            onClick={onOpenMessageExporter}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span>XUẤT TIN NHẮN GỬI QUÁN</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Đã order */}
        <div
          onClick={() => setActiveTab('ordered')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            activeTab === 'ordered' ? 'bg-emerald-50 border-emerald-300 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐÃ ORDER</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.orderedCount} <span className="text-xs font-normal text-slate-500">người</span></div>
        </div>

        {/* KPI 2: Chưa order */}
        <div
          onClick={() => setActiveTab('not_ordered')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            activeTab === 'not_ordered' ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CHƯA ORDER</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.notOrderedCount} <span className="text-xs font-normal text-slate-500">người</span></div>
        </div>

        {/* KPI 3: Tổng số ly */}
        <div className="p-4 bg-white rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG SỐ LY</span>
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalCups} <span className="text-xs font-normal text-slate-500">ly</span></div>
        </div>

        {/* KPI 4: Tổng tiền */}
        <div className="p-4 bg-white rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG TIỀN</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-brand-600">
            {new Intl.NumberFormat('vi-VN').format(stats.totalAmount)}đ
          </div>
        </div>

      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ordered')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                activeTab === 'ordered'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ĐÃ ORDER ({stats.orderedCount})
            </button>
            <button
              onClick={() => setActiveTab('not_ordered')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                activeTab === 'not_ordered'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CHƯA ORDER ({stats.notOrderedCount})
            </button>
          </div>

          {activeTab === 'not_ordered' && (
            <button
              onClick={handleCopyNotOrderedList}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-2xl border border-amber-200 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>COPY DANH SÁCH CHƯA ORDER</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Đang tải dữ liệu phiên...
          </div>
        ) : activeTab === 'ordered' ? (
          /* Ordered List Table */
          !todayOrders || todayOrders.orderedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Chưa có nhân viên nào đặt nước hôm nay
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold text-[10px]">
                    <th className="py-3 px-2">Nhân viên</th>
                    <th className="py-3 px-2">Món đã đặt</th>
                    <th className="py-3 px-2 text-center">SL</th>
                    <th className="py-3 px-2 text-right">Tổng tiền</th>
                    <th className="py-3 px-2 text-right">Trợ giá</th>
                    <th className="py-3 px-2 text-right">NV trả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayOrders.orderedList.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-2">
                        <span className="font-bold text-slate-800 block text-sm">{ord.employee_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ord.employee_code}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="space-y-1">
                          {ord.items.map((item, i) => (
                            <div key={i} className="text-slate-700">
                              <span className="font-semibold text-slate-900">{item.product_name_snapshot} ({item.size_snapshot})</span>
                              <span className="text-[11px] text-slate-500"> · {item.sugar_option} sugar · {item.ice_option}</span>
                              {item.toppings && item.toppings.length > 0 && (
                                <span className="text-[10px] text-brand-600 block">
                                  + Topping: {item.toppings.map(t => t.name).join(', ')}
                                </span>
                              )}
                              {item.note && <span className="text-[10px] text-amber-700 italic block">"{item.note}"</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-800">
                        {ord.items.reduce((s, i) => s + i.quantity, 0)}
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(ord.total_amount)}đ
                      </td>
                      <td className="py-3 px-2 text-right text-emerald-600 font-semibold">
                        -{new Intl.NumberFormat('vi-VN').format(ord.subsidy_amount)}đ
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-brand-600">
                        {new Intl.NumberFormat('vi-VN').format(ord.employee_pay_amount)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Not Ordered List Table */
          !todayOrders || todayOrders.notOrderedList.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 font-bold text-sm">
              🎉 Tuyệt vời! Tất cả nhân viên đều đã hoàn thành order nước hôm nay!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {todayOrders.notOrderedList.map(emp => (
                <div key={emp.id} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{emp.name}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                    Chưa đặt
                  </span>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}
