import React, { useState } from 'react';
import { FileSpreadsheet, X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function ExcelImportModal({ store, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!store) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewRows(data);
      } catch (err) {
        showToast('Lỗi đọc file Excel! Vui lòng kiểm tra định dạng.', 'error');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;

    setLoading(true);
    try {
      const res = await api.importExcelMenu(store.id, previewRows);
      showToast(res.message);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Import Menu Excel – {store.name}</h3>
              <p className="text-xs text-emerald-200">Cấu trúc: Danh mục | Tên món | Size | Giá | Topping | Giá topping</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 relative">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Nhấp vào đây hoặc kéo thả file Excel menu'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Hỗ trợ file .xlsx, .xls hoặc .csv</p>
          </div>

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                Xem Trước Dữ Liệu ({previewRows.length} dòng)
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-500 font-extrabold sticky top-0">
                    <tr>
                      <th className="p-2">Danh mục</th>
                      <th className="p-2">Tên món</th>
                      <th className="p-2">Size</th>
                      <th className="p-2">Giá</th>
                      <th className="p-2">Topping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2">{r['Danh mục'] || r['Category'] || 'Khác'}</td>
                        <td className="p-2 font-bold text-slate-800">{r['Tên món'] || r['Món'] || r['name']}</td>
                        <td className="p-2">{r['Size'] || 'M'}</td>
                        <td className="p-2 font-extrabold text-emerald-600">{r['Giá'] || r['price']}đ</td>
                        <td className="p-2">{r['Topping'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 text-xs font-bold">Hủy</button>
          <button
            disabled={previewRows.length === 0 || loading}
            onClick={handleConfirmImport}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> XÁC NHẬN IMPORT EXCEL
          </button>
        </div>

      </div>
    </div>
  );
}
