import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function CustomizeItemSheet({
  isOpen,
  onClose,
  product,
  availableToppings = [],
  onAddToCart,
  initialData = null,
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState('100%');
  const [selectedIce, setSelectedIce] = useState('Bình thường');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const sugarOptions = ['0%', '30%', '50%', '70%', '100%'];
  const iceOptions = ['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'];

  useEffect(() => {
    if (product) {
      if (initialData) {
        // Edit mode
        const matchedSize = product.sizes?.find((s) => s.size_name === initialData.size) || product.sizes?.[0];
        setSelectedSize(matchedSize);
        setSelectedSugar(initialData.sugar || '100%');
        setSelectedIce(initialData.ice || 'Bình thường');
        setQuantity(initialData.quantity || 1);
        setNote(initialData.note || '');

        if (initialData.topping) {
          const names = initialData.topping.split(',').map((s) => s.trim());
          const tops = availableToppings.filter((t) => names.includes(t.name));
          setSelectedToppings(tops);
        } else {
          setSelectedToppings([]);
        }
      } else {
        // Add new mode
        const defaultSize = product.sizes?.find((s) => s.is_default === 1) || product.sizes?.[0];
        setSelectedSize(defaultSize || null);
        setSelectedSugar('100%');
        setSelectedIce('Bình thường');
        setSelectedToppings([]);
        setQuantity(1);
        setNote('');
      }
    }
  }, [product, initialData, availableToppings]);

  if (!isOpen || !product) return null;

  // Calculate realtime unit price
  const basePrice = selectedSize ? selectedSize.price : (product.sizes?.[0]?.price || 0);
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);
  const unitPrice = basePrice;
  const totalPrice = (unitPrice + toppingsTotal) * quantity;

  const toggleTopping = (top) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === top.id);
      if (exists) {
        return prev.filter((t) => t.id !== top.id);
      } else {
        return [...prev, top];
      }
    });
  };

  const handleAdd = () => {
    const itemData = {
      cart_item_id: initialData?.cart_item_id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      product_id: product.id,
      product_name: product.name,
      image: product.image,
      size: selectedSize?.size_name || 'M',
      unit_price: basePrice,
      topping: selectedToppings.map((t) => t.name).join(', '),
      topping_price: toppingsTotal,
      sugar: selectedSugar,
      ice: selectedIce,
      note: note.trim(),
      quantity: quantity,
      total_price: totalPrice,
    };
    onAddToCart(itemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container - Bottom sheet on mobile, rounded card on desktop */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-stone-100 bottom-sheet-shadow">
        {/* Header without image - Clean, spacious & compact */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 relative bg-gradient-to-r from-blue-50/50 via-white to-slate-50">
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Tùy Biến Theo Gu Riêng 🍹
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-tight">
              {product.name}
            </h3>
            <div className="text-blue-700 font-black text-lg mt-1 font-mono">
              {formatVND(basePrice)}đ
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Kích cỡ (Size bự uống mới đã) <span className="text-blue-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize?.id === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-600 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="text-sm">Size {sz.size_name}</div>
                      <div className="text-xs text-blue-700 font-semibold mt-0.5">
                        {formatVND(sz.price)}đ
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Sugar Selection */}
          {product.allow_sugar !== 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Độ ngọt (Ngọt ngào như crush) 🍬
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {sugarOptions.map((s) => {
                  const isSelected = selectedSugar === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSugar(s)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Ice Selection */}
          {product.allow_ice !== 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Lượng đá (Mát lạnh sảng khoái) 🧊
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {iceOptions.map((ice) => {
                  const isSelected = selectedIce === ice;
                  return (
                    <button
                      key={ice}
                      type="button"
                      onClick={() => setSelectedIce(ice)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {ice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Toppings */}
          {availableToppings.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Thêm Topping (Nhai cho sướng miệng) ✨
              </label>
              <div className="space-y-2">
                {availableToppings.map((top) => {
                  const isChecked = selectedToppings.some((t) => t.id === top.id);
                  return (
                    <div
                      key={top.id}
                      onClick={() => toggleTopping(top)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{top.name}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-800">
                        +{formatVND(top.price)}đ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Note Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Dặn dò quán (Đừng ghi gì quá đáng nhen 😆)
            </label>
            <input
              type="text"
              placeholder="VD: Ít ngọt, nhiều trân châu, đừng làm chua lè nha quán..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Footer: Quantity stepper & Submit button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold font-mono text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between active:scale-[0.98]"
          >
            <span>{initialData ? 'CẬP NHẬT MÓN NÀY ✏️' : 'CHO VÀO GIỎ LIỀN 🛒'}</span>
            <span className="text-blue-100 font-mono text-sm">{formatVND(totalPrice)}đ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
