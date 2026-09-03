import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, Users, UserCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function CartDrawer({ sessionId, isSessionClosed, onOrderSubmitted }) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount, subsidy, employeePay, isCartOpen, setIsCartOpen } = useCart();
  const { currentUser, isUserSelected } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Validate cart error conditions on drawer open
  useEffect(() => {
    if (isCartOpen) {
      if (!isUserSelected || !currentUser) {
        setErrorMessage('⚠️ Vui lòng chọn tên nhân viên trước khi xác nhận đặt nước!');
      } else if (isSessionClosed) {
        setErrorMessage('🔒 Phiên order hôm nay đã chốt! Không thể đặt hàng.');
      } else {
        setErrorMessage('');
      }
    }
  }, [isCartOpen, isUserSelected, currentUser, isSessionClosed]);

  if (!isCartOpen) return null;

  const handleSubmitOrder = async () => {
    if (!isUserSelected || !currentUser) {
      const err = 'Vui lòng chọn tên nhân viên trước khi đặt nước!';
      setErrorMessage(`⚠️ ${err}`);
      showToast(err, 'warning');
      return;
    }

    if (cartItems.length === 0) {
      const err = 'Giỏ hàng của bạn đang trống!';
      setErrorMessage(`⚠️ ${err}`);
      showToast(err, 'warning');
      return;
    }

    if (isSessionClosed) {
      const err = 'Phiên order hôm nay đã chốt! Không thể đặt hàng.';
      setErrorMessage(`🔒 ${err}`);
      showToast(err, 'error');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      // Group items by target recipient employee
      const itemsByEmpMap = {};
      for (const item of cartItems) {
        const emp = item.recipientEmployee || currentUser;
        const empId = emp.id;
        if (!itemsByEmpMap[empId]) {
          itemsByEmpMap[empId] = {
            employeeId: empId,
            employeeName: emp.name,
            items: []
          };
        }
        itemsByEmpMap[empId].items.push(item);
      }

      // Submit separate order payload per recipient
      for (const empId of Object.keys(itemsByEmpMap)) {
        const group = itemsByEmpMap[empId];
        const payload = {
          sessionId,
          employeeId: group.employeeId,
          orderedByEmployeeId: currentUser.id,
          orderedByName: currentUser.name,
          items: group.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            unit_price: item.unit_price,
            sugar_option: item.sugar_option,
            ice_option: item.ice_option,
            toppings: item.toppings,
            quantity: item.quantity,
            note: item.note
          })),
          note: orderNote
        };

        await api.submitOrder(payload);
      }

      showToast(`🎉 Đã chốt đơn thành công (${Object.keys(itemsByEmpMap).length} người nhận)!`, 'success');
      clearCart();
      setIsCartOpen(false);
      if (onOrderSubmitted) onOrderSubmitted();
    } catch (err) {
      const errorText = err.message || 'Lỗi khi đặt nước. Vui lòng thử lại!';
      setErrorMessage(`❌ ${errorText}`);
      showToast(errorText, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-up sm:animate-none border-l border-slate-200">
        
        {/* Cart Header */}
        <div className="p-4 bg-navy-950 text-white border-b border-navy-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center font-black">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white leading-tight whitespace-nowrap">Giỏ Hàng Của Bạn</h2>
              <p className="text-[10px] text-navy-200 whitespace-nowrap">Kiểm tra món nước & chốt đơn</p>
            </div>
            {cartItems.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-navy-950 font-black whitespace-nowrap ml-1">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)} ly
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-xl text-navy-300 hover:text-white hover:bg-navy-800 transition whitespace-nowrap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HIGH-VISIBILITY TOP ERROR BANNER ALERT */}
        {errorMessage && (
          <div className="bg-red-600 text-white p-3.5 px-4 shadow-md flex items-center justify-between gap-3 animate-slide-down border-b border-red-700">
            <div className="flex items-center gap-2.5 text-xs font-black leading-tight min-w-0">
              <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 animate-bounce" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="p-1 text-red-200 hover:text-white rounded-lg hover:bg-red-700 transition flex-shrink-0 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User identification badge */}
        {currentUser && (
          <div className="px-4 py-2 bg-navy-50 border-b border-navy-200 flex items-center justify-between text-xs text-navy-950">
            <span className="text-navy-700 font-semibold whitespace-nowrap">Tài khoản người đặt:</span>
            <span className="font-extrabold text-navy-950 whitespace-nowrap">{currentUser.name} ({currentUser.department || 'Nhân viên'})</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-navy-950" />
              <p className="font-bold text-navy-950 text-sm">Giỏ hàng đang trống</p>
              <p className="text-xs mt-1 text-slate-400">Hãy chọn món nước mát lạnh từ menu để đặt nhé!</p>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const recipientName = item.recipientEmployee ? item.recipientEmployee.name : currentUser?.name;
              const isGium = item.isOrderGium || (item.recipientEmployee && item.recipientEmployee.id !== currentUser?.id);

              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                  
                  {/* Recipient tag badge */}
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200/60">
                    {isGium ? (
                      <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                        <Users className="w-3 h-3 text-amber-700 flex-shrink-0" />
                        <span>👥 Món cho: {recipientName} (Bạn đặt giùm)</span>
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                        <UserCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>Dành cho chính bạn</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=100&q=80'}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-navy-950 truncate">{item.product_name}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Size {item.size} · {item.sugar_option} đường · {item.ice_option}
                        </p>
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-[11px] text-navy-700 mt-0.5 font-bold truncate">
                            + Topping: {item.toppings.map(t => t.name).join(', ')}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-[11px] text-amber-700 italic mt-0.5 truncate">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 transition whitespace-nowrap flex-shrink-0"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="text-slate-600 hover:text-navy-950 px-1 font-bold text-xs whitespace-nowrap"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-navy-950 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="text-slate-600 hover:text-navy-950 px-1 font-bold text-xs whitespace-nowrap"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-extrabold text-sm text-navy-950 whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(item.subtotal)}đ
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Financial Summary & Order Action */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 space-y-3 sticky bottom-0">
            
            {/* Note for whole order */}
            <div>
              <input
                type="text"
                placeholder="Ghi chú tổng thể cho order..."
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-navy-950 rounded-xl border border-slate-200 outline-none focus:border-navy-600"
              />
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Tổng tiền nước ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} ly):</span>
                <span className="font-bold text-navy-950 whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span>
              </div>
              
              {subsidy > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" /> Trợ giá công ty:
                  </span>
                  <span className="whitespace-nowrap">-{new Intl.NumberFormat('vi-VN').format(subsidy)}đ</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-navy-950 pt-1.5 border-t border-slate-200">
                <span>Tổng cần trả:</span>
                <span className="text-amber-600 text-base font-black whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(employeePay)}đ</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              disabled={submitting || isSessionClosed}
              onClick={handleSubmitOrder}
              className="w-full py-3.5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 hover:from-navy-900 hover:to-navy-950 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-navy-950/30 flex items-center justify-center gap-2 active:scale-98 transition border border-navy-700 whitespace-nowrap"
            >
              {submitting ? (
                <span className="whitespace-nowrap">Đang xử lý đơn hàng...</span>
              ) : isSessionClosed ? (
                <span className="whitespace-nowrap">ĐƠN HÔM NAY ĐÃ ĐÓNG</span>
              ) : (
                <>
                  <span className="whitespace-nowrap">XÁC NHẬN CHỐT GỬI ĐƠN HÀNG</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
