import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function FloatingCart({
  cartItems = [],
  subsidyAmount = 20000,
  session = null,
  onUpdateQty,
  onRemoveItem,
  onEditItem,
  onSubmitOrder,
  isSubmitting = false,
  isSessionClosed = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (cartItems.length === 0) return null;

  const isSponsored = session?.sponsor_type === 'SPONSOR';
  const sponsorName = session?.sponsor_name || 'Người bao';

  const totalCups = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const totalAmount = cartItems.reduce((sum, it) => sum + (it.total_price || 0), 0);
  const employeePay = isSponsored ? 0 : totalAmount;

  const handleOrder = () => {
    if (isSubmitting || isSessionClosed) return;
    onSubmitOrder();
  };

  return (
    <>
      {/* Floating Bottom Bar (Sticky trigger) - Navy */}
      <div className="fixed bottom-3 inset-x-3 sm:bottom-6 sm:max-w-md sm:mx-auto z-40">
        <div className="bg-slate-950 text-white rounded-3xl p-3 sm:p-3.5 shadow-2xl border border-blue-900/50 flex items-center justify-between gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99]">
          <div
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 cursor-pointer flex-1 pl-1"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md relative shrink-0">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-extrabold border-2 border-slate-950">
                {totalCups}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Giỏ hàng của bạn</div>
              <div className="text-base font-bold text-blue-300 font-mono">
                {formatVND(employeePay)}đ
                {isSponsored ? (
                  <span className="text-xs text-amber-300 ml-2 font-normal font-sans">
                    (Được bao: 0đ)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 ml-2 font-normal font-sans">
                    (Tự túc)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shrink-0 shadow"
          >
            <span>Xem giỏ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cart Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 bottom-sheet-shadow">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    Giỏ hàng của bạn ({totalCups} ly)
                  </h3>
                  <p className="text-xs text-slate-500">Kiểm tra lại món trước khi gửi đơn</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-4">
              {cartItems.map((item, idx) => {
                return (
                  <div key={item.cart_item_id || idx} className="pt-4 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm sm:text-base">
                          {item.product_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 space-x-1.5">
                          <span className="font-semibold text-blue-700">Size {item.size}</span>
                          <span>•</span>
                          <span>{item.sugar} đường</span>
                          <span>•</span>
                          <span>{item.ice}</span>
                        </div>
                        {item.topping && (
                          <div className="text-xs text-blue-800 bg-blue-50 rounded-md px-2 py-0.5 mt-1.5 inline-block font-medium">
                            +{item.topping} (+{formatVND(item.topping_price)}đ)
                          </div>
                        )}
                        {item.note && (
                          <div className="text-xs text-slate-500 italic mt-1">
                            Ghi chú: "{item.note}"
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                          {formatVND(item.total_price)}đ
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 justify-end">
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Chỉnh sửa món"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.cart_item_id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity control per item */}
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <span className="text-xs text-slate-400 font-medium">Số lượng:</span>
                      <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cart_item_id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 transition-colors shadow-none hover:shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold font-mono text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cart_item_id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 transition-colors shadow-none hover:shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tổng tiền món:</span>
                <span className="font-mono text-slate-700">{formatVND(totalAmount)}đ</span>
              </div>

              {isSponsored ? (
                <div className="flex justify-between text-xs text-amber-800 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="flex items-center gap-1.5">
                    <span>🎁 {sponsorName} bao trọn gói:</span>
                  </span>
                  <span className="font-mono">Miễn phí 100% (0đ)</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs text-slate-600 font-medium bg-slate-100 p-2.5 rounded-xl">
                  <span>Hình thức thanh toán:</span>
                  <span className="font-bold text-slate-800">Tự túc trả tiền</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Số tiền bạn thanh toán:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {formatVND(employeePay)}đ
                </span>
              </div>

              {/* Submit Button with double click guard */}
              <button
                type="button"
                onClick={handleOrder}
                disabled={isSubmitting || isSessionClosed}
                className="w-full mt-3 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 hover:from-blue-800 hover:to-slate-950 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu đơn hàng...</span>
                  </>
                ) : isSessionClosed ? (
                  <span>ORDER ĐÃ ĐÓNG (Không thể đặt)</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      {isSponsored
                        ? `XÁC NHẬN ĐẶT NƯỚC (0đ - ${sponsorName} bao)`
                        : `XÁC NHẬN ĐẶT NƯỚC (${formatVND(employeePay)}đ)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
