import React, { useState, useEffect } from 'react';
import { Coffee, ShieldCheck, Crown, HeartHandshake, Users, ArrowRight, Ban, Lock, CheckCircle2, Clock } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

export default function ActiveGroupSessionsList({ activeSession, onSelectSession, onBack }) {
  const { currentUser } = useUser();
  const [timeLeftStr, setTimeLeftStr] = useState('');

  const allowedIds = activeSession?.allowedEmployeeIds;
  const isIncludedInGroup = !allowedIds || (currentUser && allowedIds.includes(currentUser.id));

  // Countdown timer logic
  useEffect(() => {
    if (!activeSession || !activeSession.cutoff_time || activeSession.status === 'CLOSED') {
      setTimeLeftStr('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const [cHours, cMins] = activeSession.cutoff_time.split(':').map(Number);
      const cutoffDate = new Date();
      cutoffDate.setHours(cHours, cMins, 0, 0);

      const diffMs = cutoffDate - now;
      if (diffMs <= 0) {
        setTimeLeftStr('ĐÃ HẾT GIỜ NẠP ĐƠN');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeLeftStr(`${mins} PHÚT ${secs < 10 ? '0' : ''}${secs} GIÂY`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession || !isIncludedInGroup) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 text-center border border-slate-200/90 shadow-xl max-w-lg mx-auto space-y-4 my-6 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black mx-auto shadow-sm">
          <Coffee className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-navy-950">Hiện Chưa Có Phiên Order Nào Đang Mở</h3>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Hiện tại chưa có nhóm order nước nào được khởi tạo cho thời điểm này. Bạn có thể tự bấm <b>"TẠO NHÓM ORDER MỚI"</b> ở màn hình chính hoặc chờ đồng nghiệp mở nhóm nhé!
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-black text-xs rounded-xl whitespace-nowrap shadow-md transition active:scale-95"
        >
          ⬅ Quay về màn hình chính
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 my-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-white/90 hover:bg-white text-navy-950 font-bold text-xs rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md"
        >
          ⬅ Quay lại chọn chức năng
        </button>

        <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider whitespace-nowrap">
          Đang truy cập: <b className="text-navy-950">{currentUser?.name || 'Bạn'}</b>
        </span>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-black">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
              Dành cho bạn ({currentUser?.name})
            </span>
            <h3 className="text-lg font-black text-navy-950">CÁC PHIÊN ORDER ĐANG MỞ HÔM NAY</h3>
          </div>
        </div>

        {/* Active Session Card */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-6 rounded-3xl border border-navy-800 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activeSession.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=150&q=80'}
                alt={activeSession.store_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-navy-950 uppercase whitespace-nowrap">
                  HÔM NAY ORDER TẠI
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">{activeSession.store_name}</h4>
              </div>
            </div>

            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white whitespace-nowrap">
              ● Đang mở nhận món
            </span>
          </div>

          {/* PROMINENT CUTOFF TIME & EXTRA LARGE COUNTDOWN TIMER */}
          <div className="bg-navy-900/90 border border-amber-400/30 rounded-2xl p-4 text-center space-y-1 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-xs uppercase font-extrabold text-amber-400">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Giờ Hết Nhận Order: <b className="text-white font-mono text-sm px-2 py-0.5 rounded bg-navy-950 border border-amber-400/40">{activeSession.cutoff_time || '11:00'}</b></span>
            </div>

            {timeLeftStr && (
              <div className="pt-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-widest">Thời gian đếm ngược chốt đơn:</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider animate-pulse font-mono py-1">
                  ⏱️ {timeLeftStr}
                </div>
              </div>
            )}
          </div>

          {/* Payment sponsorship badge */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Chế độ thanh toán:</span>
            </div>
            <span className="font-extrabold text-amber-300">
              {activeSession.sponsor_mode === 'SPONSOR_100'
                ? `👑 ${activeSession.sponsor_name || 'Sếp'} Bao 100%`
                : '💸 Share Đều / Tự Trả'}
            </span>
          </div>

          {/* Enter Button */}
          <button
            onClick={() => onSelectSession(activeSession)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition whitespace-nowrap"
          >
            <span>👉 VÀO ORDER MÓN NƯỚC CỦA BẠN</span>
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
