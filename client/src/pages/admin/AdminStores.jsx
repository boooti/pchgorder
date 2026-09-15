import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Edit3, Trash2, BookOpen, ExternalLink, MapPin, Phone, Check, X } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

export default function AdminStores({ onSelectStore }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    cover_image: '',
    address: '',
    phone: '',
    notes: '',
    is_active: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      setLoading(true);
      const res = await api.getStores();
      if (res.success) {
        setStores(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Tên quán là bắt buộc!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createStore(formData);
      if (res.success) {
        showToast('Tạo quán mới thành công!', 'success');
        setIsCreateOpen(false);
        setFormData({
          name: '',
          logo: '',
          cover_image: '',
          address: '',
          phone: '',
          notes: '',
          is_active: 1,
        });
        loadStores();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa quán "${storeName}" và toàn bộ menu của quán không?`)) return;

    try {
      const res = await api.deleteStore(storeId);
      if (res.success) {
        showToast('Đã xóa quán thành công', 'success');
        loadStores();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredStores = stores.filter((s) => {
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.address && s.address.toLowerCase().includes(term));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý quán & Menu riêng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi quán có menu độc lập tuyệt đối do Admin tạo và tải lên
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm quán..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Quán Mới</span>
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải danh sách quán...
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Store className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-slate-700">Chưa có quán nào phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div>
                {/* Store Header / Banner */}
                <div className="relative h-28 bg-slate-900 overflow-hidden">
                  <img
                    src={st.cover_image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600'}
                    alt={st.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                        st.is_active === 1
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {st.is_active === 1 ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 relative pt-0">
                  <div className="-mt-9 mb-3 flex items-end justify-between">
                    <img
                      src={st.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'}
                      alt={st.name}
                      className="w-16 h-16 rounded-2xl object-contain p-1 border-2 border-white shadow-md bg-white shrink-0"
                    />
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl">
                        {st.product_count || 0} món
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                    {st.name}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{st.address || 'Chưa cập nhật địa chỉ'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{st.phone || 'Chưa có SĐT'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDeleteStore(st.id, st.name)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200/50 transition-colors"
                  title="Xóa quán"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectStore(st.id)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Quản lý Menu & Quán</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Thêm Quán Mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Thêm quán mới</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên quán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Katinat, Highlands Coffee, Phúc Long..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">URL Logo quán</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">URL Ảnh bìa</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Địa chỉ quán</label>
                <input
                  type="text"
                  placeholder="VD: 91 Đồng Khởi, Q.1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="028 7300 1005"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Trạng thái</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ghi chú về quán</label>
                <textarea
                  rows={2}
                  placeholder="VD: Quán làm nước nhanh, đông lúc 11h30..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  {submitting ? 'Đang tạo...' : 'Lưu Quán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
