import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Coffee, ShoppingBag, Users, UserCheck, Search, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { api } from '../../api';
import { showToast } from '../common/Toast';

const SUGAR_OPTIONS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_OPTIONS = ['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'];

export default function CustomizeBottomSheet({ product, availableToppings = [], sessionId, allowedEmployeeIds = null, isSessionClosed, onClose, onOrderSubmitted }) {
  const { addToCart } = useCart();
  const { currentUser } = useUser();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState('100%');
  const [selectedIce, setSelectedIce] = useState('Bình thường');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Order Giùm Picker Modal State
  const [employeesList, setEmployeesList] = useState([]);
  const [showColleagueModal, setShowColleagueModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.size_name === 'M') || product.sizes[0];
      setSelectedSize(defaultSize);
    }
  }, [product]);

  // Load employee list for "Order Giùm"
  useEffect(() => {
    api.getEmployees()
      .then(emps => setEmployeesList(emps.filter(e => e.is_active)))
      .catch(() => {});
  }, []);

  if (!product) return null;

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev.some(t => t.id === topping.id);
      if (exists) return prev.filter(t => t.id !== topping.id);
      return [...prev, topping];
    });
  };

  const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = selectedSize ? selectedSize.price : 0;
  const subtotal = (unitPrice + toppingTotal) * quantity;

  // Add To Cart for specified employee (self or colleague)
  const handleAddToCart = (targetEmployee) => {
    if (!selectedSize) {
      showToast('Vui lòng chọn Size!', 'error');
      return;
    }

    const recipient = targetEmployee || currentUser;
    const isGium = recipient && currentUser && recipient.id !== currentUser.id;

    addToCart({
      product_id: product.id,
      product_name: product.name,
      image: product.image,
      size: selectedSize.size_name,
      unit_price: selectedSize.price,
      sugar_option: selectedSugar,
      ice_option: selectedIce,
      toppings: selectedToppings.map(t => ({ name: t.topping_name, price: t.price })),
      quantity,
      subtotal,
      note,
      recipientEmployee: recipient,
      isOrderGium: isGium
    });

    const recipientText = isGium ? recipient.name : 'bạn';
    showToast(`🎉 Đã thêm ${quantity}x ${product.name} cho ${recipientText} vào giỏ!`, 'success');
    setShowColleagueModal(false);
    onClose();
  };

  // Strictly filter colleague list to ONLY show employees who are in the active group
  const groupEmployees = (allowedEmployeeIds && Array.isArray(allowedEmployeeIds) && allowedEmployeeIds.length > 0)
    ? employeesList.filter(emp => allowedEmployeeIds.includes(emp.id))
    : employeesList;

  const filteredEmployees = groupEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border border-slate-200 relative">
        
        {/* Header */}
        <div className="p-4 bg-navy-950 text-white border-b border-navy-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=100&q=80'}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover shadow-sm border border-navy-700 flex-shrink-0"
            />
            <div>
              <h2 className="font-extrabold text-base text-white leading-tight">{product.name}</h2>
              <p className="text-xs text-amber-400 font-black mt-0.5">
                {new Intl.NumberFormat('vi-VN').format(unitPrice)}đ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition whitespace-nowrap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Customization Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Size Selection */}
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              1. Chọn Size <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes && product.sizes.map(s => {
                const isSelected = selectedSize && selectedSize.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-navy-900 border-navy-900 text-white shadow-md font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">Size {s.size_name}</span>
                    <span className={`text-[11px] opacity-80 mt-0.5 ${isSelected ? 'text-amber-300' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(s.price)}đ
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sugar Options */}
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              2. Chọn Đường
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGAR_OPTIONS.map(sugar => {
                const isSelected = selectedSugar === sugar;
                return (
                  <button
                    key={sugar}
                    onClick={() => setSelectedSugar(sugar)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-navy-800 text-white border-navy-800 shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sugar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ice Options */}
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              3. Chọn Đá
            </label>
            <div className="flex flex-wrap gap-2">
              {ICE_OPTIONS.map(ice => {
                const isSelected = selectedIce === ice;
                return (
                  <button
                    key={ice}
                    onClick={() => setSelectedIce(ice)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-navy-800 text-white border-navy-800 shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {ice}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings Multi-select */}
          {availableToppings.length > 0 && (
            <div>
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                4. Topping Thêm (Tùy chọn)
              </label>
              <div className="space-y-1.5">
                {availableToppings.map(t => {
                  const isChecked = selectedToppings.some(st => st.id === t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                        isChecked
                          ? 'bg-navy-50 border-navy-400 text-navy-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-navy-800 border-navy-800 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{t.topping_name}</span>
                      </div>
                      <span className="font-bold text-navy-800">
                        +{new Intl.NumberFormat('vi-VN').format(t.price)}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Số lượng</span>
            <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 disabled:opacity-30 flex items-center justify-center font-bold shadow-sm active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-extrabold text-navy-950 text-base">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Ghi chú riêng</label>
            <input
              type="text"
              placeholder="VD: Không lấy sữa đặc, để đá riêng..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 outline-none focus:border-navy-600"
            />
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2 sticky bottom-0 z-20">
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-extrabold text-slate-400">Tổng tiền món</span>
            <span className="text-xl font-black text-navy-900">
              {new Intl.NumberFormat('vi-VN').format(subtotal)}đ
            </span>
          </div>

          {/* ACTION BUTTON 1: ADD FOR SELF */}
          <button
            onClick={() => handleAddToCart(currentUser)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 hover:from-navy-950 hover:to-navy-900 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition border border-navy-700 whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="whitespace-nowrap">THÊM VÀO GIỎ CHO BẠN ({currentUser?.name})</span>
          </button>

          {/* ACTION BUTTON 2: ORDER GIÙM (CHO ĐỒNG NGHIỆP TRONG NHÓM) */}
          <button
            onClick={() => setShowColleagueModal(true)}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 whitespace-nowrap"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">👥 ĐẶT NƯỚC GIÙM CHO ĐỒNG NGHIỆP TRONG NHÓM</span>
          </button>

        </div>

        {/* OVERLAY POPUP MODAL FOR SELECTING COLLEAGUE IN GROUP ONLY */}
        {showColleagueModal && (
          <div
            onClick={() => setShowColleagueModal(false)}
            className="absolute inset-0 z-30 bg-navy-950/80 backdrop-blur-sm p-4 flex flex-col justify-end sm:justify-center animate-fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] animate-slide-up space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center font-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-950 whitespace-nowrap">ĐẶT GIÙM CHO THÀNH VIÊN TRONG NHÓM</h3>
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">Chỉ hiển thị đồng nghiệp thuộc nhóm order này ({groupEmployees.length} người)</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowColleagueModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm đồng nghiệp trong nhóm..."
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs font-bold text-navy-950 rounded-xl border border-slate-200 outline-none focus:border-navy-600"
                  autoFocus
                />
              </div>

              {/* Group Employees List Only */}
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56 p-1">
                {filteredEmployees.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">Không tìm thấy thành viên nào thuộc nhóm order này</p>
                ) : (
                  filteredEmployees.map(emp => {
                    const isMe = currentUser && currentUser.id === emp.id;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleAddToCart(emp)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isMe
                            ? 'bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-white hover:bg-navy-950 hover:text-white border-slate-200 font-bold text-navy-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{emp.name}</span>
                          <span className="text-[10px] opacity-75 font-mono">({emp.code})</span>
                          {isMe && <span className="text-[9px] font-extrabold text-amber-600">(Chính bạn)</span>}
                        </div>
                        <span className="text-[11px] font-extrabold text-amber-600 hover:text-amber-400">
                          Chọn người này ➔
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowColleagueModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
