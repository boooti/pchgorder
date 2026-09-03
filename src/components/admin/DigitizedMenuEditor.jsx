import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Ban, CheckCircle, Save, X, Coffee, Settings, Tag } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function DigitizedMenuEditor({ store, onClose }) {
  const [data, setData] = useState({ categories: [], products: [], toppings: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // New product modal state
  const [isEditingProd, setIsEditingProd] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  // Category Edit / Add modal state
  const [isManagingCat, setIsManagingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null); // { id, name }

  // Topping state
  const [newTopName, setNewTopName] = useState('');
  const [newTopPrice, setNewTopPrice] = useState(10000);

  const fetchMenu = () => {
    if (!store) return;
    setLoading(true);
    api.getProductsByStore(store.id)
      .then(res => setData(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenu();
  }, [store]);

  if (!store) return null;

  const handleToggleAvailable = async (prodId) => {
    try {
      const res = await api.toggleProductAvailable(prodId);
      showToast(res.is_available ? 'Đã đánh dấu CÒN MÓN' : 'Đã đánh dấu HẾT MÓN');
      fetchMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (confirm('Bạn có chắc muốn xóa món này?')) {
      try {
        await api.deleteProduct(prodId);
        showToast('Đã xóa món!');
        fetchMenu();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory(store.id, newCatName.trim());
      showToast(`Đã thêm danh mục "${newCatName.trim()}"`);
      setNewCatName('');
      fetchMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name.trim()) return;
    try {
      await api.updateCategory(editingCat.id, editingCat.name.trim());
      showToast(`Đã cập nhật danh mục thành "${editingCat.name.trim()}"`);
      setEditingCat(null);
      fetchMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này? Các món thuộc danh mục này sẽ chuyển sang Chưa phân loại.')) {
      try {
        await api.deleteCategory(catId);
        showToast('Đã xóa danh mục!');
        if (activeCategory === catId) setActiveCategory('ALL');
        fetchMenu();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddTopping = async (e) => {
    e.preventDefault();
    if (!newTopName.trim()) return;
    try {
      await api.createTopping(store.id, newTopName.trim(), newTopPrice);
      showToast(`Đã thêm topping "${newTopName.trim()}"`);
      setNewTopName('');
      fetchMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProd.name) {
      showToast('Vui lòng nhập tên món!', 'warning');
      return;
    }

    try {
      if (editingProd.id) {
        await api.updateProduct(editingProd.id, editingProd);
        showToast('Đã cập nhật món thành công!');
      } else {
        await api.createProduct({ ...editingProd, store_id: store.id });
        showToast('Đã thêm món mới!');
      }
      setIsEditingProd(false);
      setEditingProd(null);
      fetchMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openNewProdModal = () => {
    setEditingProd({
      name: '',
      category_id: data.categories[0]?.id || null,
      description: '',
      image: '',
      is_available: 1,
      sizes: [
        { size_name: 'M', price: 45000 },
        { size_name: 'L', price: 55000 }
      ]
    });
    setIsEditingProd(true);
  };

  const filteredProducts = activeCategory === 'ALL'
    ? data.products
    : data.products.filter(p => p.category_id === Number(activeCategory));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg">Số Hóa Menu – {store.name}</h3>
            <p className="text-xs text-slate-400">Thêm, sửa, xóa món, sửa tên Danh Mục & Topping</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManagingCat(!isManagingCat)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 transition shadow-md"
            >
              <Tag className="w-4 h-4" /> QUẢN LÝ DANH MỤC ({data.categories.length})
            </button>

            <button
              onClick={openNewProdModal}
              className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 transition shadow-md"
            >
              <Plus className="w-4 h-4" /> THÊM MÓN MỚI
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Management Drawer Panel */}
        {isManagingCat && (
          <div className="bg-purple-50 p-4 border-b border-purple-100 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-purple-900 text-sm flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-600" /> Sửa & Quản Lý Danh Mục
              </h4>
              <button onClick={() => setIsManagingCat(false)} className="text-purple-600 font-bold hover:underline">
                Đóng
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {data.categories.map(c => {
                const isEditingThis = editingCat && editingCat.id === c.id;
                return (
                  <div key={c.id} className="p-2 bg-white rounded-xl border border-purple-200 flex items-center justify-between shadow-sm">
                    {isEditingThis ? (
                      <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-1 items-center">
                        <input
                          type="text"
                          value={editingCat.name}
                          onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                          className="flex-1 px-2 py-1 border border-purple-400 rounded-lg outline-none font-bold"
                          autoFocus
                        />
                        <button type="submit" className="px-2 py-1 bg-purple-600 text-white font-bold rounded-lg">
                          Lưu
                        </button>
                        <button type="button" onClick={() => setEditingCat(null)} className="text-slate-400 px-1">
                          ✕
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-slate-800 truncate">{c.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCat(c)}
                            className="p-1 text-slate-500 hover:text-purple-600 rounded-md"
                            title="Sửa tên danh mục"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Add Category */}
            <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-purple-200">
              <input
                type="text"
                placeholder="Nhập tên danh mục mới..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-purple-300 outline-none focus:border-purple-600 bg-white"
              />
              <button type="submit" className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-sm">
                + Thêm Danh Mục
              </button>
            </form>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({data.products.length})
              </button>
              {data.categories.map(c => (
                <div key={c.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      activeCategory === c.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCat(c);
                      setIsManagingCat(true);
                    }}
                    className="text-slate-400 hover:text-purple-600 p-1"
                    title="Sửa danh mục này"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Đang tải sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Chưa có món nào trong danh mục này</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map(prod => {
                const isAvail = prod.is_available === 1;
                const catObj = data.categories.find(c => c.id === prod.category_id);
                return (
                  <div
                    key={prod.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                      isAvail ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {catObj ? catObj.name : 'Chưa phân loại'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleAvailable(prod.id)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition ${
                            isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isAvail ? 'CÒN MÓN' : 'HẾT MÓN'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{prod.description || 'Chưa có mô tả'}</p>
                      
                      {/* Sizes */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {prod.sizes && prod.sizes.map((s, idx) => (
                          <span key={idx} className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {s.size_name}: {new Intl.NumberFormat('vi-VN').format(s.price)}đ
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProd(prod);
                          setIsEditingProd(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toppings Manager */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-800">Quản lý Topping của Quán</h4>
            <div className="flex flex-wrap gap-2">
              {data.toppings.map(t => (
                <span key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-medium border border-slate-200">
                  {t.topping_name} (+{new Intl.NumberFormat('vi-VN').format(t.price)}đ)
                  <button onClick={async () => {
                    await api.deleteTopping(t.id);
                    fetchMenu();
                  }} className="text-slate-400 hover:text-red-600 ml-1">×</button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddTopping} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Tên topping mới..."
                value={newTopName}
                onChange={e => setNewTopName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
              />
              <input
                type="number"
                placeholder="Giá (VD: 10000)"
                value={newTopPrice}
                onChange={e => setNewTopPrice(e.target.value)}
                className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
              />
              <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl">
                + Thêm Topping
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Edit / Create Product Modal */}
      {isEditingProd && editingProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <h3 className="font-extrabold text-lg text-slate-900">
              {editingProd.id ? 'Sửa Món' : 'Thêm Món Mới'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên món <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingProd.name}
                  onChange={e => setEditingProd({ ...editingProd, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Danh mục món</label>
                <select
                  value={editingProd.category_id || ''}
                  onChange={e => setEditingProd({ ...editingProd, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-bold"
                >
                  {data.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả món</label>
                <input
                  type="text"
                  value={editingProd.description || ''}
                  onChange={e => setEditingProd({ ...editingProd, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Ảnh món</label>
                <input
                  type="text"
                  value={editingProd.image || ''}
                  onChange={e => setEditingProd({ ...editingProd, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              {/* Sizes and prices */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Các Size & Giá</label>
                <div className="space-y-2">
                  {editingProd.sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Size (VD: M)"
                        value={s.size_name}
                        onChange={e => {
                          const copy = [...editingProd.sizes];
                          copy[idx].size_name = e.target.value;
                          setEditingProd({ ...editingProd, sizes: copy });
                        }}
                        className="w-24 px-3 py-1.5 rounded-xl border border-slate-200"
                      />
                      <input
                        type="number"
                        placeholder="Giá"
                        value={s.price}
                        onChange={e => {
                          const copy = [...editingProd.sizes];
                          copy[idx].price = Number(e.target.value);
                          setEditingProd({ ...editingProd, sizes: copy });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = editingProd.sizes.filter((_, i) => i !== idx);
                          setEditingProd({ ...editingProd, sizes: copy });
                        }}
                        className="text-red-500 p-1 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProd({ ...editingProd, sizes: [...editingProd.sizes, { size_name: 'L', price: 50000 }] });
                    }}
                    className="text-brand-600 font-bold text-xs"
                  >
                    + Thêm Size
                  </button>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingProd(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  LƯU MÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
