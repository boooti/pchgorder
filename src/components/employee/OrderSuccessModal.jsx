import React from 'react';
import { CheckCircle2, Edit3, Trash2, Plus, Sparkles, Clock, Building2, Lock, UserCheck } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function OrderSuccessModal({ order, isSessionClosed, onEdit, onDeleteSuccess, onClose }) {
  if (!order) return null;

  const isHasOrderGium = order.items && order.items.some(i => i.is_gium);

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        await api.deleteOrder(order.id);
        showToast('Đã hủy đơn hàng thành công');
        onDeleteSuccess();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 rounded-3xl p-5 border border-emerald-200/80 shadow-lg relative overflow-hidden my-4">
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Header Success Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 block whitespace-nowrap">Trạng thái order</span>
            <h3 className="font-black text-lg text-slate-800 whitespace-nowrap">ĐÃ ĐẶT NƯỚC THÀNH CÔNG</h3>
          </div>
        </div>

        {isSessionClosed ? (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg whitespace-nowrap">
            Đã chốt đơn
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-lg whitespace-nowrap flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" /> Đã mở đơn
          </span>
        )}
      </div>

      {/* Order Item List */}
      <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100/60 shadow-inner space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            ĐƠN HÔM NAY CỦA BẠN ({order.items?.length || 0} món)
          </h4>
          
          {isHasOrderGium && (
            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap border border-amber-300">
              <UserCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Gồm món đặt giùm đồng nghiệp</span>
            </span>
          )}
        </div>

        {order.items && order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between text-xs py-2.5 border-b border-slate-100 last:border-0">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <p className="font-bold text-slate-800 text-sm">
                  {item.quantity}× {item.product_name_snapshot} ({item.size_snapshot})
                </p>
                {item.is_gium ? (
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-amber-700 flex-shrink-0" />
                    <span>👥 Đặt giùm cho {item.recipient_name} ({item.recipient_department || 'VP'})</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>👤 Món cho chính bạn</span>
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium mt-0.5">
                {item.sugar_option} đường · {item.ice_option}
                {item.toppings && item.toppings.length > 0 && ` · + Topping: ${item.toppings.map(t => t.name).join(', ')}`}
              </p>
              {item.note && <p className="text-amber-700 italic mt-0.5">"{item.note}"</p>}
            </div>
            <span className="font-extrabold text-slate-800 text-sm whitespace-nowrap">
              {new Intl.NumberFormat('vi-VN').format(item.subtotal)}đ
            </span>
          </div>
        ))}

        {/* Totals */}
        <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Tổng tiền:</span>
            <span className="font-semibold text-slate-800 whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ</span>
          </div>
          {order.subsidy_amount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>{order.sponsor_name ? `${order.sponsor_name} bao 100%` : 'Đã bao 100%'}:</span>
              <span className="whitespace-nowrap">-{new Intl.NumberFormat('vi-VN').format(order.subsidy_amount)}đ</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
            <span>Bạn trả:</span>
            <span className="text-brand-600 whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(order.employee_pay_amount)}đ</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Only allowed if session not closed) */}
      {!isSessionClosed ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5 flex-shrink-0" /> Sửa món / Thêm món
          </button>
          <button
            onClick={handleDelete}
            className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 flex-shrink-0" /> Hủy đơn
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 text-center mt-3 italic">
          Phiên order đã chốt. Vui lòng liên hệ Quản lý nếu cần điều chỉnh khẩn cấp.
        </p>
      )}
    </div>
  );
}
