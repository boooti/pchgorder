import React, { useState, useEffect } from 'react';
import { Coffee, Clock, MapPin, Phone, User, CheckCircle2, X, Crown, HeartHandshake, Users, Shield } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function SessionManager({ isOpen, onClose, onSuccess }) {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [cutoffTime, setCutoffTime] = useState('11:00');

  // Sponsorship mode state
  const [sponsorMode, setSponsorMode] = useState('COMPANY'); // 'COMPANY', 'SPONSOR_100', 'PARTIAL', 'SHARE'
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState(15000);

  // Delivery form state
  const [delivery, setDelivery] = useState({
    recipient_name: '',
    recipient_phone: '',
    delivery_address: 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập',
    delivery_time: '10:30',
    delivery_note: ''
  });
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getStores().then(data => {
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id);
          setDelivery({
            recipient_name: data[0].delivery?.recipient_name || '',
            recipient_phone: data[0].delivery?.recipient_phone || '',
            delivery_address: data[0].delivery?.delivery_address || 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập',
            delivery_time: data[0].delivery?.delivery_time || '10:30',
            delivery_note: data[0].delivery?.delivery_note || ''
          });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    setDelivery({
      recipient_name: store.delivery?.recipient_name || '',
      recipient_phone: store.delivery?.recipient_phone || '',
      delivery_address: store.delivery?.delivery_address || 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập',
      delivery_time: store.delivery?.delivery_time || '10:30',
      delivery_note: store.delivery?.delivery_note || ''
    });
  };

  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!selectedStoreId) {
      showToast('Vui lòng chọn 1 quán!', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.openSession({
        storeId: selectedStoreId,
        cutoff_time: cutoffTime,
        sponsor_mode: sponsorMode,
        sponsor_name: sponsorName,
        sponsor_amount: sponsorAmount,
        ...delivery,
        save_as_default: saveAsDefault
      });
      showToast('🎉 Đã mở phiên order thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-navy-950 text-white border-b border-navy-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-black shadow-md">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Chuyển Quán & Mở Order Hôm Nay</h2>
              <p className="text-xs text-navy-200">Chọn quán nước, giờ chốt và thông tin giao hàng</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleOpenSession} className="p-5 overflow-y-auto space-y-5 text-xs">

          {/* 1. STORE SELECTION */}
          <div>
            <label className="font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              1. Chọn Quán Order Hôm Nay <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stores.map(store => {
                const isSelected = selectedStoreId === store.id;
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleSelectStore(store)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-navy-900 border-navy-900 text-white shadow-md font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={store.logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=100&q=80'}
                        alt={store.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{store.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                          {store.productCount} món trong menu
                        </p>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CUTOFF TIME */}
          <div>
            <label className="font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              2. Giờ Giới Hạn Chốt Đơn (Cutoff Time)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="VD: 11:00"
                  value={cutoffTime}
                  onChange={e => setCutoffTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                />
              </div>
              <span className="text-slate-400 font-medium">Hệ thống sẽ khóa đơn sau giờ này</span>
            </div>
          </div>

          {/* 3. SPONSORSHIP MODE */}
          <div>
            <label className="font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              3. Hình Thức Thanh Toán / Trợ Giá
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSponsorMode('COMPANY')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                  sponsorMode === 'COMPANY'
                    ? 'bg-navy-900 text-white border-navy-900 font-bold shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-xs">🏢 Công Ty Trợ Giá</div>
                  <div className="text-[10px] opacity-75 font-normal">Trợ giá 20.000đ/người</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSponsorMode('SPONSOR_100')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                  sponsorMode === 'SPONSOR_100'
                    ? 'bg-amber-500 text-navy-950 border-amber-500 font-extrabold shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Crown className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-xs">👑 Cá Nhân Bao 100%</div>
                  <div className="text-[10px] opacity-90 font-normal">Sếp hoặc cá nhân bao</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSponsorMode('PARTIAL')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                  sponsorMode === 'PARTIAL'
                    ? 'bg-navy-900 text-white border-navy-900 font-bold shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <HeartHandshake className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-xs">🤝 Hỗ Trợ Một Phần</div>
                  <div className="text-[10px] opacity-75 font-normal">Tùy chọn số tiền/ly</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSponsorMode('SHARE')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                  sponsorMode === 'SHARE'
                    ? 'bg-navy-900 text-white border-navy-900 font-bold shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-xs">💸 Share Đều / Tự Trả</div>
                  <div className="text-[10px] opacity-75 font-normal">Tất cả tự trả tiền nước</div>
                </div>
              </button>
            </div>

            {/* Dynamic Sponsor Inputs */}
            {sponsorMode !== 'COMPANY' && sponsorMode !== 'SHARE' && (
              <div className="bg-navy-50 p-3 rounded-2xl border border-navy-200 space-y-2 mt-2">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Tên Người Bao / Hỗ Trợ</label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    placeholder="VD: Sếp Lam, Sếp Tiến..."
                    className="w-full px-3 py-2 rounded-xl border border-navy-300 bg-white font-bold outline-none"
                  />
                </div>

                {sponsorMode === 'PARTIAL' && (
                  <div>
                    <label className="font-bold text-navy-900 block mb-1">Số tiền hỗ trợ trên mỗi ly (đ)</label>
                    <input
                      type="number"
                      value={sponsorAmount}
                      onChange={e => setSponsorAmount(Number(e.target.value))}
                      placeholder="VD: 15000"
                      className="w-full px-3 py-2 rounded-xl border border-navy-300 bg-white font-bold outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. DELIVERY PROFILE */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="font-extrabold text-slate-400 uppercase tracking-wider block">
              4. Thông Tin Giao Hàng Cho Món Hôm Nay
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Người Nhận Nước</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="VD: Lễ Tân Công Ty"
                    value={delivery.recipient_name}
                    onChange={e => setDelivery(prev => ({ ...prev, recipient_name: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SĐT Nhận Nước</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="VD: 0901 234 567"
                    value={delivery.recipient_phone}
                    onChange={e => setDelivery(prev => ({ ...prev, recipient_phone: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa Chỉ Nhận Nước</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập"
                  value={delivery.delivery_address}
                  onChange={e => setDelivery(prev => ({ ...prev, delivery_address: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giờ Dự Kiến Giao</label>
                <input
                  type="text"
                  placeholder="VD: 10:30"
                  value={delivery.delivery_time}
                  onChange={e => setDelivery(prev => ({ ...prev, delivery_time: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Giao Hàng</label>
                <input
                  type="text"
                  placeholder="VD: Giao tại cổng sau công ty"
                  value={delivery.delivery_note}
                  onChange={e => setDelivery(prev => ({ ...prev, delivery_note: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-navy-950 outline-none focus:border-navy-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-navy-900">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={e => setSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-navy-900 focus:ring-navy-900"
                />
                <span>Lưu thông tin giao hàng làm MẶC ĐỊNH cho quán này</span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Hủy
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-navy-900 to-navy-950 hover:from-navy-950 hover:to-navy-900 text-white font-black rounded-xl shadow-md flex items-center gap-1.5"
            >
              {loading ? 'Đang xử lý...' : 'XÁC NHẬN MỞ ORDER HÔM NAY'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
