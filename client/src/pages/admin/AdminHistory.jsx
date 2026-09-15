import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Store,
  User,
  Download,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function AdminHistory({ onOpenZaloModal }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadFilterOptions();
    loadHistory();
  }, []);

  async function loadFilterOptions() {
    try {
      const [stRes, empRes] = await Promise.all([api.getStores(), api.getEmployees(false)]);
      if (stRes.success) setStores(stRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadHistory() {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedStoreId) params.store_id = selectedStoreId;
      if (selectedEmployeeId) params.employee_id = selectedEmployeeId;

      const res = await api.getHistory(params);
      if (res.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleExportExcel = () => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (selectedStoreId) params.store_id = selectedStoreId;
    if (selectedEmployeeId) params.employee_id = selectedEmployeeId;

    const downloadUrl = api.getExcelDownloadUrl(params);
    window.open(downloadUrl, '_blank');
    showToast('Đang tạo và tải về file Excel báo cáo...', 'info');
  };

  const orders = historyData?.orders || [];
  const summary = historyData?.summary || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Lịch sử đơn hàng & Báo cáo
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Lọc theo ngày, tháng, nhân viên, quán và xuất file Excel chuẩn kế toán
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>XUẤT FILE EXCEL (.XLSX)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft space-y-3">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Bộ lọc dữ liệu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Lọc theo quán</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tất cả quán</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Lọc theo nhân viên</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tất cả nhân viên</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedStoreId('');
              setSelectedEmployeeId('');
              setTimeout(loadHistory, 50);
            }}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Xóa bộ lọc
          </button>
          <button
            type="button"
            onClick={loadHistory}
            className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tổng số đơn</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {summary.total_orders || 0} đơn ({summary.total_cups || 0} ly)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tổng tiền nước</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {formatVND(summary.total_amount)}đ
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Công ty hỗ trợ</div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
            {formatVND(summary.total_subsidy)}đ
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Nhân viên trả</div>
          <div className="text-xl font-black text-blue-700 font-mono mt-0.5">
            {formatVND(summary.total_paid)}đ
          </div>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang truy vấn lịch sử...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
          Không có đơn hàng nào khớp với bộ lọc
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">Danh sách {orders.length} đơn hàng</span>
            <span>Hiển thị chi tiết từng món và snapshot giá bất biến</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((ord) => {
              const formattedDate = ord.session_date.split('-').reverse().join('/');
              return (
                <div key={ord.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {ord.employee_name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {ord.employee_name}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            ({ord.employee_department})
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">
                          {ord.store_name} • Ngày {formattedDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-bold font-mono text-stone-900 text-sm">
                          {formatVND(ord.total_amount)}đ
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Hỗ trợ: -{formatVND(ord.subsidy_amount)}đ • NV: {formatVND(ord.employee_paid_amount)}đ
                        </div>
                      </div>

                      {/* View sent message button */}
                      <button
                        onClick={() => onOpenZaloModal(ord.session_id)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Xem tin nhắn đã gửi cho quán vào ngày này"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xem tin</span>
                      </button>
                    </div>
                  </div>

                  {/* Order items snapshots */}
                  <div className="space-y-1.5 pl-3 border-l-2 border-stone-200 text-xs">
                    {ord.items?.map((it, idx) => {
                      let opts = {};
                      try { opts = JSON.parse(it.options_snapshot); } catch (e) {}

                      return (
                        <div key={idx} className="flex justify-between text-stone-700">
                          <span>
                            <b>{it.quantity}×</b> {it.product_name_snapshot} ({it.size_snapshot} • {opts.sugar} đường • {opts.ice}
                            {it.topping_snapshot ? ` • +${it.topping_snapshot}` : ''}
                            {opts.note ? ` • "${opts.note}"` : ''})
                          </span>
                          <span className="font-mono text-stone-500 font-medium">
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
        </div>
      )}
    </div>
  );
}
