import React, { useState } from 'react';
import { Shield, X, Lock, ArrowRight } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../common/Toast';

export default function AdminLoginModal({ isOpen, onClose }) {
  const { loginAdmin } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await api.loginAdmin(password);
      loginAdmin(res.token);
      showToast('Đăng nhập Admin thành công!');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Admin Quản Lý</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Nhập mật khẩu Admin để truy cập trang quản trị chốt đơn, quản lý quán, nhân viên và xuất tin nhắn gửi quán.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Mật khẩu Admin (mặc định: admin123)..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-900 shadow-inner"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>ĐĂNG NHẬP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
