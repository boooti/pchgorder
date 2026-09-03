import React, { useState, useEffect } from 'react';
import { Calendar, FileSpreadsheet, Store, Coffee, Eye, MessageSquare, Download, Filter } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function HistoryReports({ onOpenMessageExporter }) {
  const [history, setHistory] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStore, setSelectedStore] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = () => {
    setLoading(true);
    const params = {};
    if (selectedStore) params.storeId = selectedStore;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    api.getHistory(params)
      .then(data => setHistory(data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getStores().then(data => setStores(data));
    fetchHistory();
  }, []);

  const handleDownloadExcel = () => {
    const params = {};
    if (selectedStore) params.storeId = selectedStore;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const url = api.getExcelDownloadUrl(params);
    window.open(url, '_blank');
    showToast('Đã khởi tạo tải xuống file Báo cáo Excel!');
  };

  return (
    <div className="space-y-6 my-6">
      
      {/* Header & Export Excel action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Lịch Sử & Báo Cáo Order</h2>
          <p className="text-xs text-slate-500">Xem lại các phiên order cũ, kiểm tra tin nhắn đã gửi quán và xuất file Báo cáo Excel.</p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
        >
          <FileSpreadsheet className="w-4 h-4" /> XUẤT EXCEL BÁO CÁO
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold">
          <Filter className="w-4 h-4" /> Lọc theo:
        </div>

        {/* Store filter */}
        <select
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
        >
          <option value="">Tất cả quán</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
        />
        <span className="text-slate-400">đến</span>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
        />

        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
        >
          Áp dụng
        </button>
      </div>

      {/* History Sessions Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Đang tải lịch sử...</div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Không tìm thấy phiên order nào phù hợp với bộ lọc</div>
      ) : (
        <div className="space-y-3">
          {history.map(sess => {
            const [y, m, d] = sess.date.split('-');
            const dateFormatted = `${d}/${m}/${y}`;
            return (
              <div key={sess.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition">
                <div className="flex items-center gap-3.5">
                  <img
                    src={sess.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=100&q=80'}
                    alt={sess.store_name}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{sess.store_name}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {dateFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {sess.ordersCount} người đặt · {sess.totalCups} ly · Tổng: <span className="font-bold text-slate-800">{new Intl.NumberFormat('vi-VN').format(sess.totalAmount)}đ</span>
                    </p>
                  </div>
                </div>

                {/* Subsidies & Employee pay details */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-semibold block">Trợ giá công ty:</span>
                    <span className="font-bold text-slate-700">-{new Intl.NumberFormat('vi-VN').format(sess.totalSubsidy)}đ</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Nhân viên trả:</span>
                    <span className="font-extrabold text-brand-600">{new Intl.NumberFormat('vi-VN').format(sess.totalEmployeePay)}đ</span>
                  </div>

                  <button
                    onClick={() => onOpenMessageExporter(sess.id)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center gap-1 transition"
                    title="Xem tin nhắn gửi quán"
                  >
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
