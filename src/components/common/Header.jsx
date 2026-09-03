import React, { useRef, useState } from 'react';
import { Coffee, UserCheck, Shield, BarChart3, LogOut, RefreshCw, Camera, Home, Users } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { showToast } from './Toast';

export default function Header({ onOpenUserPicker, onOpenAdminModal, onOpenPersonalStats, onGoHome, onGoActiveGroups }) {
  const { currentUser, isUserSelected } = useUser();
  const { isAdmin, logoutAdmin, setAdminTab } = useAuth();
  
  const [companyLogoUrl, setCompanyLogoUrl] = useState('./company_logo.png');
  const companyLogoInputRef = useRef(null);

  const handleCompanyLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      try {
        const res = await api.updateCompanyLogo(dataUrl);
        if (res.logoUrl) {
          setCompanyLogoUrl(`${res.logoUrl}?t=${Date.now()}`);
        } else {
          setCompanyLogoUrl(`${dataUrl}`);
        }
        showToast('🎉 Đã lưu Logo Công Ty mới vĩnh viễn!', 'success');
      } catch (err) {
        showToast(err.message || 'Lỗi lưu logo công ty', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-md border-b border-navy-800 text-white shadow-xl">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-2">
        
        {/* Brand with LARGE PHÚ CƯỜNG HOÀNG GIA Company Logo - CLICKABLE TO GO HOME */}
        <div
          onClick={() => {
            if (onGoHome) onGoHome();
          }}
          className="flex items-center gap-3.5 group min-w-0 cursor-pointer"
          title="Bấm để quay về Trang Chủ"
        >
          
          <input
            ref={companyLogoInputRef}
            type="file"
            accept="image/*"
            onChange={handleCompanyLogoUpload}
            className="hidden"
          />

          <div className="relative w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-red-500 to-amber-600 p-0.5 shadow-lg shadow-navy-900/50 group-hover:scale-105 transition duration-300">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-0.5 relative">
              <img
                src={companyLogoUrl}
                alt="Logo Phú Cường Hoàng Gia"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=100&q=80';
                }}
              />

              {/* Direct Company Logo Change for Admin */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (companyLogoInputRef.current) companyLogoInputRef.current.click();
                  }}
                  className="absolute inset-0 bg-navy-950/75 opacity-0 hover:opacity-100 transition flex items-center justify-center text-amber-300 font-bold whitespace-nowrap"
                  title="Đổi & Lưu Logo Công Ty Mới"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="font-black text-xl tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition">
                Order Nước
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full shadow-xs border border-red-500 whitespace-nowrap flex-shrink-0">
                PHÚ CƯỜNG HOÀNG GIA
              </span>
            </div>
            <p className="text-xs text-navy-200 hidden sm:block font-medium mt-0.5 truncate">
              Bấm vào logo/tiêu đề để về Trang Chủ
            </p>
          </div>
        </div>

        {/* Navigation Buttons & Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Quick Nav: TRANG CHỦ & NHÓM ORDER */}
          {!isAdmin && (
            <div className="flex items-center gap-1.5 mr-1">
              <button
                onClick={onGoHome}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/20 flex items-center gap-1 transition whitespace-nowrap flex-shrink-0"
                title="Quay về màn hình chính"
              >
                <Home className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">TRANG CHỦ</span>
              </button>

              <button
                onClick={onGoActiveGroups}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-navy-950 text-xs font-black rounded-xl shadow-xs flex items-center gap-1 transition whitespace-nowrap flex-shrink-0"
                title="Xem các nhóm order đang mở"
              >
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">NHÓM ORDER</span>
              </button>
            </div>
          )}
          
          {/* User selector badge */}
          {isUserSelected ? (
            <div className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 p-1.5 pl-3.5 rounded-full border border-navy-700/80 transition group flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-navy-950 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden xs:block">
                  <p className="text-xs font-bold text-white leading-tight max-w-[120px] truncate whitespace-nowrap">{currentUser.name}</p>
                </div>
              </div>
              <button
                onClick={onOpenUserPicker}
                className="p-1.5 text-navy-300 hover:text-white rounded-full hover:bg-navy-700 transition flex-shrink-0 whitespace-nowrap"
                title="Đổi nhân viên / Order giùm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenUserPicker}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 rounded-full text-xs font-black shadow-md shadow-amber-500/20 transition animate-pulse whitespace-nowrap flex-shrink-0"
            >
              <UserCheck className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Bạn là ai?</span>
            </button>
          )}

          {/* Personal Stats */}
          {isUserSelected && (
            <button
              onClick={onOpenPersonalStats}
              className="p-2.5 text-navy-300 hover:text-white rounded-full hover:bg-navy-900 transition relative flex-shrink-0 whitespace-nowrap"
              title="Thống kê cá nhân"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          )}

          {/* Admin area button */}
          {isAdmin ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-800 whitespace-nowrap flex-shrink-0">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" /> Admin Mode
              </span>
              <button
                onClick={logoutAdmin}
                className="p-2.5 text-navy-300 hover:text-red-400 rounded-full hover:bg-navy-900 transition flex-shrink-0 whitespace-nowrap"
                title="Thoát Admin"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="p-2.5 text-navy-300 hover:text-white rounded-full hover:bg-navy-900 transition flex-shrink-0 whitespace-nowrap"
              title="Đăng nhập Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
