import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CheckCircle2, Crown, Sparkles, X, UserCheck, HeartHandshake, Zap } from 'lucide-react';
import { api } from '../../api';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

export default function GroupOrderModal({ isOpen, onClose, sessionId, storeId, onOrderSubmitted }) {
  const { currentUser } = useUser();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  
  // Sponsorship mode for small group
  const [sponsorType, setSponsorType] = useState('SPONSOR_100'); // 'SPONSOR_100', 'SHARE', 'PARTIAL'
  const [sponsorName, setSponsorName] = useState(currentUser?.name || 'Sếp / Bạn');
  const [partialAmount, setPartialAmount] = useState(15000);
  const [groupNote, setGroupNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getEmployees()
        .then(emps => {
          const active = emps.filter(e => e.is_active);
          setEmployees(active);
          if (currentUser) {
            setSelectedEmpIds([currentUser.id]);
            setSponsorName(currentUser.name);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const toggleSelectEmp = (id) => {
    setSelectedEmpIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      return [...prev, id];
    });
  };

  const selectedEmployees = employees.filter(e => selectedEmpIds.includes(e.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 font-black flex items-center justify-center shadow-md flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block whitespace-nowrap">
                Tạo nhóm order nhỏ
              </span>
              <h3 className="text-lg font-black text-white whitespace-nowrap">ORDER CHO NHÓM NHỎ</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition whitespace-nowrap">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-navy-950">
          
          {/* Step 1: Pick Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap">
                1. Chọn Thành Viên Nhóm ({selectedEmployees.length} người)
              </label>
              <button
                type="button"
                onClick={() => setSelectedEmpIds(employees.map(e => e.id))}
                className="text-[11px] font-bold text-navy-800 hover:text-navy-950 underline whitespace-nowrap"
              >
                Chọn tất cả
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {employees.map(emp => {
                const isSelected = selectedEmpIds.includes(emp.id);
                return (
                  <button
                    type="button"
                    key={emp.id}
                    onClick={() => toggleSelectEmp(emp.id)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-navy-900 text-white border-navy-900 font-bold shadow-xs'
                        : 'bg-white text-navy-800 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{emp.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Sponsor / Share Mode Options */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap">
              2. Hình Thức Thanh Toán / Ai Bao Nhóm?
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSponsorType('SPONSOR_100')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                  sponsorType === 'SPONSOR_100'
                    ? 'bg-amber-500 text-navy-950 border-amber-500 font-extrabold shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Crown className="w-4 h-4 mb-1 flex-shrink-0" />
                <span className="text-[11px] whitespace-nowrap">👑 Bao 100%</span>
              </button>

              <button
                type="button"
                onClick={() => setSponsorType('PARTIAL')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                  sponsorType === 'PARTIAL'
                    ? 'bg-navy-900 text-white border-navy-900 font-extrabold shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <HeartHandshake className="w-4 h-4 mb-1 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] whitespace-nowrap">🤝 Hỗ Trợ</span>
              </button>

              <button
                type="button"
                onClick={() => setSponsorType('SHARE')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                  sponsorType === 'SHARE'
                    ? 'bg-navy-900 text-white border-navy-900 font-extrabold shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] whitespace-nowrap">💸 Share / Tự Trả</span>
              </button>
            </div>

            {/* Dynamic Sponsor Inputs */}
            {sponsorType !== 'SHARE' && (
              <div className="bg-navy-50 p-3 rounded-2xl border border-navy-200 space-y-2">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Tên Người Bao / Hỗ Trợ</label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    placeholder="VD: Sếp Lam bao cả nhóm, Sếp Tiến..."
                    className="w-full px-3 py-2 rounded-xl border border-navy-300 bg-white font-bold outline-none"
                  />
                </div>

                {sponsorType === 'PARTIAL' && (
                  <div>
                    <label className="font-bold text-navy-900 block mb-1">Số tiền hỗ trợ trên mỗi ly (đ)</label>
                    <input
                      type="number"
                      value={partialAmount}
                      onChange={e => setPartialAmount(Number(e.target.value))}
                      placeholder="VD: 15000"
                      className="w-full px-3 py-2 rounded-xl border border-navy-300 bg-white font-bold outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-600 block mb-1">Ghi chú riêng cho nhóm (Tùy chọn)</label>
              <input
                type="text"
                value={groupNote}
                onChange={e => setGroupNote(e.target.value)}
                placeholder="VD: Nhóm IT mừng dự án xong, Nhóm Lễ Tân..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-navy-600"
              />
            </div>

          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap flex-shrink-0"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              if (selectedEmployees.length === 0) {
                showToast('Vui lòng chọn ít nhất 1 người!', 'warning');
                return;
              }
              showToast(`Đã tạo nhóm order cho ${selectedEmployees.length} người!`);
              onClose();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-navy-900 to-navy-950 text-white font-black rounded-xl shadow-md flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            <span className="whitespace-nowrap">XÁC NHẬN TẠO NHÓM ({selectedEmployees.length} NGƯỜI)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
