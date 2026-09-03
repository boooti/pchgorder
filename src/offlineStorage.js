import * as XLSX from 'xlsx';

const STORAGE_KEYS = {
  EMPLOYEES: 'company_drink_offline_employees',
  STORES: 'company_drink_offline_stores',
  SESSIONS: 'company_drink_offline_sessions',
  ORDERS: 'company_drink_offline_orders',
  SETTINGS: 'company_drink_offline_settings',
};

const DEFAULT_DELIVERY_ADDRESS = 'Cổng sau công ty Phú Cường - Số 1 Hà Huy Tập, Rạch Giá';

// Initial Seed Data for Pure Offline Mode
const INITIAL_EMPLOYEES = [
  { id: 1, code: '889966', name: 'Huỳnh Thái Lel', department: 'Văn phòng', is_active: 1 },
  { id: 2, code: '009544', name: 'Lâm Hoàng Lam', department: 'Văn phòng', is_active: 1 },
  { id: 3, code: '995381', name: 'Vũ Đăng Trình', department: 'BQLDA', is_active: 1 },
  { id: 4, code: '699298', name: 'Nguyễn Tam Giác', department: 'BQLDA', is_active: 1 },
  { id: 5, code: '006620', name: 'Trần Trung Tiến', department: 'BQLDA', is_active: 1 },
  { id: 6, code: '013137', name: 'Trương Vĩnh Thế', department: 'BQLDA', is_active: 1 },
  { id: 7, code: '009044', name: 'Du Vinh Huê', department: 'BQLDA', is_active: 1 },
  { id: 8, code: '000276', name: 'Lê Minh Đăng', department: 'BQLDA', is_active: 1 },
  { id: 9, code: '010861', name: 'Phan Văn Nhân', department: 'BQLDA', is_active: 1 },
  { id: 10, code: '000088', name: 'Đoàn Tuấn Anh', department: 'BQLDA', is_active: 1 },
  { id: 11, code: '000485', name: 'Nguyễn Văn Chiến', department: 'BQLDA', is_active: 1 },
  { id: 12, code: '010111', name: 'Trần Thanh Tiến', department: 'BQLDA', is_active: 1 },
  { id: 13, code: '690806', name: 'Nguyễn Ngọc Nguyên', department: 'Văn phòng', is_active: 1 },
  { id: 14, code: '708891', name: 'Trần Thị Hương', department: 'Văn phòng', is_active: 1 },
  { id: 15, code: '868109', name: 'Trần Thị Trinh', department: 'Văn phòng', is_active: 1 },
  { id: 16, code: '012781', name: 'Hồ Huy Toàn', department: 'Văn phòng', is_active: 1 },
  { id: 17, code: '015242', name: 'Lê Long Giang', department: 'Văn phòng', is_active: 1 },
  { id: 18, code: '007659', name: 'Thị Yến Linh', department: 'Văn phòng', is_active: 1 },
  { id: 19, code: '163153', name: 'Nguyễn Văn Công', department: 'Văn phòng', is_active: 1 },
  { id: 20, code: '000227', name: 'Trần Văn Nhựt Cường', department: 'Văn phòng', is_active: 1 },
  { id: 21, code: '153954', name: 'Trương Đình Thi', department: 'Văn phòng', is_active: 1 },
  { id: 22, code: '362279', name: 'Trần Văn Sua', department: 'Văn phòng', is_active: 1 },
  { id: 23, code: '012979', name: 'Nguyễn Thị Minh Thư', department: 'Văn phòng', is_active: 1 },
  { id: 24, code: '935138', name: 'Hưng Tấn Đạt', department: 'Văn phòng', is_active: 1 },
  { id: 25, code: '991783', name: 'Nguyễn Hồng Ái', department: 'Văn phòng', is_active: 1 },
  { id: 26, code: '014314', name: 'Đồng Hữu Phú', department: 'Văn phòng', is_active: 1 },
  { id: 27, code: '007925', name: 'Trần Minh Đăng', department: 'Văn phòng', is_active: 1 },
  { id: 28, code: '000334', name: 'Dư Văn Đạt', department: 'Văn phòng', is_active: 1 },
  { id: 29, code: '008209', name: 'Nguyễn Kiều Tiên', department: 'Văn phòng', is_active: 1 },
  { id: 30, code: '003115', name: 'Phạm Bình An', department: 'Văn phòng', is_active: 1 },
  { id: 31, code: '006262', name: 'Huỳnh Tấn Lộc', department: 'Văn phòng', is_active: 1 },
  { id: 32, code: '010743', name: 'Lâm Thiên Phú', department: 'Văn phòng', is_active: 1 },
  { id: 33, code: '273552', name: 'Trần Thị Diễm Linh', department: 'Văn phòng', is_active: 1 },
  { id: 34, code: '821653', name: 'Vũ Huỳnh Như Ý', department: 'Văn phòng', is_active: 1 },
  { id: 35, code: '662750', name: 'Nguyễn Phương Loan', department: 'Văn phòng', is_active: 1 },
  { id: 36, code: '012565', name: 'Trần Võ Phương Nghi', department: 'Văn phòng', is_active: 1 },
  { id: 37, code: '024378', name: 'Trần Thị Nhung', department: 'Văn phòng', is_active: 1 },
  { id: 38, code: '015218', name: 'Đào Thị Huyền Trân', department: 'Văn phòng', is_active: 1 }
];

