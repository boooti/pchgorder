import db, { initDb } from './db.js';

console.log('🌱 Seeding FULL Digitize Menus for HOGI, KATINAT, KAMIN and HIGHLANDS COFFEE...');
initDb();

// Clear existing tables
db.exec('DELETE FROM order_items');
db.exec('DELETE FROM orders');
db.exec('DELETE FROM daily_order_sessions');
db.exec('DELETE FROM product_toppings');
db.exec('DELETE FROM product_sizes');
db.exec('DELETE FROM products');
db.exec('DELETE FROM categories');
db.exec('DELETE FROM store_menu_files');
db.exec('DELETE FROM delivery_profiles');
db.exec('DELETE FROM stores');
db.exec('DELETE FROM employees');

// Default Delivery Address for all stores
const DEFAULT_DELIVERY_ADDRESS = 'Cổng sau công ty Phú Cường - Số 1 Hà Huy Tập, Rạch Giá';

// 1. Official 38 Employees
const employeesData = [
  { code: '889966', name: 'Huỳnh Thái Lel', department: 'Văn phòng' },
  { code: '009544', name: 'Lâm Hoàng Lam', department: 'Văn phòng' },
  { code: '995381', name: 'Vũ Đăng Trình', department: 'BQLDA' },
  { code: '699298', name: 'Nguyễn Tam Giác', department: 'BQLDA' },
  { code: '006620', name: 'Trần Trung Tiến', department: 'BQLDA' },
  { code: '013137', name: 'Trương Vĩnh Thế', department: 'BQLDA' },
  { code: '009044', name: 'Du Vinh Huê', department: 'BQLDA' },
  { code: '000276', name: 'Lê Minh Đăng', department: 'BQLDA' },
  { code: '010861', name: 'Phan Văn Nhân', department: 'BQLDA' },
  { code: '000088', name: 'Đoàn Tuấn Anh', department: 'BQLDA' },
  { code: '000485', name: 'Nguyễn Văn Chiến', department: 'BQLDA' },
  { code: '010111', name: 'Trần Thanh Tiến', department: 'BQLDA' },
  { code: '690806', name: 'Nguyễn Ngọc Nguyên', department: 'Văn phòng' },
  { code: '708891', name: 'Trần Thị Hương', department: 'Văn phòng' },
  { code: '868109', name: 'Trần Thị Trinh', department: 'Văn phòng' },
  { code: '012781', name: 'Hồ Huy Toàn', department: 'Văn phòng' },
  { code: '015242', name: 'Lê Long Giang', department: 'Văn phòng' },
  { code: '007659', name: 'Thị Yến Linh', department: 'Văn phòng' },
  { code: '163153', name: 'Nguyễn Văn Công', department: 'Văn phòng' },
  { code: '000227', name: 'Trần Văn Nhựt Cường', department: 'Văn phòng' },
  { code: '153954', name: 'Trương Đình Thi', department: 'Văn phòng' },
  { code: '362279', name: 'Trần Văn Sua', department: 'Văn phòng' },
  { code: '012979', name: 'Nguyễn Thị Minh Thư', department: 'Văn phòng' },
  { code: '935138', name: 'Hưng Tấn Đạt', department: 'Văn phòng' },
  { code: '991783', name: 'Nguyễn Hồng Ái', department: 'Văn phòng' },
  { code: '014314', name: 'Đồng Hữu Phú', department: 'Văn phòng' },
  { code: '007925', name: 'Trần Minh Đăng', department: 'Văn phòng' },
  { code: '000334', name: 'Dư Văn Đạt', department: 'Văn phòng' },
  { code: '008209', name: 'Nguyễn Kiều Tiên', department: 'Văn phòng' },
  { code: '003115', name: 'Phạm Bình An', department: 'Văn phòng' },
  { code: '006262', name: 'Huỳnh Tấn Lộc', department: 'Văn phòng' },
  { code: '010743', name: 'Lâm Thiên Phú', department: 'Văn phòng' },
  { code: '273552', name: 'Trần Thị Diễm Linh', department: 'Văn phòng' },
  { code: '821653', name: 'Vũ Huỳnh Như Ý', department: 'Văn phòng' },
  { code: '662750', name: 'Nguyễn Phương Loan', department: 'Văn phòng' },
  { code: '012565', name: 'Trần Võ Phương Nghi', department: 'Văn phòng' },
  { code: '024378', name: 'Trần Thị Nhung', department: 'Văn phòng' },
  { code: '015218', name: 'Đào Thị Huyền Trân', department: 'Văn phòng' }
];

