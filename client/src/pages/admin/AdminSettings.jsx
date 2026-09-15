import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, MessageSquare, Key, Save, RefreshCw, Check } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

export default function AdminSettings() {
  const [template, setTemplate] = useState('');
  const [subsidy, setSubsidy] = useState({ enabled: true, amount_per_person: 20000 });
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPin, setChangingPin] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.success) {
        if (res.data.message_template) setTemplate(res.data.message_template);
        if (res.data.subsidy) setSubsidy(res.data.subsidy);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updateSettings({
        message_template: template,
        subsidy: subsidy
      });
      if (res.success) {
        showToast('Đã lưu cấu hình trợ giá và mẫu tin nhắn!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      showToast('Mã PIN mới phải từ 4 ký tự trở lên', 'error');
      return;
    }
    try {
      setChangingPin(true);
      const res = await api.changeAdminPin({ old_pin: oldPin, new_pin: newPin });
      if (res.success) {
        showToast(res.message, 'success');
        setOldPin('');
        setNewPin('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải cài đặt hệ thống...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Cài đặt hệ thống & Trợ giá
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cấu hình chính sách trợ giá tiền nước của công ty và mẫu tin nhắn Zalo gửi quán
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Company Subsidy */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Chính sách Trợ giá công ty hỗ trợ tiền nước
              </h3>
              <p className="text-xs text-slate-500">
                Tự động trừ trực tiếp vào số tiền nhân viên thanh toán
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-800 text-sm">Bật tính năng trợ giá</div>
                <div className="text-slate-500 text-xs">Áp dụng cho tất cả nhân viên khi đặt món</div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subsidy.enabled}
                  onChange={(e) => setSubsidy({ ...subsidy, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {subsidy.enabled && (
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Mức hỗ trợ tối đa (VNĐ / người / ngày)
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    step="1000"
                    value={subsidy.amount_per_person}
                    onChange={(e) => setSubsidy({ ...subsidy, amount_per_person: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-xs font-bold text-slate-600">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ví dụ: Món 55.000đ, công ty hỗ trợ 20.000đ → Nhân viên chỉ cần thanh toán 35.000đ.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Zalo/Messenger Template */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Mẫu Tin nhắn gửi Quán (Zalo / Messenger)
              </h3>
              <p className="text-xs text-slate-500">
                Sử dụng các biến placeholder động để hệ thống tự động điền dữ liệu thực tế
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 mr-1 font-sans">Biến khả dụng:</span>
              <code className="bg-white px-1 py-0.5 rounded border">{'{STORE_NAME}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{DATE}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{ORDER_ITEMS}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{TOTAL_CUPS}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{TOTAL_AMOUNT}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{RECIPIENT_NAME}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{RECIPIENT_PHONE}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{DELIVERY_ADDRESS}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{DELIVERY_TIME}'}</code>
              <code className="bg-white px-1 py-0.5 rounded border">{'{DELIVERY_NOTE}'}</code>
            </div>

            <textarea
              rows={12}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'LƯU CẤU HÌNH HỆ THỐNG'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. Change Admin PIN */}
      <form onSubmit={handleChangePin} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Bảo mật & Đổi mã PIN Admin
            </h3>
            <p className="text-xs text-slate-500">
              Thiết lập mã PIN bảo mật cho trang Quản trị viên
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Mã PIN hiện tại *</label>
            <input
              type="password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              required
              placeholder="Nhập mã PIN cũ..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Mã PIN mới *</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              required
              placeholder="Nhập mã PIN mới (từ 4 ký tự)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changingPin}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{changingPin ? 'Đang cập nhật...' : 'Cập nhật mã PIN'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
