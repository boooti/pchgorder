import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Check, Sparkles, X } from 'lucide-react';
import { api } from '../../api';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

export default function UserPickerModal({ isOpen, onClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getEmployees()
        .then(data => {
          setEmployees(data.filter(e => e.is_active));
        })
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (emp) => {
    setCurrentUser(emp);
    showToast(`Xin chào ${emp.name}!`);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-slide-up"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative border-b border-navy-800">
          
          {/* TOP RIGHT CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition whitespace-nowrap"
            title="Thoát không chọn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 whitespace-nowrap">Xác nhận danh tính / Order Giùm</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight whitespace-nowrap">Bạn là ai?</h2>
          <p className="text-xs text-navy-200 mt-1">Chọn đúng tên của bạn để đặt nước hoặc order giùm đồng nghiệp.</p>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên nhân viên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-navy-950 placeholder-slate-400 text-sm rounded-xl outline-none focus:ring-2 focus:ring-amber-400 shadow-inner font-bold"
              autoFocus
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse font-medium">
              Đang tải danh sách nhân viên...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              Không tìm thấy nhân viên nào phù hợp
            </div>
          ) : (
            filtered.map(emp => {
              const isSelected = currentUser && currentUser.id === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 shadow-md font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-navy-950'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-navy-950'
                        : 'bg-navy-100 text-navy-900'
                    }`}>
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{emp.name}</span>
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                          isSelected ? 'bg-navy-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {emp.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-navy-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 font-black" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* BOTTOM CANCEL / EXIT BUTTON */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Thoát (Không thay đổi)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
