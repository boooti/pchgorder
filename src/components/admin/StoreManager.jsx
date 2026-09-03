import React, { useState, useEffect, useRef } from 'react';
import { Store, Plus, Upload, FileText, Image as ImageIcon, MapPin, Phone, Trash2, Edit, Edit3, Save, CheckCircle, Sparkles, FileSpreadsheet, Camera, X } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function StoreManager({ onOpenDigitizedMenu, onOpenOCR, onOpenExcelImport }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoreId, setActiveStoreId] = useState(null);

  // New store modal/form state
  const [isCreating, setIsCreating] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', logo: '', cover_image: '', address: '', phone: '', note: '' });

  // Edit store modal state
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // Menu image upload states
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const editLogoInputRef = useRef(null);
  const modalLogoInputRef = useRef(null);

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Delivery editing
  const [editingDelivery, setEditingDelivery] = useState(null);

  const fetchStores = () => {
    setLoading(true);
    api.getStores()
      .then(data => {
        setStores(data);
        if (data.length > 0 && !activeStoreId) {
          setActiveStoreId(data[0].id);
        }
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Handle Logo file select when creating new store
  const handleNewStoreLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewStore(prev => ({ ...prev, logo: evt.target.result }));
      showToast('Đã chọn file ảnh Logo!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo file select when editing store in modal
  const handleModalStoreLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setEditingStore(prev => ({ ...prev, logo: evt.target.result }));
      showToast('Đã chọn file ảnh Logo mới!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo file select when updating existing store directly
  const handleUpdateStoreLogoFile = async (storeId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      try {
        const store = stores.find(s => s.id === storeId);
        if (store) {
          await api.updateStore(storeId, { ...store, logo: dataUrl });
          showToast('Đã cập nhật Logo quán bằng file ảnh mới!');
          fetchStores();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStore.name) {
      showToast('Vui lòng nhập tên quán!', 'warning');
      return;
    }

    try {
      const created = await api.createStore(newStore);
      showToast(`Đã thêm quán "${created.name}" thành công!`);
      setIsCreating(false);
      setNewStore({ name: '', logo: '', cover_image: '', address: '', phone: '', note: '' });
      fetchStores();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveStoreEdit = async (e) => {
    e.preventDefault();
    if (!editingStore || !editingStore.name) {
      showToast('Vui lòng nhập tên quán!', 'warning');
      return;
    }

    try {
      await api.updateStore(editingStore.id, editingStore);
      showToast(`Đã cập nhật thông tin quán "${editingStore.name}"!`);
      setIsEditingStore(false);
      setEditingStore(null);
      fetchStores();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (confirm(`Bạn có chắc muốn xóa quán "${storeName}"?`)) {
      try {
        await api.deleteStore(storeId);
        showToast(`Đã xóa quán "${storeName}"!`);
        setActiveStoreId(null);
        fetchStores();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Direct native File Picker upload for Menu Pages
  const handleDirectFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeStoreId) return;

    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (evt) => {
            try {
              const dataUrl = evt.target.result;
              await api.addMenuFileUrl(activeStoreId, dataUrl, file.name || `Trang menu ${i + 1}`);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      showToast(`Đã tải lên thành công ${files.length} trang menu mới!`);
      fetchStores();
    } catch (err) {
      showToast('Lỗi khi tải ảnh menu: ' + err.message, 'error');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMenuFile = async (fileId) => {
    if (confirm('Bạn có chắc muốn xóa trang menu này?')) {
      try {
        await api.deleteMenuFile(fileId);
        showToast('Đã xóa trang menu!');
        fetchStores();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSaveDelivery = async (storeId) => {
    if (!editingDelivery) return;
    try {
      await api.updateDefaultDelivery(storeId, editingDelivery);
      showToast('Đã lưu thông tin giao hàng mặc định!');
      fetchStores();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeStore = stores.find(s => s.id === activeStoreId);

  return (
    <div className="space-y-6 my-6">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Quản lý Quán & Menu</h2>
          <p className="text-xs text-slate-500">Thêm quán mới, sửa tên quán, SĐT, địa chỉ, chọn file ảnh Logo & Menu gốc trực tiếp từ máy tính.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
        >
          <Plus className="w-4 h-4" /> THÊM QUÁN MỚI
        </button>
      </div>

      {/* Stores Horizontal Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {stores.map(st => {
          const isActive = st.id === activeStoreId;
          return (
            <button
              key={st.id}
              onClick={() => {
                setActiveStoreId(st.id);
                setEditingDelivery(st.delivery);
              }}
              className={`flex-shrink-0 flex items-center gap-3 p-3 px-4 rounded-2xl border transition text-left ${
                isActive
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100'
              }`}
            >
              <img
                src={st.logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=100&q=80'}
                alt={st.name}
                className="w-8 h-8 rounded-xl object-cover border border-white/20"
              />
              <div>
                <h4 className="text-xs font-bold leading-tight">{st.name}</h4>
                <p className={`text-[10px] ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                  {st.productCount} món · {st.menuFiles?.length || 0} trang menu
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Store Workspace */}
      {activeStore && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          
          {/* Store Info Banner & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={activeStore.logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80'}
                  alt={activeStore.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-md"
                />
                
                {/* Direct Logo Change Button */}
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpdateStoreLogoFile(activeStore.id, e)}
                  className="hidden"
                />
                <button
                  onClick={() => editLogoInputRef.current && editLogoInputRef.current.click()}
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                  title="Đổi Logo quán bằng file ảnh"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-900">{activeStore.name}</h3>
                  
                  {/* EDIT STORE INFO BUTTON */}
                  <button
                    onClick={() => {
                      setEditingStore({ ...activeStore });
                      setIsEditingStore(true);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition border border-slate-200"
                    title="Sửa thông tin tên quán, SĐT, địa chỉ"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-600" /> Sửa thông tin quán
                  </button>

                  <button
                    onClick={() => handleDeleteStore(activeStore.id, activeStore.name)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Xóa quán này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-600" /> {activeStore.address || 'Chưa cập nhật địa chỉ'}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-600" /> {activeStore.phone || 'Chưa có SĐT'}</span>
                </div>
                {activeStore.note && (
                  <p className="text-[11px] text-amber-700 mt-0.5 italic">"{activeStore.note}"</p>
                )}
              </div>
            </div>

            {/* Quick digitize buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenDigitizedMenu(activeStore)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Sản Phẩm & Menu Số Hóa
              </button>
              <button
                onClick={() => onOpenOCR(activeStore)}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> Phân Tích OCR
              </button>
              <button
                onClick={() => onOpenExcelImport(activeStore)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Import Excel
              </button>
            </div>
          </div>

          {/* Section 1: Uploaded Menu Original Files (Direct File Upload) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h4 className="font-extrabold text-base text-slate-800">Menu Gốc (File Ảnh / PDF)</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {activeStore.menuFiles?.length || 0} trang
                </span>
              </div>
            </div>

            {/* DIRECT FILE UPLOAD BUTTON */}
            <div className="border-2 border-dashed border-brand-200 hover:border-brand-500 bg-brand-50/40 rounded-3xl p-6 text-center transition relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleDirectFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <Upload className="w-10 h-10 text-brand-600 mx-auto mb-2 animate-bounce" />
              <h5 className="font-black text-slate-800 text-sm">
                {uploadingFiles ? 'Đang nạp file ảnh menu...' : 'Bấm vào đây để chọn FILE HÌNH / PDF menu từ máy tính'}
              </h5>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ chọn nhiều hình cùng lúc (PNG, JPG, JPEG, PDF) · Không cần dán link URL
              </p>
            </div>

            {/* Menu file list preview grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeStore.menuFiles && activeStore.menuFiles.map((file, idx) => (
                <div key={file.id} className="relative group bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 aspect-[3/4]">
                  <img src={file.file_path} alt={file.file_name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-3 text-white">
                    <span className="text-xs font-bold truncate">{file.file_name || `Trang ${idx + 1}`}</span>
                    <button
                      onClick={() => handleDeleteMenuFile(file.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition self-end"
                      title="Xóa trang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Default Delivery Profile Editor */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-base text-slate-800">Thông tin giao hàng mặc định</h4>
              <button
                onClick={() => handleSaveDelivery(activeStore.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> LƯU LÀM THÔNG TIN MẶC ĐỊNH
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Người nhận hàng mặc định</label>
                <input
                  type="text"
                  value={editingDelivery?.recipient_name || activeStore.delivery?.recipient_name || ''}
                  onChange={e => setEditingDelivery({ ...(editingDelivery || activeStore.delivery), recipient_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ví dụ: Nguyễn Tam Giác (Lễ Tân)"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Số điện thoại người nhận</label>
                <input
                  type="text"
                  value={editingDelivery?.recipient_phone || activeStore.delivery?.recipient_phone || ''}
                  onChange={e => setEditingDelivery({ ...(editingDelivery || activeStore.delivery), recipient_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ví dụ: 0901 234 567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={editingDelivery?.delivery_address || activeStore.delivery?.delivery_address || ''}
                  onChange={e => setEditingDelivery({ ...(editingDelivery || activeStore.delivery), delivery_address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ví dụ: Tầng 5, Tòa nhà ABC, 45 Nguyễn Huệ, Quận 1"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Giờ giao mong muốn</label>
                <input
                  type="text"
                  value={editingDelivery?.delivery_time || activeStore.delivery?.delivery_time || ''}
                  onChange={e => setEditingDelivery({ ...(editingDelivery || activeStore.delivery), delivery_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ví dụ: 10:30"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Ghi chú giao hàng</label>
                <input
                  type="text"
                  value={editingDelivery?.delivery_note || activeStore.delivery?.delivery_note || ''}
                  onChange={e => setEditingDelivery({ ...(editingDelivery || activeStore.delivery), delivery_note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ví dụ: Gọi điện trước khi tới cổng"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* EDIT STORE INFO MODAL */}
      {isEditingStore && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" /> Sửa Thông Tin Quán
              </h3>
              <button onClick={() => setIsEditingStore(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveStoreEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên quán <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: HOGI COFFEE & TEA"
                  value={editingStore.name}
                  onChange={e => setEditingStore({ ...editingStore, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-bold text-slate-900 text-sm"
                />
              </div>

              {/* Direct File Upload for Logo when editing */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ảnh Logo Quán</label>
                <div className="flex items-center gap-3">
                  {editingStore.logo ? (
                    <img src={editingStore.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <input
                    ref={modalLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModalStoreLogoFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => modalLogoInputRef.current && modalLogoInputRef.current.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1 transition"
                  >
                    <Upload className="w-3.5 h-3.5" /> Chọn file ảnh logo mới
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ quán</label>
                <input
                  type="text"
                  placeholder="Ví dụ: L4-C27 Phan Thị Ràng, P. Rạch Giá"
                  value={editingStore.address || ''}
                  onChange={e => setEditingStore({ ...editingStore, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại quán</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0969.487.712"
                  value={editingStore.phone || ''}
                  onChange={e => setEditingStore({ ...editingStore, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú quán</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Menu Tết 2026. Đơn vị tính: 1.000đ"
                  value={editingStore.note || ''}
                  onChange={e => setEditingStore({ ...editingStore, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingStore(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl shadow-md"
                >
                  LƯU THÔNG TIN QUÁN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Store Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <h3 className="font-extrabold text-lg text-slate-900">Tạo Quán Mới</h3>
            
            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên quán <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phê La, The Coffee House..."
                  value={newStore.name}
                  onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              {/* Direct File Upload for Logo when creating */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ảnh Logo Quán</label>
                <div className="flex items-center gap-3">
                  {newStore.logo ? (
                    <img src={newStore.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleNewStoreLogoFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => logoInputRef.current && logoInputRef.current.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1 transition"
                  >
                    <Upload className="w-3.5 h-3.5" /> Chọn file ảnh logo
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ quán</label>
                <input
                  type="text"
                  placeholder="Địa chỉ quán..."
                  value={newStore.address}
                  onChange={e => setNewStore({ ...newStore, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại quán</label>
                <input
                  type="text"
                  placeholder="SĐT..."
                  value={newStore.phone}
                  onChange={e => setNewStore({ ...newStore, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  TẠO QUÁN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
