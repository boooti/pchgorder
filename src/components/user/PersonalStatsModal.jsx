import React, { useState, useEffect } from 'react';
import { X, BarChart3, Coffee, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../../api';
import { useUser } from '../../context/UserContext';

export default function PersonalStatsModal({ isOpen, onClose }) {
  const { currentUser } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      setLoading(true);
      api.getPersonalStats(currentUser.id)
        .then(data => setStats(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-slide-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-coffee-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Thống kê cá nhân</h2>
              <p className="text-xs text-slate-300">{currentUser.name} · {currentUser.department}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse text-sm">
              Đang tính toán thống kê...
            </div>
          ) : stats ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-100 text-center">
                  <Calendar className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Số lần order</span>
                  <span className="text-xl font-black text-slate-900">{stats.totalOrders} lần</span>
                </div>

                <div className="bg-brand-50/80 p-3.5 rounded-2xl border border-brand-100 text-center">
                  <Coffee className="w-5 h-5 text-brand-600 mx-auto mb-1" />
                  <span className="text-[10px] font-extrabold uppercase text-brand-700 block">Tổng số ly</span>
                  <span className="text-xl font-black text-slate-900">{stats.totalCups} ly</span>
                </div>
              </div>

              {/* Financial summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng giá trị nước:</span>
                  <span className="font-bold text-slate-800">{new Intl.NumberFormat('vi-VN').format(stats.totalSpent)}đ</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Công ty trợ giá:
                  </span>
                  <span>-{new Intl.NumberFormat('vi-VN').format(stats.totalSubsidy)}đ</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Bạn đã thanh toán:</span>
                  <span className="text-brand-600">{new Intl.NumberFormat('vi-VN').format(stats.totalPay)}đ</span>
                </div>
              </div>

              {/* Favorite drink */}
              <div className="p-3.5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-pink-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-pink-600 block">Món uống nhiều nhất</span>
                  <span className="font-extrabold text-sm text-slate-800">{stats.favoriteDrink}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
