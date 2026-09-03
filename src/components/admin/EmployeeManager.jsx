import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState({ code: '', name: '' });

  const fetchEmployees = () => {
    setLoading(true);
    api.getEmployees()
      .then(data => setEmployees(data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleActive = async (empId) => {
    try {
      const res = await api.toggleEmployeeActive(empId);
      showToast(res.is_active ? 'Đã bật trạng thái ĐANG LÀM VIỆC' : 'Đã chuyển sang TẠM NGHỈ');
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (empId) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await api.deleteEmployee(empId);
        showToast('Đã xóa nhân viên!');
        fetchEmployees();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingEmp.name) {
      showToast('Vui lòng nhập tên nhân viên!', 'warning');
      return;
    }

    try {
      if (editingEmp.id) {
        await api.updateEmployee(editingEmp.id, editingEmp);
        showToast('Đã cập nhật nhân viên!');
      } else {
        await api.createEmployee(editingEmp);
        showToast('Đã thêm nhân viên mới!');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 my-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Quản lý Nhân Viên ({employees.length})</h2>
          <p className="text-xs text-slate-500">Quản lý danh sách nhân viên công ty. Nhân viên tạm nghỉ không tính vào danh sách Chưa order.</p>
        </div>

        <button
          onClick={() => {
            setEditingEmp({ code: '', name: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
        >
          <Plus className="w-4 h-4" /> THÊM NHÂN VIÊN MỚI
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã NV..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 placeholder-slate-400 text-xs rounded-2xl border border-slate-200 outline-none focus:border-brand-500 shadow-sm"
        />
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Đang tải nhân viên...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Không tìm thấy nhân viên phù hợp</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(emp => {
            const isActive = emp.is_active === 1;
            return (
              <div
                key={emp.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                  isActive ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center ${
                    isActive ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-800">{emp.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{emp.code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(emp.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isActive ? 'ĐANG LÀM' : 'TẠM NGHỈ'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingEmp(emp);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <h3 className="font-extrabold text-lg text-slate-900">
              {editingEmp.id ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên nhân viên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={editingEmp.name}
                  onChange={e => setEditingEmp({ ...editingEmp, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã NV (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="VD: NV021"
                  value={editingEmp.code}
                  onChange={e => setEditingEmp({ ...editingEmp, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  LƯU NHÂN VIÊN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
