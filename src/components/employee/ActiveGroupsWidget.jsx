import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, Ban, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

// Mock initial active small groups state
const INITIAL_GROUPS = [
  {
    id: 'grp_101',
    name: 'Nhóm Riêng 01',
    sponsorType: 'SPONSOR_100',
    sponsorName: 'Sếp bao 100%',
    sponsorAmount: 0,
    members: [
      { id: 1, name: 'Lâm Hoàng Lam', code: 'NV001' },
      { id: 2, name: 'Vũ Đăng Trình', code: 'NV002' },
      { id: 4, name: 'Trần Trung Tiến', code: 'NV004' }
    ]
  },
  {
    id: 'grp_102',
    name: 'Nhóm Riêng 02',
    sponsorType: 'SHARE',
    sponsorName: 'Share đều',
    sponsorAmount: 0,
    members: [
      { id: 13, name: 'Trần Thị Hương', code: 'NV013' },
      { id: 14, name: 'Trần Thị Trinh', code: 'NV014' }
    ]
  }
];

export default function ActiveGroupsWidget() {
  const { currentUser } = useUser();
  const [groups] = useState(INITIAL_GROUPS);

  const handleEnterGroup = (group, isMember) => {
    if (!currentUser) {
      showToast('Vui lòng chọn nhân viên trước!', 'warning');
      return;
    }

    if (!isMember) {
      showToast('🔒 Nhóm này bảo mật. Tên bạn không có trong danh sách nhóm!', 'error');
      return;
    }

    showToast(`✨ Đã mở nhóm riêng cho ${currentUser.name}!`, 'success');
  };

  if (groups.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-navy-950 text-amber-400 flex items-center justify-center font-black flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-navy-950 text-xs uppercase tracking-wider whitespace-nowrap">NHÓM BAO NƯỚC RIÊNG TƯ ({groups.length})</h3>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Bảo mật danh sách thành viên · Chỉ hiển thị nhóm của bạn</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-navy-950 text-amber-300 border border-navy-800 whitespace-nowrap flex-shrink-0">
          🔒 Bảo mật 100%
        </span>
      </div>

      {/* Ultra-Minimalist Group Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {groups.map((group, idx) => {
          const isMemberOfGroup = currentUser && group.members.some(m => m.id === currentUser.id);

          return (
            <div
              key={group.id}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                isMemberOfGroup
                  ? 'bg-navy-950 text-white border-navy-900 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 opacity-75'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-black text-xs truncate">
                    {group.name || `Nhóm Order ${idx + 1}`}
                  </span>
                  {group.sponsorType === 'SPONSOR_100' && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-navy-950 whitespace-nowrap flex-shrink-0">
                      👑 Bao 100%
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-medium opacity-80 truncate">
                  {isMemberOfGroup ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" /> Bạn có trong nhóm này
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 flex-shrink-0" /> Nhóm riêng tư
                    </span>
                  )}
                </div>
              </div>

              {/* Minimalist Action Button */}
              {isMemberOfGroup ? (
                <button
                  onClick={() => handleEnterGroup(group, true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-navy-950 shadow-sm active:scale-95 whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Vào Đặt</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-200 text-slate-400 cursor-not-allowed whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <Ban className="w-3 h-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">Khóa</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
