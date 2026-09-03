import React, { useState, useEffect } from 'react';
import { RotateCcw, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

export default function FavoriteOrders({ storeId }) {
  const { currentUser } = useUser();
  const { addToCart } = useCart();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && storeId) {
      setLoading(true);
      api.getRecentOrders(currentUser.id, storeId)
        .then(data => setRecentItems(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [currentUser, storeId]);

  if (!currentUser || recentItems.length === 0) return null;

  const handleReorder = (item) => {
    if (item.current_is_available === 0) {
      showToast(`Món "${item.product_name_snapshot}" hiện tại quán đã HẾT MÓN!`, 'error');
      return;
    }

    const toppings = item.toppings || [];
    const toppingTotal = toppings.reduce((sum, t) => sum + (t.price || 0), 0);
    const unitPrice = item.current_unit_price || item.unit_price_snapshot;
    const subtotal = (unitPrice + toppingTotal) * item.quantity;

    addToCart({
      product_id: item.current_product_id || null,
      product_name: item.product_name_snapshot,
      image: item.current_image,
      size: item.size_snapshot,
      unit_price: unitPrice,
      sugar_option: item.sugar_option,
      ice_option: item.ice_option,
      toppings,
      quantity: item.quantity,
      subtotal,
      note: item.note
    });

    showToast(`Đã thêm món thường uống "${item.product_name_snapshot}" vào giỏ hàng!`);
  };

  return (
    <div className="my-5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">MÓN THƯỜNG UỐNG & ORDER GẦN ĐÂY</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {recentItems.map((item, idx) => {
          const isAvail = item.current_is_available !== 0;
          return (
            <div
              key={idx}
              className={`flex-shrink-0 w-64 bg-white rounded-2xl p-3 border transition flex flex-col justify-between ${
                isAvail ? 'border-slate-100 shadow-sm hover:border-brand-300' : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 truncate max-w-[150px]">
                    {item.product_name_snapshot}
                  </h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                    Size {item.size_snapshot}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {item.sugar_option} đường · {item.ice_option}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-brand-600">
                  {new Intl.NumberFormat('vi-VN').format(item.current_unit_price || item.unit_price_snapshot)}đ
                </span>

                <button
                  disabled={!isAvail}
                  onClick={() => handleReorder(item)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-brand-600 disabled:opacity-40 text-white text-[11px] font-bold rounded-xl transition"
                >
                  <RotateCcw className="w-3 h-3" /> ORDER LẠI
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
