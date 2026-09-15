import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';

export default function OriginalMenuModal({ isOpen, onClose, menuFiles = [], storeName = 'Quán' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const currentFile = menuFiles[currentPage] || menuFiles[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      setZoomLevel(1);
    }
  };

  const nextPage = () => {
    if (currentPage < menuFiles.length - 1) {
      setCurrentPage((p) => p + 1);
      setZoomLevel(1);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 ${
      isFullscreen ? 'p-0' : 'p-2 sm:p-4'
    }`}>
      <div className={`bg-slate-900 shadow-2xl flex flex-col overflow-hidden border border-slate-800 text-white transition-all ${
        isFullscreen
          ? 'w-full h-full rounded-none border-0'
          : 'w-full max-w-6xl xl:max-w-7xl h-[94vh] rounded-3xl'
      }`}>
        {/* Top Control Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-base shrink-0 border border-blue-500/20">
              📖
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                Menu gốc đính kèm: {storeName}
              </h3>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span>
                  {menuFiles.length > 0
                    ? `Trang ${currentPage + 1} / ${menuFiles.length}`
                    : 'Chưa có file menu'}
                </span>
                {currentFile?.file_name && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{currentFile.file_name}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Zoom controls, Fullscreen & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls (Visible on mobile & desktop) */}
            <div className="flex items-center bg-slate-800/90 rounded-2xl p-1 gap-0.5 border border-slate-700">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="Thu nhỏ"
                className="p-1.5 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors text-slate-300 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] sm:text-xs font-mono font-bold px-1.5 min-w-[42px] text-center text-blue-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                title="Phóng to"
                className="p-1.5 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors text-slate-300 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Đặt lại zoom 100%"
                className="p-1.5 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Open Original in New Tab */}
            {currentFile?.file_path && (
              <a
                href={currentFile.file_path}
                target="_blank"
                rel="noreferrer"
                title="Mở ảnh gốc tab mới"
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 hidden sm:flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 hidden sm:flex items-center justify-center"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Đóng menu"
              className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors border border-slate-700 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Viewer Canvas */}
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-3 sm:p-6 relative select-none">
          {menuFiles.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <FileText className="w-14 h-14 mx-auto mb-3 opacity-40 text-blue-400" />
              <p className="text-sm font-semibold text-slate-300">Quán này chưa được quản lý tải lên file menu gốc</p>
              <p className="text-xs mt-1 text-slate-500">Vui lòng chọn món trên danh sách số hóa phía dưới</p>
            </div>
          ) : (
            <div
              className="transition-transform duration-150 origin-center max-h-full max-w-full flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {currentFile.file_type === 'pdf' ? (
                <iframe
                  src={currentFile.file_path}
                  title="Menu PDF"
                  className="w-[90vw] max-w-5xl h-[80vh] rounded-2xl border border-slate-800 bg-white shadow-2xl"
                />
              ) : (
                <img
                  src={currentFile.file_path}
                  alt={`Menu page ${currentPage + 1}`}
                  className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800/80 cursor-zoom-in"
                  onClick={handleZoomIn}
                  title="Bấm để phóng to hơn"
                />
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          {menuFiles.length > 1 && (
            <>
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md disabled:opacity-20 shadow-2xl transition-all hover:scale-105 active:scale-95"
                title="Trang trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === menuFiles.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md disabled:opacity-20 shadow-2xl transition-all hover:scale-105 active:scale-95"
                title="Trang sau"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Bottom Bar */}
        {menuFiles.length > 1 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-2 shrink-0 overflow-x-auto">
            {menuFiles.map((file, idx) => (
              <button
                key={file.id || idx}
                onClick={() => {
                  setCurrentPage(idx);
                  setZoomLevel(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentPage === idx
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <span>Trang {idx + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
