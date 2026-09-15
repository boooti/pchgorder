import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit3, Trash2, Check, X, Briefcase, Lock, KeyRound } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const [form, setForm] = useState({
    name: '',
    department: '',
    is_active: 1,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await api.getEmployees(false); // All employees
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setForm({
      name: '',
      department: 'Ban GĐ',
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setForm({
      name: emp.name,
      department: emp.department || '',
      is_active: emp.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Tên nhân viên là bắt buộc', 'error');
      return;
    }

    try {
      if (editingEmp) {
        const res = await api.updateEmployee(editingEmp.id, form);
        if (res.success) showToast('Cập nhật nhân viên thành công', 'success');
      } else {
        const res = await api.createEmployee(form);
        if (res.success) showToast('Thêm nhân viên thành công', 'success');
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (empId) => {
    try {
      const res = await api.toggleEmployeeStatus(empId);
      if (res.success) {
        showToast(res.message, 'success');
        loadEmployees();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (empId, empName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${empName}" không?`)) return;
    try {
      const res = await api.deleteEmployee(empId);
      if (res.success) {
        showToast(res.message, 'success');
        loadEmployees();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetPassword = async (empId, empName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mật khẩu của "${empName}" không? Nhân viên sẽ có thể đặt lại mật khẩu mới hoặc chọn không dùng mật khẩu ở lần đăng nhập tiếp theo.`)) return;
    try {
      const res = await api.resetEmployeePassword(empId);
      if (res.success) {
        showToast(res.message, 'success');
        loadEmployees();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = employees.filter((e) => {
    const term = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      (e.department && e.department.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý danh sách nhân viên
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhân viên tạm nghỉ sẽ không bị tính vào danh sách "Chưa order"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải danh sách nhân viên...
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4">Mật khẩu</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((emp) => {
                  const isActive = emp.is_active === 1;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {emp.name.split(' ').slice(-1)[0][0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {emp.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
                          {emp.department || 'Văn phòng'}
                        </span>
                      </td>

                      <td className="p-4">
                        {emp.has_password ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Lock className="w-3 h-3" /> Đã đặt MK
                          </span>
                        ) : emp.has_asked_password ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Không dùng MK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            Chưa kích hoạt
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(emp.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {isActive ? 'Đang làm việc' : 'Tạm nghỉ'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {emp.has_password ? (
                            <button
                              onClick={() => handleResetPassword(emp.id, emp.name)}
                              className="p-1.5 text-amber-500 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                              title="Xóa mật khẩu (để nhân viên đặt lại)"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Sửa nhân viên"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, emp.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                            title="Xóa nhân viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingEmp ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Phòng ban</label>
                <input
                  type="text"
                  placeholder="VD: Ban GĐ, Phòng BIM, BQLDA, Đầu tư - Pháp lý..."
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Trạng thái làm việc</label>
                <select
                  value={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={1}>Đang làm việc (Tính vào danh sách order)</option>
                  <option value={0}>Tạm nghỉ / Nghỉ phép (Không tính vào Chưa order)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  {editingEmp ? 'Lưu thay đổi' : 'Thêm nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