// STORE 1: HOGI
const HOGI_STORE = {
  id: 1,
  name: 'HOGI COFFEE & TEA',
  logo: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80',
  cover_image: '/uploads/menus/hogi_menu_1.jpg',
  address: 'L4-C27 Phan Thị Ràng, P. Rạch Giá',
  phone: '0969.487.712',
  note: 'Menu áp dụng dịp Tết 2026. Đơn vị tính: 1.000đ',
  is_active: 1,
  delivery: {
    recipient_name: 'Nguyễn Tam Giác (Lễ Tân)',
    recipient_phone: '0969.487.712',
    delivery_address: DEFAULT_DELIVERY_ADDRESS,
    delivery_time: '10:30',
    delivery_note: 'Giao nhanh trước 10:30'
  },
  menuFiles: [
    { id: 1, file_name: 'Menu HOGI COFFEE & TEA - Trang 1.jpg', file_path: '/uploads/menus/hogi_menu_1.jpg', page_number: 1 }
  ],
  categories: [
    { id: 1, name: 'CÀ PHÊ' },
    { id: 2, name: 'CACAO' },
    { id: 3, name: 'MATCHA NHẬT BẢN' },
    { id: 4, name: 'TRÀ THANH MÁT' },
    { id: 5, name: 'YOGURT (SỮA CHUA)' },
    { id: 6, name: 'MÓN MỚI (NEW)' },
    { id: 7, name: 'TRÀ SỮA ĐẬM VỊ' },
    { id: 8, name: 'TRÀ SÁNG TẠO' },
    { id: 9, name: 'TRÀ TRÁI CÂY' },
    { id: 10, name: 'BÍ ĐẠO' }
  ],
  toppings: [
    { id: 1, topping_name: 'Trân Châu Đen', price: 6000, is_available: 1 },
    { id: 2, topping_name: 'Sương Sáo', price: 6000, is_available: 1 },
    { id: 3, topping_name: 'Pudding', price: 6000, is_available: 1 },
    { id: 4, topping_name: 'Trân Châu Trắng', price: 6000, is_available: 1 },
    { id: 5, topping_name: 'Kem Trứng', price: 8000, is_available: 1 }
  ],
  products: [
    { id: 1, category_id: 1, name: '1. Cà phê đen đá', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 17000 }] },
    { id: 2, category_id: 1, name: '2. Cà phê sữa đá', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 20000 }] },
    { id: 3, category_id: 1, name: '3. Cà phê kem muối', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 22000 }] },
    { id: 4, category_id: 1, name: '4. Cà phê kem trứng', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 24000 }] },
    { id: 18, category_id: 3, name: '18. Latte Matcha', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 25000 }] },
    { id: 24, category_id: 3, name: '24. Latte Matcha Strawberry (dâu)', description: 'Món đặc biệt ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 32000 }] },
    { id: 36, category_id: 6, name: '36. Trà mùa xuân (Phiên bản đặc biệt)', description: 'Phiên bản đặc biệt ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 30000 }] },
    { id: 48, category_id: 7, name: '48. Trà sữa Phúc Long', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 27000 }] },
    { id: 55, category_id: 8, name: '55. Trà đào', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 25000 }] },
    { id: 67, category_id: 9, name: '67. Trà trái cây nhiệt đới', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 25000 }] }
  ]
};

// STORE 2: KATINAT
const KATINAT_STORE = {
  id: 2,
  name: 'KATINAT Saigon Kafe',
  logo: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80',
  cover_image: '/uploads/menus/katinat_menu_1.jpg',
  address: '120 Trương Định, Q.3, TP.HCM',
  phone: '028 7300 1008',
  note: 'Giá x 1.000đ (Đã bao gồm VAT)',
  is_active: 1,
  delivery: {
    recipient_name: 'Trần Thị Hương',
    recipient_phone: '0901 234 567',
    delivery_address: DEFAULT_DELIVERY_ADDRESS,
    delivery_time: '10:30',
    delivery_note: 'Mang tới cổng sau giao bảo vệ / lễ tân'
  },
  menuFiles: [
    { id: 2, file_name: 'Menu KATINAT Saigon Kafe - Trang 1.jpg', file_path: '/uploads/menus/katinat_menu_1.jpg', page_number: 1 }
  ],
  categories: [
    { id: 20, name: 'CÀ PHÊ PHIN MÊ' },
    { id: 21, name: 'CÀ PHÊ ESPRESSO' },
    { id: 22, name: 'TRÀ SỮA' },
    { id: 23, name: 'PHONG VỊ MỚI (KATINAT SPECIAL)' },
    { id: 24, name: 'TRÀ TRÁI CÂY (FRUIT TEA)' }
  ],
  toppings: [
    { id: 20, topping_name: 'Topping Tàu Hũ (80g)', price: 15000, is_available: 1 },
    { id: 21, topping_name: 'Trân Châu Phô Mai Dẻo (4 viên)', price: 15000, is_available: 1 },
    { id: 22, topping_name: 'Trân Châu Trắng (50g)', price: 10000, is_available: 1 },
    { id: 23, topping_name: 'Kem Sữa Phô Mai Macchiato (80ml)', price: 15000, is_available: 1 }
  ],
  products: [
    { id: 201, category_id: 20, name: 'Mê Sữa Đá (Vietnamese White Coffee)', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'Nóng', price: 39000 }, { size_name: 'S', price: 39000 }, { size_name: 'M', price: 55000 }] },
    { id: 202, category_id: 20, name: 'Mê Dừa Non (Young Coconut Coffee)', description: 'Nhiều dừa dẻo thơm ngon', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 49000 }, { size_name: 'M', price: 60000 }] },
    { id: 203, category_id: 22, name: 'Thanh Hương Camellia (Camellia Fresh Milk Tea)', description: 'Món Mới 🆕', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 50000 }, { size_name: 'M', price: 65000 }] },
    { id: 204, category_id: 22, name: 'Trà Sữa Chôm Chôm (Rambutan Milk Tea)', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 60000 }] },
    { id: 205, category_id: 22, name: 'Trà Sữa Oolong Nướng (Roasted Oolong Milk Tea)', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 45000 }, { size_name: 'L', price: 55000 }] },
    { id: 206, category_id: 23, name: 'IKI Matcha Tàu Hũ', description: 'Món Mới 🆕 Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 69000 }] },
    { id: 207, category_id: 23, name: 'Bơ Già Dừa Non (Avocado Young Coconut)', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 55000 }, { size_name: 'M', price: 69000 }] },
    { id: 208, category_id: 24, name: 'Cóc Cóc Đắc Đắc', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 69000 }] },
    { id: 209, category_id: 24, name: 'Trà Đào Hồng Đài', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 65000 }] }
  ]
};

