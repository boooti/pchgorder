import React from 'react';
import { Plus, Ban } from 'lucide-react';

export default function ProductCard({ product, categoryName = '', onSelect }) {
  const minPrice = product.sizes && product.sizes.length > 0
    ? Math.min(...product.sizes.map(s => s.price))
    : 0;

  const isAvailable = product.is_available === 1;

  return (
    <div
      onClick={() => isAvailable && onSelect(product)}
      className={`bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl p-2.5 border transition duration-200 flex flex-col justify-between relative group shadow-sm ${
        isAvailable
          ? 'border-slate-200/90 hover:border-navy-900 hover:shadow-xl cursor-pointer hover:scale-[1.03]'
          : 'border-slate-200 bg-slate-100/90 opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Top Bar: Category Name & Available Status */}
      <div className="flex items-center justify-between gap-1 mb-1">
        {categoryName && (
          <span className="text-[9px] font-extrabold uppercase text-slate-500 truncate tracking-wider">
            {categoryName}
          </span>
        )}
        {!isAvailable && (
          <span className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase rounded-full shadow-sm ml-auto flex-shrink-0">
            HẾT MÓN
          </span>
        )}
      </div>

      {/* Drink Name (Large & Prominent) */}
      <div className="my-1">
        <h3 className="font-black text-navy-950 text-sm sm:text-base leading-snug group-hover:text-navy-800 transition line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Footer Price & Add Button */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <span className="font-black text-xs sm:text-sm text-amber-600 whitespace-nowrap">
          {new Intl.NumberFormat('vi-VN').format(minPrice)}đ
        </span>

        {isAvailable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center justify-center gap-1 px-3 py-1 bg-navy-950 hover:bg-navy-900 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span>CHỌN</span>
          </button>
        ) : (
          <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
            Hết món
          </span>
        )}
      </div>
    </div>
  );
}
