import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Check,
  Eye,
  FileText,
  FileSpreadsheet,
  Scan,
  MapPin,
  Phone,
  Save,
  Coffee,
  X,
  Sparkles,
  AlertCircle,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';
import OriginalMenuModal from '../../components/OriginalMenuModal';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function AdminStoreDetail({ storeId, onBack }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PRODUCTS'); // 'PRODUCTS', 'MENU_FILES', 'EXCEL', 'OCR', 'DELIVERY'

  // Modal controls
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Store Edit Modal State
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [storeEditData, setStoreEditData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    logo: '',
    cover_image: '',
    is_active: 1,
  });
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);

  // Form State for Products
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    image: '',
    description: '',
    is_available: 1,
    allow_sugar: 1,
    allow_ice: 1,
    sizes: [
      { size_name: 'M', price: 45000, is_default: 1 },
      { size_name: 'L', price: 55000, is_default: 0 }
    ]
  });

  // Category & Topping Quick Add
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newToppingName, setNewToppingName] = useState('');
  const [newToppingPrice, setNewToppingPrice] = useState(10000);

  // Delivery Profile State
  const [deliveryProfile, setDeliveryProfile] = useState({
    recipient_name: '',
    recipient_phone: '',
    delivery_address: '',
    desired_delivery_time: '11:15',
    delivery_notes: ''
  });
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Menu Files Upload
  const fileInputRef = useRef(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Excel Import State
  const excelInputRef = useRef(null);
  const [excelPreview, setExcelPreview] = useState(null);
  const [importingExcel, setImportingExcel] = useState(false);

  // OCR Draft State
  const [ocrText, setOcrText] = useState('');
  const [ocrDraftItems, setOcrDraftItems] = useState([]);
  const [analyzingOcr, setAnalyzingOcr] = useState(false);

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  async function loadStoreDetails() {
    try {
      setLoading(true);
      const res = await api.getStore(storeId);
      if (res.success) {
        setStore(res.data);
        if (res.data.delivery_profile) {
          setDeliveryProfile({
            recipient_name: res.data.delivery_profile.recipient_name || '',
            recipient_phone: res.data.delivery_profile.recipient_phone || '',
            delivery_address: res.data.delivery_profile.delivery_address || '',
            desired_delivery_time: res.data.delivery_profile.desired_delivery_time || '11:15',
            delivery_notes: res.data.delivery_profile.delivery_notes || ''
          });
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ==================== PRODUCT ACTIONS ====================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: store?.categories?.[0]?.id || '',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300',
      description: '',
      is_available: 1,
      allow_sugar: 1,
      allow_ice: 1,
      sizes: [
        { size_name: 'M', price: 45000, is_default: 1 },
        { size_name: 'L', price: 55000, is_default: 0 }
      ]
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditStore = () => {
    if (!store) return;
    setStoreEditData({
      name: store.name || '',
      phone: store.phone || '',
      address: store.address || '',
      notes: store.notes || '',
      logo: store.logo || '',
      cover_image: store.cover_image || '',
      is_active: store.is_active !== undefined ? store.is_active : 1,
    });
    setIsEditStoreOpen(true);
  };

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    if (!storeEditData.name.trim()) {
      showToast('Tên quán là bắt buộc', 'error');
      return;
    }
    try {
      setSavingStoreInfo(true);
      const res = await api.updateStore(storeId, storeEditData);
      if (res.success) {
        showToast('Cập nhật thông tin quán thành công', 'success');
        setIsEditStoreOpen(false);
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingStoreInfo(false);
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category_id: prod.category_id || '',
      image: prod.image || '',
      description: prod.description || '',
      is_available: prod.is_available,
      allow_sugar: prod.allow_sugar !== 0 ? 1 : 0,
      allow_ice: prod.allow_ice !== 0 ? 1 : 0,
      sizes: prod.sizes && prod.sizes.length > 0 ? prod.sizes : [{ size_name: 'M', price: 45000, is_default: 1 }]
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('Tên món là bắt buộc', 'error');
      return;
    }

    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, productForm);
        if (res.success) {
          showToast('Cập nhật món thành công', 'success');
        }
      } else {
        const res = await api.createProduct(storeId, productForm);
        if (res.success) {
          showToast('Thêm món mới thành công', 'success');
        }
      }
      setIsProductModalOpen(false);
      loadStoreDetails();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleProductStatus = async (prodId) => {
    try {
      const res = await api.toggleProductAvailability(prodId);
      if (res.success) {
        showToast(res.message, 'success');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${prodName}" không?`)) return;
    try {
      const res = await api.deleteProduct(prodId);
      if (res.success) {
        showToast('Đã xóa món thành công', 'success');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.createCategory(storeId, { name: newCategoryName.trim() });
      if (res.success) {
        showToast('Thêm danh mục thành công', 'success');
        setNewCategoryName('');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Topping
  const handleAddTopping = async (e) => {
    e.preventDefault();
    if (!newToppingName.trim()) return;
    try {
      const res = await api.createTopping(storeId, { name: newToppingName.trim(), price: newToppingPrice });
      if (res.success) {
        showToast('Thêm topping thành công', 'success');
        setNewToppingName('');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==================== MENU FILES UPLOAD & REORDER ====================
  const handleUploadMenuFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadingFiles(true);
      const res = await api.uploadMenuFiles(storeId, formData);
      if (res.success) {
        showToast(res.message, 'success');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMenuFile = async (fileId) => {
    if (!window.confirm('Bạn có chắc muốn xóa trang menu này không?')) return;
    try {
      const res = await api.deleteMenuFile(storeId, fileId);
      if (res.success) {
        showToast('Đã xóa trang menu', 'success');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMoveMenuFile = async (index, direction) => {
    const files = [...(store.menu_files || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    // Swap page order
    const temp = files[index];
    files[index] = files[targetIndex];
    files[targetIndex] = temp;

    const items = files.map((f, i) => ({ id: f.id, page_order: i + 1 }));
    try {
      const res = await api.reorderMenuFiles(storeId, items);
      if (res.success) {
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==================== EXCEL IMPORT FLOW ====================
  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setImportingExcel(true);
      const res = await api.previewExcel(storeId, formData);
      if (res.success) {
        setExcelPreview(res.data);
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setImportingExcel(false);
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleConfirmImportExcel = async () => {
    if (!excelPreview?.items || excelPreview.items.length === 0) return;
    try {
      setImportingExcel(true);
      const res = await api.confirmImportExcel(storeId, excelPreview.items);
      if (res.success) {
        showToast(res.message, 'success');
        setExcelPreview(null);
        loadStoreDetails();
        setActiveTab('PRODUCTS');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setImportingExcel(false);
    }
  };

  // ==================== OCR DRAFT FLOW ====================
  const handleRunOcr = async () => {
    try {
      setAnalyzingOcr(true);
      const res = await api.ocrDraft(storeId, { raw_text: ocrText });
      if (res.success) {
        setOcrDraftItems(res.data.draft_items);
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzingOcr(false);
    }
  };

  const handleConfirmOcrDraft = async () => {
    if (ocrDraftItems.length === 0) return;
    try {
      setAnalyzingOcr(true);
      const res = await api.confirmImportExcel(storeId, ocrDraftItems);
      if (res.success) {
        showToast('Đã xác nhận và đưa menu nháp vào danh sách món chính!', 'success');
        setOcrDraftItems([]);
        loadStoreDetails();
        setActiveTab('PRODUCTS');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzingOcr(false);
    }
  };

  // ==================== DELIVERY PROFILE SAVE ====================
  const handleSaveDeliveryProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingDelivery(true);
      const res = await api.updateDeliveryProfile(storeId, deliveryProfile);
      if (res.success) {
        showToast(res.message, 'success');
        loadStoreDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingDelivery(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải thông tin quán & menu...
      </div>
    );
  }

  if (!store) return <div>Không tìm thấy quán</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-xs transition-colors shrink-0"
            title="Quay lại danh sách quán"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {store.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                store.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {store.is_active === 1 ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {store.address || 'Chưa cập nhật địa chỉ'} • Hotline: {store.phone || 'Chưa cấu hình'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEditStore}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto active:scale-95 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa Thông Tin Quán</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'PRODUCTS'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Sản phẩm ({store.products?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('MENU_FILES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'MENU_FILES'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Menu gốc ({store.menu_files?.length || 0} trang)</span>
        </button>

        <button
          onClick={() => setActiveTab('EXCEL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'EXCEL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Import Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('OCR')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'OCR'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Phân tích Menu (OCR)</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'DELIVERY'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Thông tin giao hàng mặc định</span>
        </button>
      </div>

      {/* TAB 1: SẢN PHẨM SỐ HÓA */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
            {/* Quick Add Category */}
            <form onSubmit={handleAddCategory} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Thêm danh mục mới..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                + Danh mục
              </button>
            </form>

            {/* Quick Add Topping */}
            <form onSubmit={handleAddTopping} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Thêm topping..."
                value={newToppingName}
                onChange={(e) => setNewToppingName(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                type="number"
                placeholder="Giá"
                value={newToppingPrice}
                onChange={(e) => setNewToppingPrice(Number(e.target.value))}
                className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                + Topping
              </button>
            </form>

            <button
              onClick={handleOpenAddProduct}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món Mới</span>
            </button>
          </div>

          {/* Categories and Products List */}
          <div className="space-y-6">
            {store.products?.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                Quán này chưa có món nào. Bạn có thể thêm thủ công, import từ Excel hoặc trích xuất bằng OCR!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {store.products?.map((prod) => {
                  const isAvailable = prod.is_available === 1;
                  return (
                    <div
                      key={prod.id}
                      className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between shadow-soft ${
                        isAvailable ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150'}
                          alt={prod.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                              {prod.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isAvailable ? 'Còn món' : 'HẾT MÓN'}
                            </span>
                          </div>

                          <div className="text-xs text-blue-700 font-bold font-mono mt-1">
                            {prod.sizes?.map((s) => `${s.size_name}: ${formatVND(s.price)}đ`).join(' • ')}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleProductStatus(prod.id)}
                          className={`px-2.5 py-1 rounded-xl font-semibold transition-colors ${
                            isAvailable
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {isAvailable ? 'Đánh dấu Hết món' : 'Đánh dấu Còn món'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Sửa món"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MENU GỐC (UPLOAD & MULTI-PAGE) */}
      {activeTab === 'MENU_FILES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Menu gốc của {store.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhân viên có thể bấm "Xem menu gốc" để phóng to xem trực tiếp các trang menu thực tế
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleUploadMenuFiles}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingFiles ? 'Đang tải lên...' : 'UPLOAD MENU'}</span>
              </button>

              {store.menu_files?.length > 0 && (
                <button
                  onClick={() => setIsViewerOpen(true)}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>XEM NHƯ NHÂN VIÊN</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid of uploaded pages */}
          {store.menu_files?.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Chưa có trang menu nào</p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP, PDF (upload nhiều trang cùng lúc)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.menu_files?.map((file, idx) => (
                <div
                  key={file.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft flex flex-col justify-between"
                >
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                      Trang {file.page_order || idx + 1}
                    </span>
                    <span className="text-slate-400 truncate max-w-[150px]">{file.file_name}</span>
                  </div>

                  <div className="h-56 bg-slate-950 flex items-center justify-center p-2 relative group overflow-hidden">
                    {file.file_type === 'pdf' ? (
                      <div className="text-white text-center">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                        <span className="text-xs font-mono">Tệp PDF</span>
                      </div>
                    ) : (
                      <img
                        src={file.file_path}
                        alt={`Trang ${file.page_order}`}
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    )}
                  </div>

                  {/* Actions (Move, Delete) */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveMenuFile(idx, -1)}
                        disabled={idx === 0}
                        title="Đẩy lên trước"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 disabled:opacity-25"
                      >
                        <MoveUp className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleMoveMenuFile(idx, 1)}
                        disabled={idx === store.menu_files.length - 1}
                        title="Đẩy về sau"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 disabled:opacity-25"
                      >
                        <MoveDown className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteMenuFile(file.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa trang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMPORT MENU EXCEL */}
      {activeTab === 'EXCEL' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Import Menu từ Excel cho {store.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Định dạng cột hỗ trợ: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">Danh mục | Tên món | Size | Giá | Topping | Giá topping | Trạng thái</code>
                </p>
              </div>

              <div>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => excelInputRef.current?.click()}
                  disabled={importingExcel}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{importingExcel ? 'Đang đọc...' : 'CHỌN FILE EXCEL'}</span>
                </button>
              </div>
            </div>

            {/* Preview Table */}
            {excelPreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Bản xem trước: {excelPreview.total_rows} dòng dữ liệu hợp lệ
                  </span>

                  <button
                    onClick={handleConfirmImportExcel}
                    disabled={importingExcel}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>XÁC NHẬN IMPORT VÀO MENU CHÍNH</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Danh mục</th>
                        <th className="p-3">Tên món</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Giá (đ)</th>
                        <th className="p-3">Topping</th>
                        <th className="p-3">Giá topping</th>
                        <th className="p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {excelPreview.items.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-blue-800 font-semibold">{row.category}</td>
                          <td className="p-3 font-bold text-slate-900">{row.name}</td>
                          <td className="p-3 font-mono">{row.size}</td>
                          <td className="p-3 font-mono font-bold">{formatVND(row.price)}đ</td>
                          <td className="p-3 text-slate-500">{row.topping || '—'}</td>
                          <td className="p-3 font-mono">{row.topping_price ? formatVND(row.topping_price) + 'đ' : '—'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PHÂN TÍCH OCR */}
      {activeTab === 'OCR' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scan className="w-5 h-5 text-indigo-600" />
                <span>Phân tích & Nhận diện Menu (OCR / Trí tuệ nhân tạo)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dán văn bản menu hoặc đoạn text trích xuất từ ảnh menu để hệ thống tự động bóc tách Món, Size và Giá tạo thành Menu Nháp.
              </p>
            </div>

            <textarea
              rows={4}
              placeholder="VD:&#10;Matcha Latte - M: 55.000đ - L: 65.000đ&#10;Americano Đá - M: 45.000đ&#10;Trà Sen Vàng Hạt Sen - M: 55.000đ - L: 65.000đ"
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="flex justify-end">
              <button
                onClick={handleRunOcr}
                disabled={analyzingOcr}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzingOcr ? 'Đang phân tích...' : 'PHÂN TÍCH RA MENU NHÁP'}</span>
              </button>
            </div>

            {/* Draft Table */}
            {ocrDraftItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Menu Nháp (Admin có thể sửa trước khi xác nhận)
                  </h4>
                  <button
                    onClick={handleConfirmOcrDraft}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>XÁC NHẬN IMPORT MENU</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Tên món</th>
                        <th className="p-3">Danh mục</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Giá (đ)</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {ocrDraftItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const copy = [...ocrDraftItems];
                                copy[idx].name = e.target.value;
                                setOcrDraftItems(copy);
                              }}
                              className="w-full bg-transparent border-b border-dashed border-slate-300 font-bold text-slate-900 focus:outline-none"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => {
                                const copy = [...ocrDraftItems];
                                copy[idx].category = e.target.value;
                                setOcrDraftItems(copy);
                              }}
                              className="w-full bg-transparent border-b border-dashed border-slate-300 text-blue-800 focus:outline-none"
                            />
                          </td>
                          <td className="p-3 font-mono">
                            <input
                              type="text"
                              value={item.size}
                              onChange={(e) => {
                                const copy = [...ocrDraftItems];
                                copy[idx].size = e.target.value.toUpperCase();
                                setOcrDraftItems(copy);
                              }}
                              className="w-12 bg-transparent border-b border-dashed border-slate-300 font-bold focus:outline-none"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const copy = [...ocrDraftItems];
                                copy[idx].price = Number(e.target.value);
                                setOcrDraftItems(copy);
                              }}
                              className="w-24 bg-transparent border-b border-dashed border-slate-300 font-bold text-blue-900 focus:outline-none"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setOcrDraftItems(ocrDraftItems.filter((_, i) => i !== idx))}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: THÔNG TIN GIAO HÀNG MẶC ĐỊNH */}
      {activeTab === 'DELIVERY' && (
        <form onSubmit={handleSaveDeliveryProfile} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Thông tin giao hàng mặc định của {store.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khi chọn quán này cho phiên hôm nay, các trường này sẽ tự động được điền sẵn.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingDelivery}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{savingDelivery ? 'Đang lưu...' : 'LƯU LÀM THÔNG TIN MẶC ĐỊNH'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Người nhận hàng mặc định</label>
              <input
                type="text"
                value={deliveryProfile.recipient_name}
                onChange={(e) => setDeliveryProfile({ ...deliveryProfile, recipient_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Số điện thoại nhận hàng</label>
              <input
                type="text"
                value={deliveryProfile.recipient_phone}
                onChange={(e) => setDeliveryProfile({ ...deliveryProfile, recipient_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">Địa chỉ giao hàng</label>
              <input
                type="text"
                value={deliveryProfile.delivery_address}
                onChange={(e) => setDeliveryProfile({ ...deliveryProfile, delivery_address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Giờ giao mong muốn</label>
              <input
                type="time"
                value={deliveryProfile.desired_delivery_time}
                onChange={(e) => setDeliveryProfile({ ...deliveryProfile, desired_delivery_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Ghi chú giao hàng</label>
              <input
                type="text"
                value={deliveryProfile.delivery_notes}
                onChange={(e) => setDeliveryProfile({ ...deliveryProfile, delivery_notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </form>
      )}

      {/* Modal: Thêm / Sửa Món */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Sửa món' : 'Thêm món mới'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  placeholder="VD: Matcha Latte"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Danh mục</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Chọn danh mục...</option>
                    {store.categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Trạng thái</label>
                  <select
                    value={productForm.is_available}
                    onChange={(e) => setProductForm({ ...productForm, is_available: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={1}>Còn món</option>
                    <option value={0}>Hết món</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">URL Hình ảnh</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mô tả món</label>
                <input
                  type="text"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Vị trà thơm, đậm béo..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Sizes and Prices */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Các Size và Giá (đ)</label>
                  <button
                    type="button"
                    onClick={() => setProductForm({
                      ...productForm,
                      sizes: [...productForm.sizes, { size_name: 'L', price: 55000, is_default: 0 }]
                    })}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    + Thêm Size
                  </button>
                </div>

                <div className="space-y-2">
                  {productForm.sizes.map((sz, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Size (S, M, L...)"
                        value={sz.size_name}
                        onChange={(e) => {
                          const copy = [...productForm.sizes];
                          copy[sIdx].size_name = e.target.value.toUpperCase();
                          setProductForm({ ...productForm, sizes: copy });
                        }}
                        className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                      />
                      <input
                        type="number"
                        placeholder="Giá"
                        value={sz.price}
                        onChange={(e) => {
                          const copy = [...productForm.sizes];
                          copy[sIdx].price = Number(e.target.value);
                          setProductForm({ ...productForm, sizes: copy });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                      />
                      {productForm.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setProductForm({
                            ...productForm,
                            sizes: productForm.sizes.filter((_, i) => i !== sIdx)
                          })}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow"
                >
                  Lưu món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {isEditStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Sửa thông tin quán</h3>
              </div>
              <button
                onClick={() => setIsEditStoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreInfo} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên quán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tên quán..."
                  value={storeEditData.name}
                  onChange={(e) => setStoreEditData({ ...storeEditData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Số điện thoại hotline</label>
                  <input
                    type="text"
                    placeholder="09..."
                    value={storeEditData.phone}
                    onChange={(e) => setStoreEditData({ ...storeEditData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Trạng thái</label>
                  <select
                    value={storeEditData.is_active}
                    onChange={(e) => setStoreEditData({ ...storeEditData, is_active: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Địa chỉ quán</label>
                <input
                  type="text"
                  placeholder="Địa chỉ số nhà, đường, thành phố..."
                  value={storeEditData.address}
                  onChange={(e) => setStoreEditData({ ...storeEditData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">URL Logo quán</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={storeEditData.logo}
                    onChange={(e) => setStoreEditData({ ...storeEditData, logo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">URL Ảnh bìa</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={storeEditData.cover_image}
                    onChange={(e) => setStoreEditData({ ...storeEditData, cover_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ghi chú về quán</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  value={storeEditData.notes}
                  onChange={(e) => setStoreEditData({ ...storeEditData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStoreOpen(false)}
                  className="py-2.5 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingStoreInfo}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingStoreInfo ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      <OriginalMenuModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        menuFiles={store.menu_files || []}
        storeName={store.name}
      />
    </div>
  );
}
