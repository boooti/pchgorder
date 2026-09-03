import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Download, RotateCcw, FileText } from 'lucide-react';

export default function OriginalMenuModal({ isOpen, onClose, menuFiles = [], storeName = '' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      setZoom(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFile = menuFiles[currentPage];

  const handleDownload = () => {
    if (currentFile && currentFile.file_path) {
      const link = document.createElement('a');
      link.href = currentFile.file_path;
      link.download = `Menu_${storeName}_Trang${currentPage + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col w-screen h-screen text-white animate-fade-in overflow-hidden">
      
      {/* FULL SCREEN HEADER BAR */}
      <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-10 shadow-lg">
        
        {/* Title & Page Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              <span>Menu Gốc Quán</span>
              <span className="text-amber-400 font-extrabold">{storeName}</span>
            </h3>
            {menuFiles.length > 0 && (
              <p className="text-xs text-slate-400 font-mono">
                Trang <span className="text-white font-bold">{currentPage + 1}</span> / {menuFiles.length}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          
          {/* Zoom Out */}
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.25))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4.5 h-4.5" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold text-xs flex items-center gap-1"
            title="Đặt về 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setZoom(z => Math.min(3.5, z + 0.3))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4.5 h-4.5" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* Download */}
          {currentFile && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
              title="Tải ảnh menu về máy"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold transition ml-2 flex items-center gap-1 shadow-md"
          >
            <X className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">ĐÓNG [ESC]</span>
          </button>
        </div>

      </div>

      {/* FULL SCREEN IMAGE VIEWER BODY */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950 relative select-none cursor-grab active:cursor-grabbing">
        {menuFiles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-3 opacity-30 text-amber-400" />
            <p className="text-sm font-semibold">Quán chưa có ảnh/PDF menu gốc nào được tải lên</p>
          </div>
        ) : currentFile ? (
          <div
            className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src={currentFile.file_path}
              alt={currentFile.file_name}
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>
        ) : null}
      </div>

      {/* PAGE SWITCHER FOOTER BAR */}
      {menuFiles.length > 1 && (
        <div className="h-16 px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between flex-shrink-0 z-10 shadow-lg">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold transition"
          >
            <ChevronLeft className="w-4 h-4" /> TRANG TRƯỚC
          </button>

          <div className="flex gap-2 overflow-x-auto py-1">
            {menuFiles.map((f, i) => (
              <button
                key={f.id || i}
                onClick={() => {
                  setCurrentPage(i);
                  setZoom(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  i === currentPage ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Trang {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === menuFiles.length - 1}
            onClick={() => setCurrentPage(p => Math.min(menuFiles.length - 1, p + 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold transition"
          >
            TRANG SAU <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
