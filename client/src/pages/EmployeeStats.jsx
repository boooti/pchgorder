import React, { useState, useEffect } from 'react';
import { Calendar, Coffee, DollarSign, ShieldCheck, Award, ChevronRight, AlertCircle } from 'lucide-react';
import { api } from '../api';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function EmployeeStats({ currentUser }) {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser, selectedMonth]);

  async function loadStats() {
    try {
      setLoading(true);
      const res = await api.getPersonalStats(currentUser.id, selectedMonth);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-slate-900">Vui lòng chọn tên nhân viên</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hãy bấm vào nút "Bạn là ai?" ở góc trên để xem lịch sử và thống kê cá nhân của bạn.
        </p>
      </div>
    );
  }

  // Generate last 6 months options
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toISOString().slice(0, 7);
    const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    monthOptions.push({ value: mStr, label });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Thống kê đặt nước cá nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhân viên: <b className="text-slate-800">{currentUser.name}</b> • {currentUser.department}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm shrink-0">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-3 py-1 cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải số liệu cá nhân...
        </div>
      ) : !stats ? (
        <div className="text-center py-16 text-slate-400">Chưa có dữ liệu thống kê</div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Days */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-500 font-medium">Số ngày tham chiến 📅</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {stats.days_ordered}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">ngày</span>
              </div>
            </div>

            {/* Cups */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-500 font-medium">Tổng số ly đã bú 🧋</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {stats.total_cups}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">ly</span>
              </div>
            </div>

            {/* Được bao / Miễn phí */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-500 font-medium">Được bao no nê (0đ) 🤑</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-0.5">
                {formatVND(stats.total_subsidy)}đ
              </div>
            </div>

            {/* You Paid */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-500 font-medium">Hầu bao đã cống hiến 💸</div>
              <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-0.5">
                {formatVND(stats.total_paid)}đ
              </div>
            </div>
          </div>

          {/* Favorite Drink Spotlight */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex items-center justify-between gap-4 border border-blue-900/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-blue-200 shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Món ruột nghiện nhất quả đất ⭐
                </span>
                <h3 className="text-lg sm:text-xl font-bold mt-0.5">
                  {stats.favorite_drink}
                </h3>
              </div>
            </div>
          </div>

          {/* Order History list in this month */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Lịch sử đặt món ({stats.orders?.length || 0} đơn)
              </h3>
              <span className="text-xs text-slate-400">
                Tổng tiền: {formatVND(stats.total_spent)}đ
              </span>
            </div>

            {stats.orders?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Bạn chưa đặt món nào trong tháng này
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.orders?.map((ord) => {
                  const formattedDate = ord.session_date.split('-').reverse().join('/');
                  return (
                    <div key={ord.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-bold text-slate-800">
                          {ord.store_name} • Ngày {formattedDate}
                        </span>
                        <span className="font-mono font-bold text-blue-900">
                          Bạn trả: {formatVND(ord.employee_paid_amount)}đ
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2 border-l-2 border-blue-200">
                        {ord.items?.map((it, idx) => {
                          let opts = {};
                          try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
                          return (
                            <div key={idx} className="flex justify-between text-xs text-stone-700">
                              <span>
                                {it.quantity} × {it.product_name_snapshot} ({it.size_snapshot} • {opts.sugar} đường • {opts.ice}
                                {it.topping_snapshot ? ` • ${it.topping_snapshot}` : ''})
                              </span>
                              <span className="font-mono font-medium text-stone-500">
                                {formatVND(it.item_total_price)}đ
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
