import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Clock, Trash2, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { showToast } from '../components/Toast';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function MyOrders({ currentUser, session, onNavigateHome, onOpenUserModal }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (currentUser && session) {
      loadMyOrder();
    } else {
      setLoading(false);
    }
  }, [currentUser, session]);

  async function loadMyOrder() {
    try {
      setLoading(true);
      if (session && currentUser) {
        const res = await api.getMyOrder(session.id, currentUser.id);
        if (res.success && res.data) {
          setOrder(res.data);
          return;
        }
      }
      if (currentUser) {
        const res = await api.getEmployeeOrders(currentUser.id, 10);
        if (res.success && res.data) {
          const currentSessionOrder = res.data.find(
            (o) => session && o.session_id === session.id && o.status !== 'CANCELLED'
          );
          setOrder(currentSessionOrder || null);
        } else {
          setOrder(null);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn nước hôm nay không?')) return;

    try {
      setCancelling(true);
      const res = await api.cancelOrder(order.id);
      if (res.success) {
        showToast('Đã hủy đơn hàng thành công', 'success');
        setOrder(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">Bạn chưa chọn danh tính</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Vui lòng chọn tên của bạn để xem và quản lý đơn nước hôm nay.
        </p>
        <button
          onClick={onOpenUserModal}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow transition-all"
        >
          Chọn tên nhân viên
        </button>
      </div>
    );
  }

  const isSessionOpen = session?.status === 'OPEN';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đơn hàng của bạn</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem lại món đã chọn và trạng thái chốt đơn hôm nay
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="py-2 px-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về menu</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang kiểm tra đơn của bạn...
        </div>
      ) : !order ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingCart className="w-8 h-8 opacity-80" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Hôm nay bạn chưa đặt món nào!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Phiên order tại <b>{session?.store_name || 'quán'}</b> đang mở. Hãy chọn món yêu thích của bạn ngay nhé!
            </p>
          </div>

          <button
            onClick={onNavigateHome}
            disabled={!isSessionOpen}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ĐẶT NƯỚC NGAY</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
          {/* Order Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Đã ghi nhận đơn
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {session?.store_name}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isSessionOpen ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {isSessionOpen ? 'Phiên đang mở' : 'Đã chốt đơn'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 divide-y divide-slate-100 space-y-4">
            {order.items?.map((it, idx) => {
              let opts = {};
              try { opts = JSON.parse(it.options_snapshot); } catch (e) {}

              return (
                <div key={idx} className="pt-4 first:pt-0 flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">
                      {it.product_name_snapshot}{' '}
                      <span className="text-xs font-semibold text-slate-500 font-mono">
                        × {it.quantity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 space-x-1">
                      <span className="font-semibold text-blue-700">Size {it.size_snapshot}</span>
                      <span>•</span>
                      <span>{opts.sugar} đường</span>
                      <span>•</span>
                      <span>{opts.ice}</span>
                    </div>
                    {it.topping_snapshot && (
                      <div className="text-xs text-blue-800 mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block">
                        +{it.topping_snapshot}
                      </div>
                    )}
                    {opts.note && (
                      <div className="text-xs text-slate-500 italic mt-1">
                        Ghi chú: "{opts.note}"
                      </div>
                    )}
                  </div>

                  <div className="font-bold font-mono text-slate-900 text-sm sm:text-base shrink-0">
                    {formatVND(it.item_total_price)}đ
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary */}
          <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Tổng tiền món:</span>
              <span className="font-semibold text-slate-800">{formatVND(order.total_amount)}đ</span>
            </div>
            {session?.sponsor_type === 'SPONSOR' || order.employee_paid_amount === 0 ? (
              <div className="flex justify-between text-amber-800 font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                <span>🎁 {session?.sponsor_name || 'Người bao'} bao trọn gói:</span>
                <span>Miễn phí 100% (0đ)</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-600 font-medium bg-slate-50 p-2 rounded-xl">
                <span>Hình thức:</span>
                <span className="font-bold text-slate-800">Tự túc trả tiền</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Bạn thanh toán:</span>
              <span className="text-lg text-emerald-700 font-mono font-bold">
                {session?.sponsor_type === 'SPONSOR' || order.employee_paid_amount === 0 ? '0đ (Được bao)' : `${formatVND(order.employee_paid_amount || order.total_amount)}đ`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
            {isSessionOpen ? (
              <>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đặt thêm / Đổi món</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hủy đơn</span>
                </button>
              </>
            ) : (
              <div className="w-full text-center text-xs font-medium text-slate-400 py-1">
                🔒 Phiên order hôm nay đã được Admin chốt. Đơn hàng không thể chỉnh sửa hoặc hủy.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
