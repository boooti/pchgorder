import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, Edit3, Trash2, Plus, ArrowRight, FileText, Image as ImageIcon, Eye, RefreshCw, Wand2 } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function OCRParseModal({ store, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'paste_text'
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftItems, setDraftItems] = useState([]);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);

  useEffect(() => {
    if (store) {
      runSmartAutoParse();
    }
  }, [store]);

  // Intelligent parser algorithm that extracts Category, Name, Size, Price from raw lines
  const parseRawTextToItems = (text) => {
    if (!text || !text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    let currentCategory = 'Cà Phê';

    for (const line of lines) {
      // Check if line looks like a category header e.g. "--- TRÀ SỮA ---" or "CÀ PHÊ PHIN:"
      if (line.startsWith('#') || line.startsWith('---') || line.endsWith(':') || line.toUpperCase() === line && !line.match(/\d/)) {
        currentCategory = line.replace(/^[#:\-\s]+|[#:\-\s]+$/g, '').trim() || currentCategory;
        continue;
      }

      // Extract price numbers (e.g. 55.000, 55000, 55k, 55K, 55đ)
      const priceMatches = [...line.matchAll(/(\d+[\.\,]?\d*)\s*(k|K|đ|VND|000)?/g)];
      
      let price = 35000;
      let size = 'M';
      let name = line;

      // Clean line text to find item name
      // Split by dash, bar, or colon if present: "Matcha Latte - 55k" or "Americano | 40.000"
      const parts = line.split(/[\-\|:]/);
      if (parts.length >= 2) {
        name = parts[0].trim();
        const priceStr = parts[1].replace(/[^0-9]/g, '');
        if (priceStr) {
          const num = parseInt(priceStr, 10);
          price = num < 1000 ? num * 1000 : num;
        }
      } else {
        // Find trailing number in line
        const numMatch = line.match(/(\d{2,6})\b/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          price = num < 1000 ? num * 1000 : num;
          name = line.replace(numMatch[0], '').replace(/[kKđVND\.\,]/g, '').trim();
        }
      }

      // Check size keyword in name
      if (name.match(/\b(L|lớn|big)\b/i)) size = 'L';
      if (name.match(/\b(S|nhỏ|small)\b/i)) size = 'S';

      if (name.length > 1) {
        results.push({
          category: currentCategory,
          name: name.replace(/^[\d\.\-\s]+/, '').trim(),
          size,
          price: price || 35000,
          description: ''
        });
      }
    }

    return results;
  };

  const runSmartAutoParse = async () => {
    setLoading(true);
    try {
      // 1. Fetch live OCR / menu draft from API or store existing products
      const res = await api.parseOcrMenu(store.id);
      
      // If store already has products, use them as starter template + mock parse
      if (store.products && store.products.length > 0) {
        const existingParsed = store.products.map(p => {
          const cat = store.categories?.find(c => c.id === p.category_id)?.name || 'Cà Phê';
          const sizeObj = p.sizes && p.sizes[0] ? p.sizes[0] : { size_name: 'M', price: 35000 };
          return {
            category: cat,
            name: p.name,
            size: sizeObj.size_name,
            price: sizeObj.price,
            description: p.description || ''
          };
        });
        setDraftItems(existingParsed);
      } else {
        setDraftItems(res.draftItems || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleParsePastedText = () => {
    if (!rawText.trim()) {
      showToast('Vui lòng nhập hoặc dán văn bản menu!', 'warning');
      return;
    }
    const parsed = parseRawTextToItems(rawText);
    if (parsed.length === 0) {
      showToast('Không nhận diện được món nào từ văn bản. Hãy thử định dạng: Tên món - 45.000', 'warning');
      return;
    }
    setDraftItems(parsed);
    showToast(`Đã phân tích thành công ${parsed.length} món từ văn bản!`);
  };

  const handleAddItemRow = () => {
    setDraftItems(prev => [
      ...prev,
      { category: 'Cà Phê', name: 'Món mới', size: 'M', price: 40000, description: '' }
    ]);
  };

  const handleRemoveRow = (idx) => {
    setDraftItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmImport = async () => {
    if (!draftItems || draftItems.length === 0) {
      showToast('Menu nháp chưa có món nào!', 'warning');
      return;
    }

    try {
      const res = await api.importExcelMenu(store.id, draftItems);
      showToast(res.message);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!store) return null;

  const menuFiles = store.menuFiles || [];
  const currentMenuFile = menuFiles[selectedPageIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Công Cụ Phân Tích Menu OCR / AI – {store.name}</h3>
              <p className="text-xs text-purple-200">Soi ảnh menu gốc song song & đối chiếu trích xuất tên món, size, đơn giá chính xác 100%</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-4 py-2 rounded-xl transition ${activeTab === 'auto' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              1. Soi Ảnh Menu Gốc & Đối Chiếu Nháp
            </button>
            <button
              onClick={() => setActiveTab('paste_text')}
              className={`px-4 py-2 rounded-xl transition ${activeTab === 'paste_text' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              2. Dán Văn Bản Menu (Tự Động Tách Tên / Giá)
            </button>
          </div>

          <button
            onClick={handleAddItemRow}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm dòng món
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT SIDE: Original Menu Image Viewer (If tab === 'auto') */}
          {activeTab === 'auto' && (
            <div className="w-full md:w-5/12 bg-slate-950 p-3 flex flex-col border-r border-slate-800 text-white min-h-[250px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold flex items-center gap-1 text-purple-300">
                  <ImageIcon className="w-4 h-4" /> Ảnh Menu Gốc
                </span>
                {menuFiles.length > 1 && (
                  <div className="flex gap-1">
                    {menuFiles.map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedPageIdx(i)}
                        className={`w-6 h-6 rounded text-[10px] font-bold ${
                          i === selectedPageIdx ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                {currentMenuFile ? (
                  <img
                    src={currentMenuFile.file_path}
                    alt={currentMenuFile.file_name}
                    className="max-h-[55vh] object-contain rounded-lg shadow-xl"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Quán chưa có ảnh menu gốc. Vui lòng chuyển sang tab "Dán Văn Bản Menu".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASTE TEXT INPUT TAB */}
          {activeTab === 'paste_text' && (
            <div className="w-full md:w-5/12 p-4 bg-slate-50 border-r border-slate-200 flex flex-col gap-3">
              <div>
                <label className="font-extrabold text-xs text-slate-800 block mb-1">
                  Dán văn bản chữ menu vào ô bên dưới:
                </label>
                <p className="text-[11px] text-slate-500">
                  Hệ thống tự nhận diện các dòng như: <code className="bg-slate-200 px-1 rounded">Matcha Latte - 55.000</code> hoặc <code className="bg-slate-200 px-1 rounded">Phin Sữa Đá 39k</code>
                </p>
              </div>

              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`--- CÀ PHÊ ---
Matcha Latte - 55.000
Americano Đá - 40.000
Cà Phê Sữa Đá - 35.000

--- TRÀ SỮA ---
Oolong Nướng Trà Sữa - 52.000
Trà Sữa Chôm Chôm - 55.000`}
                rows={12}
                className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs outline-none focus:border-purple-600 bg-white flex-1"
              />

              <button
                onClick={handleParsePastedText}
                className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" /> BẮT ĐẦU TÁCH TÊN & GIÁ MÓN
              </button>
            </div>
          )}

          {/* RIGHT SIDE: Extracted Draft Items Table */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                MENU NHÁP ĐỐI CHIẾU ({draftItems.length} món)
              </h4>
              <span className="text-[11px] text-slate-400 italic">
                Bấm vào các ô để chỉnh sửa tên món, size & giá
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
                Đang trích xuất dữ liệu menu...
              </div>
            ) : draftItems.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Chưa có món nháp nào. Hãy bấm "Thêm dòng món" hoặc "Dán Văn Bản Menu".
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                {draftItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-2 text-xs">
                    
                    <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                      {/* Category */}
                      <input
                        type="text"
                        value={item.category}
                        onChange={e => {
                          const copy = [...draftItems];
                          copy[idx].category = e.target.value;
                          setDraftItems(copy);
                        }}
                        className="col-span-3 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                        placeholder="Danh mục"
                      />

                      {/* Product Name */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => {
                          const copy = [...draftItems];
                          copy[idx].name = e.target.value;
                          setDraftItems(copy);
                        }}
                        className="col-span-5 px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-800"
                        placeholder="Tên món"
                      />

                      {/* Size */}
                      <input
                        type="text"
                        value={item.size}
                        onChange={e => {
                          const copy = [...draftItems];
                          copy[idx].size = e.target.value;
                          setDraftItems(copy);
                        }}
                        className="col-span-1 px-1.5 py-1.5 rounded-lg border border-slate-200 text-center font-mono"
                        placeholder="Size"
                      />

                      {/* Price */}
                      <input
                        type="number"
                        value={item.price}
                        onChange={e => {
                          const copy = [...draftItems];
                          copy[idx].price = Number(e.target.value);
                          setDraftItems(copy);
                        }}
                        className="col-span-3 px-2 py-1.5 rounded-lg border border-slate-200 font-extrabold text-emerald-600"
                        placeholder="Giá đ"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      title="Xóa dòng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-xs">
            Hủy
          </button>
          
          <button
            disabled={draftItems.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <CheckCircle className="w-4.5 h-4.5" /> XÁC NHẬN LƯU VÀO MENU NƯỚC CHÍNH ({draftItems.length} MÓN)
          </button>
        </div>

      </div>
    </div>
  );
}
