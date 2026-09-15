import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Clock,
  Users,
  Building,
  Check,
  Search,
  Gift,
  Users2,
  Sparkles,
  MapPin,
  Phone,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { showToast } from './Toast';

export default function CreateGroupOrderModal({
  isOpen,
  onClose,
  currentUser,
  onGroupCreated
}) {
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [scopeType, setScopeType] = useState('ALL'); // 'ALL' | 'DEPARTMENT' | 'CUSTOM'
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [empSearch, setEmpSearch] = useState('');

  // Payment & Sponsor
  const [sponsorType, setSponsorType] = useState('SELF'); // 'SELF' | 'SPONSOR'
  const [sponsorName, setSponsorName] = useState('');

  // Delivery Info
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('Cổng sau Công ty Phú Cường Hoàng Gia - 1 Hà Huy Tập, Rạch Giá');
  const [deliveryNotes, setDeliveryNotes] = useState('Gọi trước khi giao 5-10 phút để ra cổng sau nhận.');

  // Calculate default close time: current time + 45 minutes
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 45);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setCloseTime(`${hh}:${mm}`);

      if (currentUser) {
        setRecipientName(currentUser.name || '');
        setRecipientPhone(currentUser.phone || '');
        setTitle(`Kèo nước ${currentUser.department || 'nhóm'} - ${currentUser.name} 🧋`);
        // Default select creator in custom list
        setSelectedEmpIds([currentUser.id]);
      } else {
        setTitle('Kèo trà sữa cứu đói chiều nay 🧋');
      }

      loadData();
    }
  }, [isOpen, currentUser]);

  async function loadData() {
    try {
      setLoading(true);
      const [resStores, resEmp] = await Promise.all([
        api.getStores(),
        api.getEmployees(true)
      ]);

      if (resStores.success) {
        setStores(resStores.data);
        if (resStores.data.length > 0) {
          setSelectedStoreId(resStores.data[0].id);
        }
      }
      if (resEmp.success) {
        setEmployees(resEmp.data);
      }
    } catch (err) {
      showToast('Lỗi nạp dữ liệu: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Extract unique departments
  const departments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  );

  const toggleDepartment = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmpIds(employees.map((e) => e.id));
  };

  const deselectAllEmployees = () => {
    setSelectedEmpIds(currentUser ? [currentUser.id] : []);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(empSearch.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Vui lòng đặt tên cho đợt order nhóm!', 'error');
      return;
    }
    if (!selectedStoreId) {
      showToast('Vui lòng chọn quán nước!', 'error');
      return;
    }
    if (scopeType === 'DEPARTMENT' && selectedDepts.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 phòng ban!', 'error');
      return;
    }
    if (scopeType === 'CUSTOM' && selectedEmpIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 thành viên tham gia nhóm!', 'error');
      return;
    }
    if (sponsorType === 'SPONSOR' && !sponsorName.trim()) {
      showToast('Vui lòng chọn hoặc nhập tên người bao hôm nay!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createGroupSession({
        title: title.trim(),
        store_id: selectedStoreId,
        created_by_employee_id: currentUser?.id || null,
        scope_type: scopeType,
        eligible_departments: scopeType === 'DEPARTMENT' ? selectedDepts : null,
        eligible_employee_ids: scopeType === 'CUSTOM' ? selectedEmpIds : null,
        close_time: closeTime,
        notes: `Đợt order: ${title.trim()}`,
        sponsor_type: sponsorType,
        sponsor_name: sponsorType === 'SPONSOR' ? sponsorName.trim() : null,
        delivery_info: {
          recipient_name: recipientName.trim(),
          recipient_phone: recipientPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          desired_delivery_time: closeTime,
          delivery_notes: deliveryNotes.trim()
        }
      });

      if (res.success) {
        showToast(res.message, 'success');
        if (onGroupCreated) onGroupCreated(res.data?.id);
        onClose();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Lập Kèo Bú Nước Nhóm Riêng 🧋🔥</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200">
                  KÈO NGON
                </span>
              </h3>
              <p className="text-xs text-blue-200/90">
                Mở kèo bao cả làng hoặc rủ rê cạ cứng ghép đơn chiến deadline nè! 🚀
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
          {/* 1. Tên đợt order & Giờ chốt */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1. Đặt tên kèo & Giờ khóa sổ ⏰</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tên kèo order <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cữ chiều phòng BIM, Trà sữa ăn mừng sếp vui tính..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khóa sổ lúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* 2. Chọn Quán Nước */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-600" />
              <span>2. Chọn quán nước <span className="text-red-500">*</span></span>
            </h4>

            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs">Đang tải danh sách quán...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {stores.map((st) => {
                  const isSelected = selectedStoreId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStoreId(st.id)}
                      className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={st.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'}
                        alt={st.name}
                        className="w-10 h-10 rounded-xl object-contain p-1 bg-white border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-xs truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.product_count || 0} món</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Phạm vi thành viên tham gia */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>3. Ai được đặt trong đợt này?</span>
              </h4>
            </div>

            {/* 3 Scope Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScopeType('ALL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scopeType === 'ALL'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">Toàn công ty</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tất cả {employees.length || 47} nhân viên</div>
              </button>

              <button
                type="button"
                onClick={() => setScopeType('DEPARTMENT')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scopeType === 'DEPARTMENT'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">Theo Phòng Ban</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chọn 1 hoặc nhiều phòng</div>
              </button>

              <button
                type="button"
                onClick={() => setScopeType('CUSTOM')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scopeType === 'CUSTOM'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">Chọn từng người</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tích chọn theo danh sách</div>
              </button>
            </div>

            {/* Scope: DEPARTMENT Picker */}
            {scopeType === 'DEPARTMENT' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-semibold text-slate-600">Chọn phòng ban được tham gia:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {departments.map((dept) => {
                    const isChecked = selectedDepts.includes(dept);
                    const count = employees.filter((e) => e.department === dept).length;
                    return (
                      <label
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{dept} ({count})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scope: CUSTOM Employee Picker */}
            {scopeType === 'CUSTOM' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Đã chọn {selectedEmpIds.length} / {employees.length} người:
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllEmployees}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Chọn hết
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={deselectAllEmployees}
                      className="text-slate-500 hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* Search in employee list */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc phòng ban..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                  {filteredEmployees.map((emp) => {
                    const isChecked = selectedEmpIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-blue-50/80 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span>{emp.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({emp.department})
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Hình thức thanh toán */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>4. Hình thức thanh toán</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => setSponsorType('SELF')}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                  sponsorType === 'SELF'
                    ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700'
                }`}
              >
                <Users2 className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs">Tự lực cánh sinh (Campuchia chia đều) 💸</div>
                  <div className="text-[10px] text-slate-500 font-normal">Mỗi người tự trả phần mình ăn chơi</div>
                </div>
              </div>

              <div
                onClick={() => setSponsorType('SPONSOR')}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                  sponsorType === 'SPONSOR'
                    ? 'border-amber-500 bg-amber-50/70 font-bold text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700'
                }`}
              >
                <Gift className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs">Có đại gia bao trọn gói hôm nay 🎁</div>
                  <div className="text-[10px] text-slate-500 font-normal">Một người chi trả ngập mồm (0đ)</div>
                </div>
              </div>
            </div>

            {sponsorType === 'SPONSOR' && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-bold text-amber-900">
                  Ai là chủ chi uy tín hôm nay? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={employees.some(e => e.name === sponsorName) ? sponsorName : ''}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Chọn thành viên bao --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="Hoặc tự gõ tên người/quỹ bao..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Người nhận hàng & giao nhận */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>5. Nhận nước ở đâu? (Tự động vào tin nhắn Zalo gửi quán) 🛵</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đại diện nhận hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Tên bạn..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  SĐT nhận hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="0901..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Địa điểm nhận hàng cụ thể (Mặc định công ty)
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Cổng sau Công ty Phú Cường Hoàng Gia - 1 Hà Huy Tập, Rạch Giá"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lên kèo nước...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>MỞ KÈO NGAY & LUÔN 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