// STORE 3: KAMIN
const KAMIN_STORE = {
  id: 3,
  name: 'KAMIN COFFEE',
  logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80',
  cover_image: '/uploads/menus/kamin_menu_1.jpg',
  address: 'F1-17 Hoàng Văn Thụ',
  phone: '0844482225',
  note: 'Đơn vị tính: 1.000đ. ⭐ Best Seller. Có các size M, L, XL',
  is_active: 1,
  delivery: {
    recipient_name: 'Nguyễn Tam Giác (Lễ Tân)',
    recipient_phone: '0844482225',
    delivery_address: DEFAULT_DELIVERY_ADDRESS,
    delivery_time: '10:30',
    delivery_note: 'Giao nhanh đúng hẹn'
  },
  menuFiles: [
    { id: 3, file_name: 'Menu KAMIN COFFEE - Trang 1.jpg', file_path: '/uploads/menus/kamin_menu_1.jpg', page_number: 1 }
  ],
  categories: [
    { id: 30, name: 'CÀ PHÊ' },
    { id: 31, name: 'MATCHA' },
    { id: 32, name: 'CACAO (MILO)' },
    { id: 33, name: 'TRÀ TRÁI CÂY' },
    { id: 34, name: 'LATTE SỮA' },
    { id: 35, name: 'KHOAI MÔN' },
    { id: 36, name: 'SỮA CHUA' },
    { id: 37, name: 'BÁNH BAO & COMBO' }
  ],
  toppings: [
    { id: 30, topping_name: 'Trân Châu', price: 7000, is_available: 1 },
    { id: 31, topping_name: 'Kem Trứng', price: 10000, is_available: 1 },
    { id: 32, topping_name: 'Kem Phô Mai', price: 10000, is_available: 1 },
    { id: 33, topping_name: 'Kem Muối', price: 10000, is_available: 1 }
  ],
  products: [
    { id: 301, category_id: 30, name: 'Đen Đá', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 15000 }, { size_name: 'L', price: 18000 }, { size_name: 'XL', price: 25000 }] },
    { id: 302, category_id: 30, name: 'Phin Sữa Đá', description: '', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 18000 }, { size_name: 'L', price: 25000 }, { size_name: 'XL', price: 30000 }] },
    { id: 303, category_id: 30, name: 'Cà Phê Kem Muối / Kem Trứng', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 22000 }, { size_name: 'L', price: 32000 }, { size_name: 'XL', price: 37000 }] },
    { id: 304, category_id: 31, name: 'Matcha Latte Kem Muối', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 27000 }, { size_name: 'L', price: 32000 }, { size_name: 'XL', price: 40000 }] },
    { id: 305, category_id: 32, name: 'Cacao Latte Oreo', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 25000 }, { size_name: 'L', price: 30000 }, { size_name: 'XL', price: 35000 }] },
    { id: 306, category_id: 33, name: 'Trà Ổi Hồng', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 25000 }, { size_name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { id: 307, category_id: 33, name: 'Trà Sen Nhãn Táo Đỏ', description: 'Best Seller ⭐', image: null, is_available: 1, sizes: [{ size_name: 'M', price: 30000 }, { size_name: 'L', price: 35000 }, { size_name: 'XL', price: 40000 }] },
    { id: 308, category_id: 37, name: 'Combo 3 Bánh Bao Tặng 1 Chai Sâm', description: 'Tiết kiệm ⭐', image: null, is_available: 1, sizes: [{ size_name: 'Combo', price: 75000 }] }
  ]
};