const insertEmp = db.prepare('INSERT INTO employees (code, name, department) VALUES (?, ?, ?)');
const empIds = [];
for (const emp of employeesData) {
  const info = insertEmp.run(emp.code, emp.name, emp.department);
  empIds.push({ id: info.lastInsertRowid, ...emp });
}

// 2. Stores Setup
const insertStore = db.prepare(`
  INSERT INTO stores (name, logo, cover_image, address, phone, note)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const insertDelivery = db.prepare(`
  INSERT INTO delivery_profiles (store_id, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// STORE 1: HOGI COFFEE & TEA
const storeHogiRes = insertStore.run(
  'HOGI COFFEE & TEA',
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80',
  '/uploads/menus/hogi_menu_1.jpg',
  'L4-C27 Phan Thị Ràng, P. Rạch Giá',
  '0969.487.712',
  'Menu áp dụng dịp Tết 2026. Đơn vị tính: 1.000 đồng'
);
const storeHogiId = storeHogiRes.lastInsertRowid;
insertDelivery.run(storeHogiId, 'Nguyễn Tam Giác (Lễ Tân)', '0969.487.712', DEFAULT_DELIVERY_ADDRESS, '10:30', 'Giao nhanh trước 10:30');

// STORE 2: KATINAT SAIGON KAFE
const storeKatinatRes = insertStore.run(
  'KATINAT Saigon Kafe',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80',
  '/uploads/menus/katinat_menu_1.jpg',
  '120 Trương Định, Q.3, TP.HCM',
  '028 7300 1008',
  'Giá x 1.000đ (Đã bao gồm VAT)'
);
const storeKatinatId = storeKatinatRes.lastInsertRowid;
insertDelivery.run(storeKatinatId, 'Trần Thị Hương', '0901 234 567', DEFAULT_DELIVERY_ADDRESS, '10:30', 'Mang tới cổng sau giao bảo vệ / lễ tân');

// STORE 3: KAMIN COFFEE
const storeKaminRes = insertStore.run(
  'KAMIN COFFEE',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80',
  '/uploads/menus/kamin_menu_1.jpg',
  'F1-17 Hoàng Văn Thụ',
  '0844482225',
  'Đơn vị tính: 1.000đ. ⭐ Best Seller. Có các size M, L, XL, bánh bao & combo tiết kiệm.'
);
const storeKaminId = storeKaminRes.lastInsertRowid;
insertDelivery.run(storeKaminId, 'Nguyễn Tam Giác (Lễ Tân)', '0844482225', DEFAULT_DELIVERY_ADDRESS, '10:30', 'Giao nhanh đúng hẹn');

// STORE 4: HIGHLANDS COFFEE
const storeHighlandsRes = insertStore.run(
  'HIGHLANDS COFFEE',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
  '/uploads/menus/highlands_menu_1.jpg',
  'Số 1 Hà Huy Tập, P. Rạch Giá',
  '1900 1755',
  'Đơn vị tính: 1.000 VNĐ. Có các size Nhỏ (S), Vừa (M), Lớn (L).'
);
const storeHighlandsId = storeHighlandsRes.lastInsertRowid;
insertDelivery.run(storeHighlandsId, 'Nguyễn Tam Giác (Lễ Tân)', '1900 1755', DEFAULT_DELIVERY_ADDRESS, '10:30', 'Giao tới cổng sau công ty Phú Cường');

// 3. Menu Files
const insertMenuFile = db.prepare(`
  INSERT INTO store_menu_files (store_id, file_name, file_path, file_type, page_number)
  VALUES (?, ?, ?, ?, ?)
`);
insertMenuFile.run(storeHogiId, 'Menu HOGI COFFEE & TEA - Trang 1.jpg', '/uploads/menus/hogi_menu_1.jpg', 'image/jpeg', 1);
insertMenuFile.run(storeKatinatId, 'Menu KATINAT Saigon Kafe - Trang 1.jpg', '/uploads/menus/katinat_menu_1.jpg', 'image/jpeg', 1);
insertMenuFile.run(storeKaminId, 'Menu KAMIN COFFEE - Trang 1.jpg', '/uploads/menus/kamin_menu_1.jpg', 'image/jpeg', 1);
insertMenuFile.run(storeHighlandsId, 'Menu HIGHLANDS COFFEE - Trang 1.jpg', '/uploads/menus/highlands_menu_1.jpg', 'image/jpeg', 1);

// Helper queries
const insertCat = db.prepare('INSERT INTO categories (store_id, name, sort_order) VALUES (?, ?, ?)');
const insertProd = db.prepare(`
  INSERT INTO products (store_id, category_id, name, description, image, is_available, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertSize = db.prepare('INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)');
const insertTopping = db.prepare('INSERT INTO product_toppings (store_id, topping_name, price, is_available) VALUES (?, ?, ?, 1)');

// ==========================================
// 1. FULL HOGI COFFEE & TEA (79 DRINKS)
// ==========================================
insertTopping.run(storeHogiId, 'Trân Châu Đen', 6000);
insertTopping.run(storeHogiId, 'Sương Sáo', 6000);
insertTopping.run(storeHogiId, 'Pudding', 6000);
insertTopping.run(storeHogiId, 'Trân Châu Trắng', 6000);
insertTopping.run(storeHogiId, 'Ô Long 3Q', 6000);
insertTopping.run(storeHogiId, 'Macchiato', 6000);
insertTopping.run(storeHogiId, 'Đậu Đỏ', 6000);
insertTopping.run(storeHogiId, 'Hạt Chia', 6000);
insertTopping.run(storeHogiId, 'Kem Trứng', 8000);
insertTopping.run(storeHogiId, 'Hạt Sen', 8000);
insertTopping.run(storeHogiId, 'Hạt Đác', 8000);
insertTopping.run(storeHogiId, 'Củ Năng', 8000);
insertTopping.run(storeHogiId, 'Trái Cây Thêm', 8000);

const hogicats = [
  { name: 'CÀ PHÊ', prods: [
    { name: '1. Cà phê đen đá', price: 17000 },
    { name: '2. Cà phê sữa đá', price: 20000 },
    { name: '3. Cà phê kem muối', price: 22000 },
    { name: '4. Cà phê kem trứng', price: 24000 },
    { name: '5. Bạc xỉu', price: 20000 },
    { name: '6. Cà phê sữa tươi', price: 20000 },
    { name: '7. Cà phê sữa tươi sương sáo', price: 22000 },
    { name: '8. Phindi hạnh nhân', price: 25000 },
    { name: '9. Cà phê caramel', price: 24000 }
  ]},
  { name: 'CACAO', prods: [
    { name: '10. Cà phê cacao', price: 17000 },
    { name: '11. Cà phê cacao sữa đá', price: 20000 },
    { name: '12. Cacao đá', price: 15000 },
    { name: '13. Cacao sữa đá', price: 18000 },
    { name: '14. Cacao sữa tươi', price: 18000 },
    { name: '15. Cacao kem muối', price: 20000 },
    { name: '16. Cacao kem trứng', price: 22000 },
    { name: '17. Latte Chocolate', price: 22000 }
  ]},
  { name: 'MATCHA NHẬT BẢN', prods: [
    { name: '18. Latte Matcha', price: 25000 },
    { name: '19. Latte Matcha Caramel', price: 27000 },
    { name: '20. Latte Matcha Coco', price: 27000 },
    { name: '21. Latte Matcha đậu đỏ', price: 29000 },
    { name: '22. Latte Matcha Macchiato', price: 29000 },
    { name: '23. Latte Matcha Coffee', price: 29000 },
    { name: '24. Latte Matcha Strawberry (dâu)', price: 32000, desc: 'Món đặc biệt ⭐' },
    { name: '25. Latte Matcha Blueberry (việt quất)', price: 32000, desc: 'Món đặc biệt ⭐' },
    { name: '26. Latte Matcha Mango (xoài)', price: 32000, desc: 'Món đặc biệt ⭐' },
    { name: '27. Latte Matcha Peach (đào)', price: 32000, desc: 'Món đặc biệt ⭐' }
  ]},
  { name: 'TRÀ THANH MÁT', prods: [
    { name: '28. Trà tắc - Trà chanh', price: 15000 },
    { name: '29. Trà tắc mật ong', price: 20000 },
    { name: '30. Trà chanh mật ong', price: 20000 },
    { name: '31. Trà hạt chia sả tắc/chanh', price: 20000 },
    { name: '32. Trà mật ong hạt chia sả tắc/chanh', price: 24000 },
    { name: '33. Trà chanh dây', price: 20000 },
    { name: '34. Cam vắt', price: 17000 },
    { name: '35. Trà đường (trà xanh hoa nhài)', price: 12000 }
  ]},
  { name: 'YOGURT (SỮA CHUA)', prods: [
    { name: 'Yogurt Trái cây nhiệt đới', price: 27000 },
    { name: 'Yogurt Việt quất', price: 27000 },
    { name: 'Yogurt Dâu tây', price: 27000 },
    { name: 'Yogurt Mãng cầu', price: 27000 },
    { name: 'Yogurt Đào', price: 27000 },
    { name: 'Yogurt Ổi hồng', price: 27000 },
    { name: 'Yogurt Dâu tằm', price: 27000 },
    { name: 'Yogurt Trân châu đường đen', price: 27000 },
    { name: 'Yogurt Hạt đác', price: 27000 }
  ]},
  { name: 'MÓN MỚI (NEW)', prods: [
    { name: '36. Trà mùa xuân (Phiên bản đặc biệt)', price: 30000, desc: 'Phiên bản đặc biệt ⭐' },
    { name: '37. Trà táo đỏ', price: 30000 },
    { name: '38. Trà hoa hibiscus', price: 27000 },
    { name: '39. Hồng trà Bá Tước', price: 22000 },
    { name: '40. Hồng trà Bá Tước kem trứng', price: 27000 },
    { name: '41. Hồng trà sữa Bá Tước', price: 27000 },
    { name: '42. Hồng trà sữa Bá Tước kem trứng', price: 30000 },
    { name: '43. Bơ sữa trân châu đường đen', price: 32000 },
    { name: '44. Bơ già dừa non', price: 30000 },
    { name: '45. Trà mận (Phiên bản theo mùa)', price: 27000, desc: 'Theo mùa ⭐' },
    { name: '46. Trà kiwi', price: 30000 },
    { name: '47. Trà lựu đỏ', price: 30000 }
  ]},
  { name: 'TRÀ SỮA ĐẬM VỊ', prods: [
    { name: '48. Trà sữa Phúc Long', price: 27000 },
    { name: '49. Trà sữa Ôlong', price: 27000 },
    { name: '50. Trà sữa Ôlong nhài', price: 27000 },
    { name: '51. Trà sữa Matcha Nhật Bản', price: 30000 },
    { name: '52. Trà sữa Socola', price: 29000 },
    { name: '53. Trà sữa Thái đỏ (Cha Thai)', price: 27000 },
    { name: '54. Sữa tươi trân châu đường đen', price: 27000 }
  ]},
  { name: 'TRÀ SÁNG TẠO', prods: [
    { name: '55. Trà đào', price: 25000 },
    { name: '56. Trà đào cam sả', price: 30000 },
    { name: '57. Trà vải', price: 27000 },
    { name: '58. Trà thạch vải', price: 32000 },
    { name: '59. Trà sen vàng', price: 30000 },
    { name: '60. Trà ô long hạt sen lá nếp', price: 27000 },
    { name: '61. Trà ô long sen nhãn', price: 27000 },
    { name: '62. Trà đen macchiato', price: 27000 },
    { name: '63. Trà ôlong macchiato', price: 27000 },
    { name: '64. Hồng trà Phúc Long macchiato', price: 27000 },
    { name: '65. Hồng trà Bá Tước macchiato', price: 27000 },
    { name: '66. Hồng trà sủi bọt', price: 20000 }
  ]},
  { name: 'TRÀ TRÁI CÂY', prods: [
    { name: '67. Trà trái cây nhiệt đới', price: 25000 },
    { name: '68. Trà mãng cầu', price: 27000 },
    { name: '69. Trà ổi hồng', price: 25000 },
    { name: '70. Trà dâu', price: 25000 },
    { name: '71. Trà dâu tằm', price: 27000 },
    { name: '72. Trà lài đắc thơm', price: 27000 },
    { name: '73. Trà dưa lưới', price: 25000 },
    { name: '74. Trà xoài chanh leo', price: 25000 },
    { name: '75. Trà việt quất', price: 27000 }
  ]},
  { name: 'BÍ ĐẠO', prods: [
    { name: '76. Sâm bí đao', price: 20000 },
    { name: '77. Hồng trà bí đao', price: 22000 },
    { name: '78. Trà ô long bí đao', price: 22000 },
    { name: '79. Trà xanh bí đao', price: 22000 }
  ]}
];

let catSort1 = 1;
for (const catData of hogicats) {
  const cId = insertCat.run(storeHogiId, catData.name, catSort1++).lastInsertRowid;
  let pSort = 1;
  for (const p of catData.prods) {
    const pId = insertProd.run(storeHogiId, cId, p.name, p.desc || '', '', 1, pSort++).lastInsertRowid;
    insertSize.run(pId, 'M', p.price);
  }
}

// ==========================================
// 2. FULL KATINAT SAIGON KAFE (SPELLING: MÊ)
// ==========================================
insertTopping.run(storeKatinatId, 'Topping Tàu Hũ (80g)', 15000);
insertTopping.run(storeKatinatId, 'Trân Châu Phô Mai Dẻo (4 viên)', 15000);
insertTopping.run(storeKatinatId, 'Trân Châu Trắng (50g)', 10000);
insertTopping.run(storeKatinatId, 'Huyền Châu Đường Mặt (50g)', 15000);
insertTopping.run(storeKatinatId, 'Kem Sữa Phô Mai Macchiato (80ml)', 15000);
insertTopping.run(storeKatinatId, 'Bánh Flan (1 cái)', 15000);
insertTopping.run(storeKatinatId, 'Thạch Hồng Đài (50g)', 12000);
insertTopping.run(storeKatinatId, 'Thạch Bưởi Aiyu (100g)', 12000);

const katinatcats = [
  { name: 'CÀ PHÊ PHIN MÊ', prods: [
    { name: 'Mê Sữa Đá (Vietnamese White Coffee)', desc: 'Best Seller ⭐', sizes: [{ name: 'Nóng', price: 39000 }, { name: 'S', price: 39000 }, { name: 'M', price: 55000 }] },
    { name: 'Mê Đen Đá (Vietnamese Black Coffee)', desc: '', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'S', price: 35000 }, { name: 'M', price: 49000 }] },
    { name: 'Mê Xỉu (Vietnamese Coffee & Fresh Milk)', desc: '', sizes: [{ name: 'Nóng', price: 39000 }, { name: 'S', price: 39000 }, { name: 'M', price: 55000 }] },
    { name: 'Mê Dừa Non (Young Coconut Coffee)', desc: 'Nhiều dừa dẻo thơm ngon', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 60000 }] }
  ]},
  { name: 'CÀ PHÊ ESPRESSO', prods: [
    { name: 'Espresso Sữa Đá', desc: 'Best Seller ⭐', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'S', price: 35000 }, { name: 'M', price: 48000 }] },
    { name: 'Espresso Đen Đá', desc: '', sizes: [{ name: 'Nóng', price: 32000 }, { name: 'S', price: 32000 }, { name: 'M', price: 45000 }] },
    { name: 'Espresso Bạc Xỉu', desc: '', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'S', price: 35000 }, { name: 'M', price: 48000 }] },
    { name: 'Latte Baba Nana (Baba Nana Velvet Latte)', desc: '', sizes: [{ name: 'M', price: 59000 }] },
    { name: 'Latte Hạt Phí (Hazelnut Velvet Latte)', desc: '', sizes: [{ name: 'M', price: 59000 }] },
    { name: 'Latte Nguyên Bản (Original Latte)', desc: '', sizes: [{ name: 'Nóng', price: 50000 }, { name: 'M', price: 55000 }] },
    { name: 'Americano', desc: '', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'S', price: 35000 }] }
  ]},
  { name: 'TRÀ SỮA', prods: [
    { name: 'Thanh Hương Camellia (Camellia Fresh Milk Tea)', desc: 'Món Mới 🆕 - Trà sữa tươi Meiji thanh mát & lớp tàu hũ mát lành', sizes: [{ name: 'S', price: 50000 }, { name: 'M', price: 65000 }] },
    { name: 'Trà Sữa Chôm Chôm (Rambutan Milk Tea)', desc: 'Best Seller ⭐ - Tặng kèm chôm chôm mọng nước', sizes: [{ name: 'M', price: 60000 }] },
    { name: 'Oolong Ba Lá (Three Tea Leaves Oolong Milk Tea)', desc: '', sizes: [{ name: 'M', price: 45000 }, { name: 'L', price: 55000 }] },
    { name: 'Trà Sữa Oolong Nướng (Roasted Oolong Milk Tea)', desc: 'Best Seller ⭐ - Hương vị đậm đà thơm lừng', sizes: [{ name: 'M', price: 45000 }, { name: 'L', price: 55000 }] }
  ]},
  { name: 'PHONG VỊ MỚI (KATINAT SPECIAL)', prods: [
    { name: 'IKI Matcha Tàu Hũ', desc: 'Món Mới 🆕 Best Seller ⭐ - Matcha Nhật thơm mịn với tàu hũ', sizes: [{ name: 'M', price: 69000 }] },
    { name: 'IKI Matcha Latte', desc: 'Món Mới 🆕 - Matcha Latte nguyên chất', sizes: [{ name: 'M', price: 59000 }] },
    { name: 'Bơ Già Dừa Non (Avocado Young Coconut)', desc: 'Best Seller ⭐ - Sinh tố bơ dừa non béo ngậy', sizes: [{ name: 'S', price: 55000 }, { name: 'M', price: 69000 }] },
    { name: 'Taro Coco (Taro Coconut)', desc: 'Khoai môn dừa dẻo thơm', sizes: [{ name: 'S', price: 55000 }, { name: 'M', price: 69000 }] },
    { name: 'Dâu Lắc Phô Mai (Strawberry Cheesy Mix)', desc: '', sizes: [{ name: 'S', price: 55000 }, { name: 'M', price: 69000 }] },
    { name: 'Huyền Châu Đường Mặt', desc: 'Sữa tươi trân châu đường đen', sizes: [{ name: 'M', price: 65000 }] },
    { name: 'Sô-cô-la Katinat (KATINAT Chocolate)', desc: '', sizes: [{ name: 'Nóng', price: 45000 }, { name: 'M', price: 55000 }] }
  ]},
  { name: 'TRÀ TRÁI CÂY (FRUIT TEA)', prods: [
    { name: 'Hibi Sơ Ri (Hibiscus Acerola Tea)', desc: 'Trà hoa hibiscus sơ ri thanh mát', sizes: [{ name: 'M', price: 69000 }] },
    { name: 'Cóc Cóc Đắc Đắc (Ambarella Juice With Arenga Pinnata)', desc: 'Best Seller ⭐ - Nước cóc tươi với hạt đác rim thơm', sizes: [{ name: 'M', price: 69000 }] },
    { name: 'Trà Oolong Dâu Mai Sơn (Strawberry Oolong Tea)', desc: '', sizes: [{ name: 'M', price: 60000 }] },
    { name: 'Trà Đào Hồng Đài (Peach Hibiscus Tea)', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 65000 }] },
    { name: 'Trà Cam Quế Hồng Đài', desc: '', sizes: [{ name: 'M', price: 55000 }] },
    { name: 'Trà Vải (Lychee Tea)', desc: '', sizes: [{ name: 'M', price: 55000 }] },
    { name: 'Trà Hoa Cúc Mật Ong (Honey Chamomile Tea)', desc: '', sizes: [{ name: 'M', price: 55000 }] }
  ]}
];

let kCatSort2 = 1;
for (const catData of katinatcats) {
  const cId = insertCat.run(storeKatinatId, catData.name, kCatSort2++).lastInsertRowid;
  let pSort = 1;
  for (const p of catData.prods) {
    const pId = insertProd.run(storeKatinatId, cId, p.name, p.desc || '', '', 1, pSort++).lastInsertRowid;
    for (const sz of p.sizes) {
      insertSize.run(pId, sz.name, sz.price);
    }
  }
}

// ==========================================
// 3. FULL KAMIN COFFEE (ALL PRODUCTS)
// ==========================================
insertTopping.run(storeKaminId, 'Trân Châu', 7000);
insertTopping.run(storeKaminId, 'Kem Trứng', 10000);
insertTopping.run(storeKaminId, 'Kem Phô Mai', 10000);
insertTopping.run(storeKaminId, 'Kem Muối', 10000);

const kamincats = [
  { name: 'CÀ PHÊ', prods: [
    { name: 'Đen Đá', desc: '', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 18000 }, { name: 'XL', price: 25000 }] },
    { name: 'Phin Sữa Đá', desc: '', sizes: [{ name: 'M', price: 18000 }, { name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
    { name: 'Cà Phê Kem Muối / Kem Trứng', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
    { name: 'Bạc Xỉu', desc: '', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Bạc Xỉu Kem Muối / Kem Trứng', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
    { name: 'Bạc Xỉu Bạc Hà', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Phindi Hạnh Nhân', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Phindi Sữa Dừa', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Phindi Choco', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Phindi Sữa Chuối', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Sữa Tươi Cafe', desc: '', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
    { name: 'Sữa Tươi Caramel Cafe', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] }
  ]},
  { name: 'MATCHA', prods: [
    { name: 'Matcha Latte', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Matcha Latte Kem Muối', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Latte Kem Trứng', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Sữa Chuối', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Sữa Dừa', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Oreo', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Coco Matcha', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Latte Dâu / Việt Quất', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Latte Dâu / Việt Quất Kem Phô Mai', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
    { name: 'Matcha Latte Caramel', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] }
  ]},
  { name: 'CACAO (MILO)', prods: [
    { name: 'Cacao Latte', desc: '', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
    { name: 'Cacao Latte Oreo', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Cacao Kem Muối', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
    { name: 'Cacao Kem Trứng', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
    { name: 'Cacao Latte (Bạc Hà / Dâu / Việt Quất / Chuối)', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Cacao Sữa Dừa', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] }
  ]},
  { name: 'TRÀ TRÁI CÂY', prods: [
    { name: 'Trà Vải', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Dâu', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Dưa Lưới', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Ổi Hồng', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Ổi Hồng Chanh Dây', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Việt Quất', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Sen Nhãn Táo Đỏ', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
    { name: 'Trà Long Nhãn', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Chanh Bạc Hà', desc: 'Best Seller ⭐', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
    { name: 'Trà Chanh Dây', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Quýt', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Trà Đá Cam Quế', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Olong Lài Quế Hoa', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] }
  ]},
  { name: 'LATTE SỮA', prods: [
    { name: 'Việt Quất Latte Kem Trứng / Muối', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
    { name: 'Việt Quất Latte Phô Mai Kem Dẻo', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
    { name: 'Sữa Dâu Phô Mai / Kem Trứng / Kem Muối', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
    { name: 'Sữa Dâu Phô Mai Kem Dẻo', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
    { name: 'Sữa Chuối Socola Kem Trứng / Kem Muối', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
    { name: 'Sữa Chuối Socola Kem Dẻo', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] }
  ]},
  { name: 'KHOAI MÔN', prods: [
    { name: 'Khoai Môn Latte', desc: '', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
    { name: 'Khoai Môn Kem Muối', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Khoai Môn Kem Trứng', desc: '', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] }
  ]},
  { name: 'LIPTON & NƯỚC MẤT', prods: [
    { name: 'Lipton Sữa', desc: '', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
    { name: 'Lipton Chanh', desc: '', sizes: [{ name: 'M', price: 18000 }, { name: 'L', price: 23000 }, { name: 'XL', price: 28000 }] },
    { name: 'Cam Vắt', desc: '', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
    { name: 'Chanh Tươi', desc: '', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }, { name: 'XL', price: 35000 }] },
    { name: 'Chanh Dây Tươi', desc: '', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] }
  ]},
  { name: 'SỮA CHUA', prods: [
    { name: 'Sữa Chua Đá', desc: '', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
    { name: 'Sữa Chua Việt Quất Kem Phô Mai', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 38000 }, { name: 'XL', price: 45000 }] },
    { name: 'Sữa Chua Dâu Sấy Kem Phô Mai', desc: '', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 38000 }, { name: 'XL', price: 45000 }] },
    { name: 'Sữa Chua Chọn Vị (Dâu/Việt Quất/Đào/Ổi/Chanh Dây)', desc: '', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] }
  ]},
  { name: 'BÁNH BAO & COMBO', prods: [
    { name: 'Bánh Bao Truyền Thống', desc: '', sizes: [{ name: 'Standard', price: 20000 }] },
    { name: 'Bánh Bao Gạo Lứt', desc: '', sizes: [{ name: 'Standard', price: 25000 }] },
    { name: 'Bánh Bao Nguyên Cám', desc: '', sizes: [{ name: 'Standard', price: 25000 }] },
    { name: 'Combo 3 Bánh Bao Tặng 1 Chai Sâm', desc: 'Tiết kiệm ⭐', sizes: [{ name: 'Combo', price: 75000 }] }
  ]}
];

let kmCatSort = 1;
for (const catData of kamincats) {
  const cId = insertCat.run(storeKaminId, catData.name, kmCatSort++).lastInsertRowid;
  let pSort = 1;
  for (const p of catData.prods) {
    const pId = insertProd.run(storeKaminId, cId, p.name, p.desc || '', '', 1, pSort++).lastInsertRowid;
    for (const sz of p.sizes) {
      insertSize.run(pId, sz.name, sz.price);
    }
  }
}

// ==========================================
// 4. FULL HIGHLANDS COFFEE (ALL PRODUCTS & TOPPINGS)
// ==========================================
insertTopping.run(storeHighlandsId, 'Thạch Vải', 10000);
insertTopping.run(storeHighlandsId, 'Thạch Đào', 10000);
insertTopping.run(storeHighlandsId, 'Hạt Sen', 10000);
insertTopping.run(storeHighlandsId, 'Đậu Đỏ', 10000);
insertTopping.run(storeHighlandsId, 'Kem Whipping / Milk Foam', 10000);
insertTopping.run(storeHighlandsId, 'Shot Espresso Thêm', 10000);

const highlandscats = [
  { name: 'CÀ PHÊ PHA PHIN', prods: [
    { name: 'Phin Sữa Đá', desc: 'PHIN Coffee & Condensed Milk ⭐', sizes: [{ name: 'S', price: 29000 }, { name: 'M', price: 35000 }, { name: 'L', price: 39000 }] },
    { name: 'Phin Đen Đá', desc: 'PHIN Coffee', sizes: [{ name: 'S', price: 29000 }, { name: 'M', price: 35000 }, { name: 'L', price: 39000 }] },
    { name: 'Bạc Xỉu Đá', desc: 'White PHIN Coffee & Condensed Milk', sizes: [{ name: 'S', price: 29000 }, { name: 'M', price: 35000 }, { name: 'L', price: 39000 }] }
  ]},
  { name: 'CÀ PHÊ ESPRESSO', prods: [
    { name: 'Espresso / Americano', desc: 'Espresso Coffee', sizes: [{ name: 'S', price: 35000 }, { name: 'M', price: 39000 }, { name: 'L', price: 45000 }] },
    { name: 'Cappuccino / Latte', desc: '', sizes: [{ name: 'S', price: 55000 }, { name: 'M', price: 65000 }, { name: 'L', price: 69000 }] },
    { name: 'Mocha / Caramel Macchiato', desc: '', sizes: [{ name: 'S', price: 59000 }, { name: 'M', price: 69000 }, { name: 'L', price: 75000 }] }
  ]},
  { name: 'FREEZE (ĐÁ XAY)', prods: [
    { name: 'Freeze Trà Xanh', desc: 'Green Tea Freeze ⭐ Best Seller', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] },
    { name: 'Freeze Sô-cô-la', desc: 'Chocolate Freeze', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] },
    { name: 'Cookies & Cream', desc: '', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] },
    { name: 'Caramel Phin Freeze', desc: '', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] },
    { name: 'Classic Phin Freeze', desc: '', sizes: [{ name: 'S', price: 49000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] }
  ]},
  { name: 'TRÀ HIGHLANDS', prods: [
    { name: 'Trà Sen Vàng', desc: 'Oolong Tea, Lotus Seeds & Milk Foam ⭐ Best Seller', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Trà Thạch Đào', desc: 'Peach Tea, Peach Jelly & Milk', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Trà Thanh Đào', desc: 'Peach Tea & Lemongrass', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Trà Thạch Vải', desc: 'Red Tea & Lychee Jelly', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Trà Xanh Đậu Đỏ', desc: 'Green Tea & Red Beans', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] }
  ]},
  { name: 'THỨC UỐNG KHÁC', prods: [
    { name: 'Chanh Đá Xay / Đá Viên', desc: 'Lime Ice Blended / Iced', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Chanh Dây Đá Viên', desc: 'Iced Passion Fruit', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Tắc / Quất Đá Viên', desc: 'Iced Kumquat', sizes: [{ name: 'S', price: 39000 }, { name: 'M', price: 49000 }, { name: 'L', price: 55000 }] },
    { name: 'Sô-Cô-La (nóng hoặc đá)', desc: 'Chocolate (hot or iced)', sizes: [{ name: 'S', price: 54000 }, { name: 'M', price: 59000 }, { name: 'L', price: 65000 }] }
  ]}
];

let hlCatSort = 1;
for (const catData of highlandscats) {
  const cId = insertCat.run(storeHighlandsId, catData.name, hlCatSort++).lastInsertRowid;
  let pSort = 1;
  for (const p of catData.prods) {
    const pId = insertProd.run(storeHighlandsId, cId, p.name, p.desc || '', '', 1, pSort++).lastInsertRowid;
    for (const sz of p.sizes) {
      insertSize.run(pId, sz.name, sz.price);
    }
  }
}

// 5. Create Today's Session for HOGI COFFEE & TEA
const todayStr = new Date().toISOString().split('T')[0];
const hogiDelivery = db.prepare('SELECT * FROM delivery_profiles WHERE store_id = ?').get(storeHogiId);

const insertSession = db.prepare(`
  INSERT INTO daily_order_sessions (date, store_id, status, cutoff_time, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note)
  VALUES (?, ?, 'OPEN', '11:30', ?, ?, ?, ?, ?)
`);
const sessionRes = insertSession.run(
  todayStr, storeHogiId,
  hogiDelivery.recipient_name,
  hogiDelivery.recipient_phone,
  DEFAULT_DELIVERY_ADDRESS,
  hogiDelivery.delivery_time,
  hogiDelivery.delivery_note
);

console.log('✅ Seeding COMPLETED! Added HIGHLANDS COFFEE & Updated Default Delivery Address: Cổng sau công ty Phú Cường - Số 1 Hà Huy Tập, Rạch Giá');
