import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, Eye, Edit3, Trash2, X, ArrowRight } from 'lucide-react';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  order,
  session,
  onEditOrder,
  onCancelOrder,
}) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D97706', '#10B981', '#F59E0B', '#3B82F6'],
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const isSessionOpen = session?.status === 'OPEN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Banner Top */}
        <div className="p-6 text-center bg-gradient-to-b from-emerald-50 to-white relative pb-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            ĐẶT NƯỚC THÀNH CÔNG!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Đơn của bạn đã được ghi nhận vào phiên hôm nay ({session?.session_date})
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1">
            <span>Món đã đặt</span>
            <span>Số tiền</span>
          </div>

          <div className="space-y-3 pt-3">
            {order.items?.map((it, idx) => {
              let opts = {};
              try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
              return (
                <div key={idx} className="flex justify-between items-start gap-2 text-sm">
                  <div>
                    <div className="font-bold text-slate-800">
                      {it.product_name_snapshot}{' '}
                      <span className="text-xs font-medium text-slate-500 font-mono">
                        × {it.quantity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-x-1 mt-0.5">
                      <span className="font-semibold text-blue-700">Size {it.size_snapshot}</span>
                      <span>•</span>
                      <span>{opts.sugar} đường</span>
                      <span>•</span>
                      <span>{opts.ice}</span>
                    </div>
                    {it.topping_snapshot && (
                      <div className="text-[11px] text-blue-800 mt-0.5 font-medium">
                        +{it.topping_snapshot}
                      </div>
                    )}
                    {opts.note && (
                      <div className="text-[11px] text-slate-400 italic">
                        "{opts.note}"
                      </div>
                    )}
                  </div>
                  <div className="font-bold font-mono text-slate-800 shrink-0">
                    {formatVND(it.item_total_price)}đ
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary */}
          <div className="pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Tổng tiền nước:</span>
              <span className="font-semibold">{formatVND(order.total_amount)}đ</span>
            </div>
            {session?.sponsor_type === 'SPONSOR' ? (
              <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                <span>🎁 {session.sponsor_name || 'Người bao'} bao:</span>
                <span>-{formatVND(order.total_amount)}đ</span>
              </div>
            ) : order.subsidy_amount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Công ty hỗ trợ:</span>
                <span>-{formatVND(order.subsidy_amount)}đ</span>
              </div>
            ) : null}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Bạn thanh toán:</span>
              <span className="text-base text-emerald-700 font-mono">
                {session?.sponsor_type === 'SPONSOR' ? '0đ (Được bao)' : `${formatVND(order.employee_paid_amount)}đ`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2">
          {isSessionOpen ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEditOrder}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa đơn hàng</span>
              </button>
              <button
                type="button"
                onClick={onCancelOrder}
                className="py-3 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hủy đơn</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-1">
              Phiên đã chốt - Không thể sửa đổi đơn
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-colors shadow"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