// STORE 4: HIGHLANDS
const HIGHLANDS_STORE = {
  id: 4,
  name: 'HIGHLANDS COFFEE',
  logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
  cover_image: '/uploads/menus/highlands_menu_1.jpg',
  address: 'Số 1 Hà Huy Tập, P. Rạch Giá',
  phone: '1900 1755',
  note: 'Đơn vị tính: 1.000 VNĐ. Có các size Nhỏ (S), Vừa (M), Lớn (L).',
  is_active: 1,
  delivery: {
    recipient_name: 'Nguyễn Tam Giác (Lễ Tân)',
    recipient_phone: '1900 1755',
    delivery_address: DEFAULT_DELIVERY_ADDRESS,
    delivery_time: '10:30',
    delivery_note: 'Giao tới cổng sau công ty Phú Cường'
  },
  menuFiles: [
    { id: 4, file_name: 'Menu HIGHLANDS COFFEE - Trang 1.jpg', file_path: '/uploads/menus/highlands_menu_1.jpg', page_number: 1 }
  ],
  categories: [
    { id: 40, name: 'CÀ PHÊ PHA PHIN' },
    { id: 41, name: 'CÀ PHÊ ESPRESSO' },
    { id: 42, name: 'FREEZE (ĐÁ XAY)' },
    { id: 43, name: 'TRÀ HIGHLANDS' },
    { id: 44, name: 'THỨC UỐNG KHÁC' }
  ],
  toppings: [
    { id: 40, topping_name: 'Thạch Vải', price: 10000, is_available: 1 },
    { id: 41, topping_name: 'Thạch Đào', price: 10000, is_available: 1 },
    { id: 42, topping_name: 'Hạt Sen', price: 10000, is_available: 1 },
    { id: 43, topping_name: 'Đậu Đỏ', price: 10000, is_available: 1 },
    { id: 44, topping_name: 'Kem Whipping / Milk Foam', price: 10000, is_available: 1 }
  ],
  products: [
    { id: 401, category_id: 40, name: 'Phin Sữa Đá', description: 'PHIN Coffee & Condensed Milk ⭐', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 29000 }, { size_name: 'M', price: 35000 }, { size_name: 'L', price: 39000 }] },
    { id: 402, category_id: 40, name: 'Phin Đen Đá', description: 'PHIN Coffee', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 29000 }, { size_name: 'M', price: 35000 }, { size_name: 'L', price: 39000 }] },
    { id: 403, category_id: 40, name: 'Bạc Xỉu Đá', description: 'White PHIN Coffee & Condensed Milk', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 29000 }, { size_name: 'M', price: 35000 }, { size_name: 'L', price: 39000 }] },
    { id: 404, category_id: 42, name: 'Freeze Trà Xanh', description: 'Green Tea Freeze ⭐ Best Seller', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 49000 }, { size_name: 'M', price: 59000 }, { size_name: 'L', price: 65000 }] },
    { id: 405, category_id: 42, name: 'Freeze Sô-cô-la', description: 'Chocolate Freeze', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 49000 }, { size_name: 'M', price: 59000 }, { size_name: 'L', price: 65000 }] },
    { id: 406, category_id: 43, name: 'Trà Sen Vàng', description: 'Oolong Tea, Lotus Seeds & Milk Foam ⭐ Best Seller', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 39000 }, { size_name: 'M', price: 49000 }, { size_name: 'L', price: 55000 }] },
    { id: 407, category_id: 43, name: 'Trà Thạch Đào', description: 'Peach Tea, Peach Jelly & Milk', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 39000 }, { size_name: 'M', price: 49000 }, { size_name: 'L', price: 55000 }] },
    { id: 408, category_id: 43, name: 'Trà Thanh Đào', description: 'Peach Tea & Lemongrass', image: null, is_available: 1, sizes: [{ size_name: 'S', price: 39000 }, { size_name: 'M', price: 49000 }, { size_name: 'L', price: 55000 }] }
  ]
};

const INITIAL_STORES = [HOGI_STORE, KATINAT_STORE, KAMIN_STORE, HIGHLANDS_STORE];

const todayDateStr = new Date().toISOString().split('T')[0];

const INITIAL_SESSIONS = [
  {
    id: 1,
    date: todayDateStr,
    store_id: 1,
    status: 'OPEN',
    cutoff_time: '11:30',
    recipient_name: 'Nguyễn Tam Giác (Lễ Tân)',
    recipient_phone: '0969.487.712',
    delivery_address: DEFAULT_DELIVERY_ADDRESS,
    delivery_time: '10:30',
    delivery_note: 'Giao nhanh trước 10:30',
    store_name: 'HOGI COFFEE & TEA',
    store_logo: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80'
  }
];

const INITIAL_ORDERS = [];

const INITIAL_SETTINGS = {
  admin_password: 'admin123',
  subsidy_enabled: '1',
  subsidy_amount_per_person: '20000',
  message_template: `ORDER NƯỚC - {STORE_NAME}
Ngày: {DATE}

{ORDER_ITEMS}

TỔNG: {TOTAL_CUPS} LY
TỔNG TIỀN: {TOTAL_AMOUNT}đ

THÔNG TIN GIAO HÀNG
Người nhận: {RECIPIENT_NAME}
SĐT: {RECIPIENT_PHONE}
Địa chỉ: {DELIVERY_ADDRESS}
Giờ giao: {DELIVERY_TIME}
Ghi chú: {DELIVERY_NOTE}`
};

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function initOfflineStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    saveData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STORES)) {
    saveData(STORAGE_KEYS.STORES, INITIAL_STORES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    saveData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    saveData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
}

export const offlineStorage = {
  loginAdmin: (password) => {
    initOfflineStorage();
    const settings = loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (password === settings.admin_password) {
      return { success: true, token: 'admin-token-secret-session' };
    }
    throw new Error('Mật khẩu Admin không chính xác!');
  },

  getSettings: () => {
    initOfflineStorage();
    return loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSubsidy: (enabled, amount) => {
    initOfflineStorage();
    const settings = loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    settings.subsidy_enabled = enabled ? '1' : '0';
    settings.subsidy_amount_per_person = String(amount || 0);
    saveData(STORAGE_KEYS.SETTINGS, settings);
    return { success: true, message: 'Cập nhật trợ giá thành công!' };
  },

  getEmployees: () => {
    initOfflineStorage();
    return loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  createEmployee: (emp) => {
    initOfflineStorage();
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmp = {
      id: newId,
      code: emp.code || `NV${String(newId).padStart(3, '0')}`,
      name: emp.name,
      is_active: 1
    };
    employees.push(newEmp);
    saveData(STORAGE_KEYS.EMPLOYEES, employees);
    return newEmp;
  },

  updateEmployee: (id, emp) => {
    initOfflineStorage();
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const idx = employees.findIndex(e => e.id === Number(id));
    if (idx > -1) {
      employees[idx] = { ...employees[idx], ...emp };
      saveData(STORAGE_KEYS.EMPLOYEES, employees);
      return employees[idx];
    }
    throw new Error('Không tìm thấy nhân viên');
  },

  toggleEmployeeActive: (id) => {
    initOfflineStorage();
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    const idx = employees.findIndex(e => e.id === Number(id));
    if (idx > -1) {
      employees[idx].is_active = employees[idx].is_active === 1 ? 0 : 1;
      saveData(STORAGE_KEYS.EMPLOYEES, employees);
      return { id: Number(id), is_active: employees[idx].is_active };
    }
    throw new Error('Không tìm thấy nhân viên');
  },

  deleteEmployee: (id) => {
    initOfflineStorage();
    let employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    employees = employees.filter(e => e.id !== Number(id));
    saveData(STORAGE_KEYS.EMPLOYEES, employees);
    return { success: true, id: Number(id) };
  },

  getStores: () => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    return stores.map(s => ({
      ...s,
      productCount: s.products ? s.products.length : 0
    }));
  },

  getStore: (id) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const store = stores.find(s => s.id === Number(id));
    if (!store) throw new Error('Không tìm thấy quán');
    return store;
  },

  createStore: (store) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const newId = stores.length > 0 ? Math.max(...stores.map(s => s.id)) + 1 : 1;
    const newStore = {
      id: newId,
      name: store.name,
      logo: store.logo || null,
      cover_image: store.cover_image || null,
      address: store.address || DEFAULT_DELIVERY_ADDRESS,
      phone: store.phone || '',
      note: store.note || '',
      is_active: 1,
      delivery: {
        recipient_name: '',
        recipient_phone: '',
        delivery_address: DEFAULT_DELIVERY_ADDRESS,
        delivery_time: '10:30',
        delivery_note: ''
      },
      menuFiles: [],
      categories: [{ id: 1, name: 'Cà Phê' }, { id: 2, name: 'Trà Sữa' }],
      toppings: [{ id: 1, topping_name: 'Trân Châu', price: 6000, is_available: 1 }],
      products: []
    };
    stores.push(newStore);
    saveData(STORAGE_KEYS.STORES, stores);
    return newStore;
  },

  updateStore: (id, storeData) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(id));
    if (idx > -1) {
      stores[idx] = { ...stores[idx], ...storeData };
      saveData(STORAGE_KEYS.STORES, stores);
      return stores[idx];
    }
    throw new Error('Không tìm thấy quán');
  },

  deleteStore: (id) => {
    initOfflineStorage();
    let stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    stores = stores.filter(s => s.id !== Number(id));
    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true, id: Number(id) };
  },

  updateDefaultDelivery: (storeId, delivery) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(storeId));
    if (idx > -1) {
      stores[idx].delivery = { ...stores[idx].delivery, ...delivery };
      saveData(STORAGE_KEYS.STORES, stores);
      return { success: true, message: 'Đã cập nhật thông tin giao hàng mặc định!' };
    }
    throw new Error('Không tìm thấy quán');
  },

  addMenuFileUrl: (storeId, url, name) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(storeId));
    if (idx > -1) {
      const pageNum = (stores[idx].menuFiles ? stores[idx].menuFiles.length : 0) + 1;
      const fileObj = {
        id: Date.now(),
        file_name: name || `Trang menu ${pageNum}`,
        file_path: url,
        page_number: pageNum
      };
      if (!stores[idx].menuFiles) stores[idx].menuFiles = [];
      stores[idx].menuFiles.push(fileObj);
      saveData(STORAGE_KEYS.STORES, stores);
      return fileObj;
    }
    throw new Error('Không tìm thấy quán');
  },

  deleteMenuFile: (fileId) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.menuFiles) {
        store.menuFiles = store.menuFiles.filter(f => f.id !== Number(fileId));
      }
    }
    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true, fileId: Number(fileId) };
  },

  getProductsByStore: (storeId) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const store = stores.find(s => s.id === Number(storeId));
    if (!store) return { categories: [], products: [], toppings: [] };
    return {
      categories: store.categories || [],
      products: store.products || [],
      toppings: store.toppings || []
    };
  },

  createProduct: (product) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(product.store_id));
    if (idx > -1) {
      const prods = stores[idx].products || [];
      const newId = Date.now();
      const newProd = {
        id: newId,
        category_id: product.category_id || null,
        name: product.name,
        description: product.description || '',
        image: product.image || null,
        is_available: 1,
        sizes: product.sizes || [{ size_name: 'M', price: 25000 }]
      };
      prods.push(newProd);
      stores[idx].products = prods;
      saveData(STORAGE_KEYS.STORES, stores);
      return newProd;
    }
    throw new Error('Không tìm thấy quán');
  },

  updateProduct: (id, product) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.products) {
        const pIdx = store.products.findIndex(p => p.id === Number(id));
        if (pIdx > -1) {
          store.products[pIdx] = { ...store.products[pIdx], ...product };
          saveData(STORAGE_KEYS.STORES, stores);
          return store.products[pIdx];
        }
      }
    }
    throw new Error('Không tìm thấy sản phẩm');
  },

  toggleProductAvailable: (id) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.products) {
        const pIdx = store.products.findIndex(p => p.id === Number(id));
        if (pIdx > -1) {
          const newStatus = store.products[pIdx].is_available === 1 ? 0 : 1;
          store.products[pIdx].is_available = newStatus;
          saveData(STORAGE_KEYS.STORES, stores);
          return { id: Number(id), is_available: newStatus };
        }
      }
    }
    throw new Error('Không tìm thấy sản phẩm');
  },

  deleteProduct: (id) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.products) {
        store.products = store.products.filter(p => p.id !== Number(id));
      }
    }
    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true, id: Number(id) };
  },

  createCategory: (store_id, name) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(store_id));
    if (idx > -1) {
      const catObj = { id: Date.now(), name };
      if (!stores[idx].categories) stores[idx].categories = [];
      stores[idx].categories.push(catObj);
      saveData(STORAGE_KEYS.STORES, stores);
      return catObj;
    }
    throw new Error('Không tìm thấy quán');
  },

  updateCategory: (id, name) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.categories) {
        const cIdx = store.categories.findIndex(c => c.id === Number(id));
        if (cIdx > -1) {
          store.categories[cIdx].name = name;
          saveData(STORAGE_KEYS.STORES, stores);
          return store.categories[cIdx];
        }
      }
    }
    throw new Error('Không tìm thấy danh mục');
  },

  deleteCategory: (id) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.categories) {
        store.categories = store.categories.filter(c => c.id !== Number(id));
        if (store.products) {
          store.products.forEach(p => {
            if (p.category_id === Number(id)) p.category_id = null;
          });
        }
      }
    }
    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true, id: Number(id) };
  },

  createTopping: (store_id, topping_name, price) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(store_id));
    if (idx > -1) {
      const topObj = { id: Date.now(), topping_name, price: Number(price), is_available: 1 };
      if (!stores[idx].toppings) stores[idx].toppings = [];
      stores[idx].toppings.push(topObj);
      saveData(STORAGE_KEYS.STORES, stores);
      return topObj;
    }
    throw new Error('Không tìm thấy quán');
  },

  deleteTopping: (id) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    for (const store of stores) {
      if (store.toppings) {
        store.toppings = store.toppings.filter(t => t.id !== Number(id));
      }
    }
    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true };
  },

  parseOcrMenu: (storeId) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const store = stores.find(s => s.id === Number(storeId));
    const storeName = store ? store.name : 'Quán';
    return {
      success: true,
      message: 'Phân tích menu thành công!',
      draftItems: [
        { category: 'CÀ PHÊ', name: `${storeName} Đặc Biệt`, size: 'M', price: 45000 },
        { category: 'TRÀ SỮA', name: 'Trà Sữa Oolong Nướng', size: 'M', price: 45000 }
      ]
    };
  },

  importExcelMenu: (storeId, items) => {
    initOfflineStorage();
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const idx = stores.findIndex(s => s.id === Number(storeId));
    if (idx === -1) throw new Error('Không tìm thấy quán');

    const store = stores[idx];
    if (!store.categories) store.categories = [];
    if (!store.products) store.products = [];

    let count = 0;
    for (const row of items) {
      const catName = row['Danh mục'] || row['Category'] || row['category'] || 'Khác';
      const prodName = row['Tên món'] || row['Món'] || row['name'];
      const sizeName = row['Size'] || row['size'] || 'M';
      const price = Number(row['Giá'] || row['price'] || 25000);

      if (!prodName) continue;

      let cat = store.categories.find(c => c.name === catName);
      if (!cat) {
        cat = { id: Date.now() + Math.random(), name: catName };
        store.categories.push(cat);
      }

      let prod = store.products.find(p => p.name === prodName);
      if (!prod) {
        prod = {
          id: Date.now() + Math.random(),
          category_id: cat.id,
          name: prodName,
          description: '',
          image: null,
          is_available: 1,
          sizes: [{ size_name: sizeName, price }]
        };
        store.products.push(prod);
        count++;
      } else {
        const sIdx = prod.sizes.findIndex(s => s.size_name === sizeName);
        if (sIdx > -1) prod.sizes[sIdx].price = price;
        else prod.sizes.push({ size_name: sizeName, price });
      }
    }

    saveData(STORAGE_KEYS.STORES, stores);
    return { success: true, message: `Đã import thành công ${count} món mới!`, importedCount: count };
  },

  getTodaySession: () => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const todayStr = new Date().toISOString().split('T')[0];

    let session = sessions.find(s => s.date === todayStr);
    if (!session && sessions.length > 0) {
      session = sessions[0];
    }
    if (!session) return { active: false };

    const store = stores.find(s => s.id === session.store_id);
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).filter(o => o.session_id === session.id);
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES).filter(e => e.is_active);

    const totalCups = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
    const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      active: true,
      session: {
        ...session,
        store_name: store ? store.name : 'Quán Cà Phê',
        store_logo: store ? store.logo : null,
        store_phone: store ? store.phone : '',
        totalEmployees: employees.length,
        ordersCount: orders.length,
        totalCups,
        totalAmount,
        menuFiles: store ? store.menuFiles : []
      }
    };
  },

  openSession: (data) => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);
    const store = stores.find(s => s.id === Number(data.storeId));
    const todayStr = new Date().toISOString().split('T')[0];

    for (const s of sessions) {
      if (s.date === todayStr) s.status = 'CLOSED';
    }

    const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
    const newSession = {
      id: newId,
      date: todayStr,
      store_id: Number(data.storeId),
      status: 'OPEN',
      cutoff_time: data.cutoff_time || '11:00',
      recipient_name: data.recipient_name || store?.delivery?.recipient_name || '',
      recipient_phone: data.recipient_phone || store?.delivery?.recipient_phone || '',
      delivery_address: data.delivery_address || DEFAULT_DELIVERY_ADDRESS,
      delivery_time: data.delivery_time || '10:30',
      delivery_note: data.delivery_note || '',
      store_name: store ? store.name : 'Quán',
      store_logo: store ? store.logo : null
    };

    sessions.unshift(newSession);
    saveData(STORAGE_KEYS.SESSIONS, sessions);

    if (data.save_as_default && store) {
      store.delivery = {
        recipient_name: newSession.recipient_name,
        recipient_phone: newSession.recipient_phone,
        delivery_address: newSession.delivery_address,
        delivery_time: newSession.delivery_time,
        delivery_note: newSession.delivery_note
      };
      saveData(STORAGE_KEYS.STORES, stores);
    }

    return { success: true, message: `Đã mở phiên order thành công cho quán ${store?.name}!`, session: newSession };
  },

  closeSession: (sessionId) => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const session = sessions.find(s => s.id === Number(sessionId));
    if (session) session.status = 'CLOSED';
    saveData(STORAGE_KEYS.SESSIONS, sessions);
    return { success: true, message: 'Đã chốt đơn hôm nay!' };
  },

  reopenSession: (sessionId) => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const session = sessions.find(s => s.id === Number(sessionId));
    if (session) session.status = 'OPEN';
    saveData(STORAGE_KEYS.SESSIONS, sessions);
    return { success: true, message: 'Đã mở lại phiên order!' };
  },

  getTodayOrders: (sessionId) => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).filter(o => o.session_id === Number(sessionId));
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES).filter(e => e.is_active);

    const orderedEmpIds = orders.map(o => o.employee_id);
    const orderedList = orders.map(o => {
      const emp = employees.find(e => e.id === o.employee_id) || { name: 'Nhân viên', code: 'NV' };
      return {
        ...o,
        employee_name: emp.name,
        employee_code: emp.code,
        items: o.items.map(i => ({
          ...i,
          toppings: i.toppings_snapshot_json ? JSON.parse(i.toppings_snapshot_json) : []
        }))
      };
    });

    const notOrderedList = employees.filter(e => !orderedEmpIds.includes(e.id));

    const totalCups = orderedList.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
    const totalAmount = orderedList.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      session: sessions.find(s => s.id === Number(sessionId)),
      stats: {
        totalEmployees: employees.length,
        orderedCount: orderedList.length,
        notOrderedCount: notOrderedList.length,
        totalCups,
        totalAmount
      },
      orderedList,
      notOrderedList
    };
  },

  getMyTodayOrder: (sessionId, employeeId) => {
    initOfflineStorage();
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find(o => o.session_id === Number(sessionId) && o.employee_id === Number(employeeId));
    if (!order) return { hasOrder: false };

    return {
      hasOrder: true,
      order: {
        ...order,
        items: order.items.map(i => ({
          ...i,
          toppings: i.toppings_snapshot_json ? JSON.parse(i.toppings_snapshot_json) : []
        }))
      }
    };
  },

  getRecentOrders: (employeeId) => {
    initOfflineStorage();
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).filter(o => o.employee_id === Number(employeeId));
    const recent = [];
    for (const o of orders) {
      for (const item of o.items) {
        recent.push({
          ...item,
          current_unit_price: item.unit_price_snapshot,
          current_is_available: 1,
          toppings: item.toppings_snapshot_json ? JSON.parse(item.toppings_snapshot_json) : []
        });
      }
    }
    return recent.slice(0, 8);
  },

  submitOrder: (data) => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const session = sessions.find(s => s.id === Number(data.sessionId));
    if (!session) throw new Error('Phiên order không tồn tại!');
    if (session.status === 'CLOSED') throw new Error('Phiên order hôm nay đã chốt!');

    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const existingIdx = orders.findIndex(o => o.session_id === Number(data.sessionId) && o.employee_id === Number(data.employeeId));

    let grandTotal = 0;
    const items = [];

    for (const item of data.items) {
      const unitPrice = Number(item.unit_price || 0);
      const toppings = item.toppings || [];
      const toppingTotal = toppings.reduce((sum, t) => sum + (t.price || 0), 0);
      const qty = item.quantity || 1;
      const subtotal = (unitPrice + toppingTotal) * qty;

      grandTotal += subtotal;
      items.push({
        id: Date.now() + Math.random(),
        product_name_snapshot: item.product_name,
        size_snapshot: item.size,
        unit_price_snapshot: unitPrice,
        sugar_option: item.sugar_option,
        ice_option: item.ice_option,
        toppings_snapshot_json: JSON.stringify(toppings),
        topping_price_snapshot: toppingTotal,
        quantity: qty,
        subtotal,
        note: item.note || ''
      });
    }

    const settings = loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const maxSubsidy = settings.subsidy_enabled === '1' ? Number(settings.subsidy_amount_per_person || 20000) : 0;
    const subsidy = Math.min(grandTotal, maxSubsidy);
    const pay = Math.max(0, grandTotal - subsidy);

    const orderObj = {
      id: existingIdx > -1 ? orders[existingIdx].id : Date.now(),
      session_id: Number(data.sessionId),
      employee_id: Number(data.employeeId),
      total_amount: grandTotal,
      subsidy_amount: subsidy,
      employee_pay_amount: pay,
      note: data.note || '',
      created_at: new Date().toISOString(),
      items
    };

    if (existingIdx > -1) {
      orders[existingIdx] = orderObj;
    } else {
      orders.push(orderObj);
    }

    saveData(STORAGE_KEYS.ORDERS, orders);
    return { success: true, message: existingIdx > -1 ? 'Cập nhật đơn hàng thành công!' : 'Đặt nước thành công! Cảm ơn bạn.', order: orderObj };
  },

  deleteOrder: (id) => {
    initOfflineStorage();
    let orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    orders = orders.filter(o => o.id !== Number(id));
    saveData(STORAGE_KEYS.ORDERS, orders);
    return { success: true, message: 'Đã xóa đơn hàng!' };
  },

  getHistory: () => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const stores = loadData(STORAGE_KEYS.STORES, INITIAL_STORES);

    return sessions.map(s => {
      const sOrders = orders.filter(o => o.session_id === s.id);
      const store = stores.find(st => st.id === s.store_id);
      const totalCups = sOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
      const totalAmount = sOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const totalSubsidy = sOrders.reduce((sum, o) => sum + o.subsidy_amount, 0);

      return {
        ...s,
        store_name: store ? store.name : 'Quán Cà Phê',
        store_logo: store ? store.logo : null,
        ordersCount: sOrders.length,
        totalCups,
        totalAmount,
        totalSubsidy,
        totalEmployeePay: totalAmount - totalSubsidy
      };
    });
  },

  getPersonalStats: (employeeId) => {
    initOfflineStorage();
    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).filter(o => o.employee_id === Number(employeeId));
    const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalSubsidy = orders.reduce((sum, o) => sum + o.subsidy_amount, 0);

    let totalCups = 0;
    const drinkCount = {};
    for (const o of orders) {
      for (const i of o.items) {
        totalCups += i.quantity;
        drinkCount[i.product_name_snapshot] = (drinkCount[i.product_name_snapshot] || 0) + i.quantity;
      }
    }

    let favoriteDrink = 'Chưa có';
    let maxCount = 0;
    for (const [drink, count] of Object.entries(drinkCount)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteDrink = drink;
      }
    }

    return {
      totalOrders: orders.length,
      totalCups,
      totalSpent,
      totalSubsidy,
      totalPay: totalSpent - totalSubsidy,
      favoriteDrink: maxCount > 0 ? `${favoriteDrink} (${maxCount} lần)` : 'Chưa có',
      orders
    };
  },

  getFormattedMessage: (sessionId, mode = 'GỌN') => {
    initOfflineStorage();
    const sessions = loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const session = sessions.find(s => s.id === Number(sessionId));
    if (!session) throw new Error('Không tìm thấy phiên');

    const orders = loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).filter(o => o.session_id === Number(sessionId));
    const employees = loadData(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);

    const allItems = [];
    let totalCups = 0;
    let totalAmount = 0;

    for (const o of orders) {
      const emp = employees.find(e => e.id === o.employee_id);
      for (const i of o.items) {
        totalCups += i.quantity;
        totalAmount += i.subtotal;
        allItems.push({
          ...i,
          employee_name: emp ? emp.name : 'NV',
          toppings: i.toppings_snapshot_json ? JSON.parse(i.toppings_snapshot_json) : []
        });
      }
    }

    let itemsText = '';
    if (mode === 'GỌN') {
      const groupMap = new Map();
      for (const item of allItems) {
        const topStr = item.toppings.map(t => `+ ${t.name}`).join(' | ');
        const key = `${item.product_name_snapshot}___${item.size_snapshot}___${item.sugar_option}___${item.ice_option}___${topStr}___${item.note}`;
        
        if (!groupMap.has(item.product_name_snapshot)) {
          groupMap.set(item.product_name_snapshot, new Map());
        }
        const subMap = groupMap.get(item.product_name_snapshot);

        if (subMap.has(key)) {
          subMap.get(key).qty += item.quantity;
        } else {
          subMap.set(key, {
            size: item.size_snapshot,
            sugar: item.sugar_option,
            ice: item.ice_option,
            topStr,
            note: item.note,
            qty: item.quantity
          });
        }
      }

      let pIdx = 1;
      const pLines = [];
      for (const [pName, subMap] of groupMap.entries()) {
        let pCups = 0;
        const vLines = [];
        for (const v of subMap.values()) {
          pCups += v.qty;
          let l = `• ${v.qty} × ${v.size} | ${v.sugar} đường | ${v.ice}`;
          if (v.topStr) l += ` | ${v.topStr}`;
          if (v.note) l += ` (${v.note})`;
          vLines.push(l);
        }
        pLines.push(`${pIdx++}. ${pName.toUpperCase()} - ${pCups} LY\n${vLines.join('\n')}`);
      }
      itemsText = pLines.join('\n\n');
    } else {
      itemsText = allItems.map((item, idx) => `${idx+1}. ${item.product_name_snapshot} (${item.quantity} ly) - Size ${item.size_snapshot} | ${item.sugar_option} đường | ${item.ice_option}`).join('\n');
    }

    const [y, m, d] = session.date.split('-');
    const dateStr = `${d}/${m}/${y}`;

    const msg = `ORDER NƯỚC - ${session.store_name.toUpperCase()}
Ngày: ${dateStr}

${itemsText}

TỔNG: ${totalCups} LY
TỔNG TIỀN: ${new Intl.NumberFormat('vi-VN').format(totalAmount)}đ

THÔNG TIN GIAO HÀNG
Người nhận: ${session.recipient_name}
SĐT: ${session.recipient_phone}
Địa chỉ: ${session.delivery_address}
Giờ giao: ${session.delivery_time}
Ghi chú: ${session.delivery_note}`;

    return { success: true, totalCups, totalAmount, message: msg };
  }
};
