const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { run, all, get } = require('./db');

async function updateAllMenus() {
  console.log('--- BẮT ĐẦU CẬP NHẬT MENU CHÍNH XÁC THEO 5 ẢNH MENU ---');

  // =========================================================================
  // 1. QUÁN Ê JUICE (RẠCH GIÁ) - media_1789446246246.jpg
  // =========================================================================
  console.log('1. Cập nhật Ê Juice...');
  const ejuiceStoreId = 'store-ejuice';
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    ejuiceStoreId,
    'Ê Juice (Rạch Giá)',
    '/uploads/logo_ejuice.svg',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
    'Đối diện Trường TT GD TX Rạch Giá, Kiên Giang',
    '0977 581 547',
    'Tươi mát nhức người! Menu đầy đủ cà phê, matcha, trà trái cây, sinh tố, nước ép tươi.'
  ]);

  // Menu file
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [ejuiceStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ejuiceStoreId, 'menu_ejuice.jpg', '/uploads/menu_ejuice.jpg', 'jpg', 1]);

  // Categories & Products & Toppings
  await cleanStoreMenu(ejuiceStoreId);

  const ejuiceData = {
    categories: [
      { id: 'cat-ej-1', name: 'Ê cà phê !', order: 1 },
      { id: 'cat-ej-2', name: 'Matcha & Cacao', order: 2 },
      { id: 'cat-ej-3', name: 'Trà trái cây tươi', order: 3 },
      { id: 'cat-ej-4', name: 'Hồng trà & Olong', order: 4 },
      { id: 'cat-ej-5', name: 'Trái cây dầm', order: 5 },
      { id: 'cat-ej-6', name: 'Nước ép', order: 6 },
      { id: 'cat-ej-7', name: 'Sinh tố', order: 7 },
      { id: 'cat-ej-8', name: 'Yaout & Dừa', order: 8 }
    ],
    toppings: [
      { id: 'top-ej-1', name: 'Trân châu trắng', price: 3000 },
      { id: 'top-ej-2', name: 'Kem muối', price: 5000 },
      { id: 'top-ej-3', name: 'Thạch nổ củ năng', price: 3000 }
    ],
    products: [
      // Ê cà phê !
      { cat: 'cat-ej-1', name: 'Cà phê máy', desc: 'Pha máy nguyên chất thơm lừng', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-ej-1', name: 'Phê phin', desc: 'Pha phin truyền thống đậm đà', sizes: [{ name: 'Tiêu chuẩn', price: 15000 }] },
      { cat: 'cat-ej-1', name: 'Cà phê sữa VN', desc: 'Cà phê sữa truyền thống ngọt béo', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-ej-1', name: 'Cà phê muối', desc: 'Best-seller kem muối béo mặn', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-1', name: 'Cà phê sữa tươi', desc: 'Cà phê hòa quyện sữa tươi thanh béo', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-ej-1', name: 'Bạc xỉu', desc: 'Nhiều sữa ít cà phê, dịu ngọt', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-ej-1', name: 'Trà lài', desc: 'Trà lài thơm thanh mát giải nhiệt', sizes: [{ name: 'Tiêu chuẩn', price: 15000 }] },

      // Matcha & Cacao
      { cat: 'cat-ej-2', name: 'Matcha latte', desc: 'Trà xanh Nhật Bản thơm béo', sizes: [{ name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-ej-2', name: 'Matcha latte kem muối', desc: 'Matcha sữa phủ kem muối béo mặn', sizes: [{ name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-ej-2', name: 'Matcha latte dâu', desc: 'Matcha kết hợp dâu tây ngọt thơm', sizes: [{ name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-ej-2', name: 'Matcha latte xoài', desc: 'Matcha phối xoài tươi nhiệt đới', sizes: [{ name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-ej-2', name: 'Matcha latte đào', desc: 'Matcha vị đào thơm mát sảng khoái', sizes: [{ name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-ej-2', name: 'Coco matcha', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-2', name: 'Sen matcha', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-2', name: 'Cacao latte', desc: 'Cacao nguyên chất pha sữa thơm ngậy', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-2', name: 'Cacao sữa', desc: 'Cacao sữa đặc truyền thống', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-ej-2', name: 'Cacao đá/ nóng', desc: 'Cacao thưởng thức đá mát hoặc nóng ấm', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-ej-2', name: 'Khoai môn latte', desc: 'Vị khoai môn bùi béo ngọt dịu', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-2', name: 'Trà sữa gạo rang HOT/ICE', desc: 'Trà gạo rang thơm lừng chuẩn vị', sizes: [{ name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-ej-2', name: 'Sữa tươi đường đen', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },

      // Trà trái cây tươi
      { cat: 'cat-ej-3', name: 'Trà chanh', desc: 'Trà chanh tươi chua ngọt thanh mát', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }] },
      { cat: 'cat-ej-3', name: 'Trà đào', desc: 'Trà đào thơm nức miếng đào giòn', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-3', name: 'Trà tắc miền tây', desc: 'Tắc tươi miền Tây giải nhiệt đã khát', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }] },
      { cat: 'cat-ej-3', name: 'Trà tắc thái xanh', desc: 'Vị trà thái xanh hòa quyện tắc tươi', sizes: [{ name: 'M', price: 17000 }, { name: 'L', price: 22000 }] },
      { cat: 'cat-ej-3', name: 'Trà ổi hồng', desc: 'Ổi hồng thơm ngọt thanh mát', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-3', name: 'Trà dâu', desc: 'Trà dâu tươi chua ngọt hấp dẫn', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-3', name: 'Trà vải hoa hồng', desc: 'Hương hoa hồng quyện vị vải ngọt ngào', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-3', name: 'Trà mãng cầu', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-3', name: 'Trà dâu tằm', desc: 'Dâu tằm đậm đà chua thanh ngọt dịu', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },

      // Hồng trà & Olong
      { cat: 'cat-ej-4', name: 'Hồng trà kem muối', desc: 'Hồng trà đậm vị phủ kem muối béo', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-4', name: 'Olong kem muối', desc: 'Olong hảo hạng kèm lớp kem muối mặn mà', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-4', name: 'Trà olong sen vàng', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-4', name: 'Hồng trà chanh', desc: 'Hồng trà chanh mát lạnh giải khát', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }] },

      // Trái cây dầm
      { cat: 'cat-ej-5', name: 'Bơ dầm', desc: 'Bơ sáp dầm béo ngậy ngọt thơm', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },

      // Nước ép
      { cat: 'cat-ej-6', name: 'Ép cam lòng', desc: 'Nước cam tươi nguyên chất 100%', sizes: [{ name: 'M', price: 12000 }, { name: 'L', price: 19000 }] },
      { cat: 'cat-ej-6', name: 'Ép dưa hấu', desc: 'Dưa hấu tươi mát ngọt lịm', sizes: [{ name: 'M', price: 12000 }, { name: 'L', price: 19000 }] },
      { cat: 'cat-ej-6', name: 'Ép lựu, lê, dưa lưới, ổi, dứa', desc: 'Tùy chọn vị trái cây tươi nguyên chất', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-6', name: 'Ép táo, cà rốt, cà chua', desc: 'Ép bổ dưỡng đẹp da tăng đề kháng', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-6', name: 'Ép Mix (mún gì được đó)', desc: 'Mix các loại trái cây tùy chọn theo ý thích', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },

      // Sinh tố
      { cat: 'cat-ej-7', name: 'Sinh tố Cam, cà rốt, xoài, dâu', desc: 'Sinh tố tươi mát giàu vitamin', sizes: [{ name: 'M', price: 17000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-7', name: 'Sinh tố Sapoche cafe, mít', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-7', name: 'Sinh tố Dưa gang', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-7', name: 'Sinh tố Bơ, dừa (topping vụn dừa sấy)', desc: 'Bơ sáp béo ngậy kèm vụn dừa sấy giòn', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },

      // Yaout & Dừa
      { cat: 'cat-ej-8', name: 'Yaout việt quất', desc: 'Sắp ra mắt (Coming soon)', is_available: 0, sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-ej-8', name: 'Yaout dâu', desc: 'Sữa chua dâu tây chua ngọt mát lành', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-8', name: 'Yaout đào', desc: 'Sữa chua phối vị đào giòn ngọt', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }] },
      { cat: 'cat-ej-8', name: 'Dừa tươi', desc: 'Nước dừa tươi nguyên chất thanh mát', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-ej-8', name: 'Dừa tắc', desc: 'Nước dừa hòa cùng tắc tươi chua thanh', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }] }
    ]
  };
  await insertStoreData(ejuiceStoreId, ejuiceData);

  // =========================================================================
  // 2. QUÁN KAMIN COFFEE - media_1789446246252.jpg
  // =========================================================================
  console.log('2. Cập nhật Kamin Coffee...');
  const kaminStoreId = 'store-kamin';
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    kaminStoreId,
    'Kamin Coffee',
    '/uploads/logo_kamin.jpg',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    'F1-17 Hoàng Văn Thụ, Rạch Giá, Kiên Giang',
    '0844 482 225',
    'Chuyên cà phê kem muối, kem trứng, matcha, trà trái cây và bánh bao nóng hổi.'
  ]);

  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [kaminStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), kaminStoreId, 'menu_kamin.jpg', '/uploads/menu_kamin.jpg', 'jpg', 1]);

  await cleanStoreMenu(kaminStoreId);

  const kaminData = {
    categories: [
      { id: 'cat-km-1', name: 'Cà phê', order: 1 },
      { id: 'cat-km-2', name: 'Matcha', order: 2 },
      { id: 'cat-km-3', name: 'Cacao (Milo)', order: 3 },
      { id: 'cat-km-4', name: 'Trà trái cây', order: 4 },
      { id: 'cat-km-5', name: 'Latte sữa', order: 5 },
      { id: 'cat-km-6', name: 'Khoai môn', order: 6 },
      { id: 'cat-km-7', name: 'Lipton & Nước mát', order: 7 },
      { id: 'cat-km-8', name: 'Sữa chua', order: 8 },
      { id: 'cat-km-9', name: 'Bánh bao & Combo', order: 9 }
    ],
    toppings: [
      { id: 'top-km-1', name: 'Trân châu', price: 7000 },
      { id: 'top-km-2', name: 'Kem trứng', price: 10000 },
      { id: 'top-km-3', name: 'Kem phô mai', price: 10000 },
      { id: 'top-km-4', name: 'Kem muối', price: 10000 }
    ],
    products: [
      // Cà phê
      { cat: 'cat-km-1', name: 'Đen đá', desc: 'Cà phê đen nguyên chất đậm vị', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 18000 }, { name: 'XL', price: 25000 }] },
      { cat: 'cat-km-1', name: 'Phin sữa đá', desc: 'Cà phê phin truyền thống hòa quyện sữa đặc', sizes: [{ name: 'M', price: 18000 }, { name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-km-1', name: 'Cà phê kem muối / kem trứng', desc: '⭐ Best Seller - Cà phê phủ lớp kem béo mặn mịn màng', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
      { cat: 'cat-km-1', name: 'Bạc xỉu', desc: 'Vị béo ngậy ngọt dịu từ sữa đặc và sữa tươi', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Bạc xỉu kem muối / kem trứng', desc: 'Bạc xỉu thêm lớp kem muối hoặc kem trứng béo ngậy', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-1', name: 'Bạc xỉu bạc hà', desc: 'Bạc xỉu the mát hương bạc hà thanh sảng khoái', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Phindi hạnh nhân', desc: 'Cà phê phin kết hợp hạnh nhân thơm bùi', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Phindi sữa dừa', desc: 'Cà phê phin hòa cùng sữa dừa béo thơm', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Phindi choco', desc: 'Cà phê phin hòa chocolate ngọt đắng tinh tế', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Phindi sữa chuối', desc: 'Hương chuối ngọt dịu quyện cùng cà phê phin', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-1', name: 'Sữa tươi cafe', desc: 'Sữa tươi thanh béo điểm xuyết cà phê thơm', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 25000 }, { name: 'XL', price: 30000 }] },
      { cat: 'cat-km-1', name: 'Sữa tươi caramel cafe', desc: 'Caramel ngọt thơm kết hợp sữa tươi và cafe', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },

      // Matcha
      { cat: 'cat-km-2', name: 'Matcha latte', desc: 'Trà xanh Nhật Bản đánh bông cùng sữa tươi', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-2', name: 'Matcha latte kem muối', desc: '⭐ Best Seller - Matcha sữa phủ kem muối đậm đà', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha latte kem trứng', desc: '⭐ Best Seller - Matcha latte phủ kem trứng béo ngậy', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha sữa chuối', desc: 'Vị chuối thơm quyện cùng matcha thanh mát', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha sữa dừa', desc: 'Nước cốt dừa thơm béo kết hợp matcha Uji', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha Oreo', desc: 'Matcha sữa rắc vụn bánh Oreo giòn rụm', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Coco Matcha', desc: 'Matcha nước dừa ngọt mát thanh khiết', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha latte dâu / việt quất', desc: 'Matcha phối mứt trái cây tự nhiên', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha latte dâu / việt quất kem phô mai', desc: 'Matcha dâu/việt quất phủ kem phô mai béo mặn', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-2', name: 'Matcha latte caramel', desc: 'Hương caramel ngọt ấm quyện matcha đậm đà', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },

      // Cacao (Milo)
      { cat: 'cat-km-3', name: 'Cacao latte', desc: 'Cacao nguyên chất pha sữa tươi thơm lừng', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-km-3', name: 'Cacao latte Oreo', desc: '⭐ Best Seller - Cacao latte kèm bánh Oreo giòn', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-3', name: 'Cacao kem muối', desc: 'Cacao đậm đà kèm lớp kem muối béo mặn', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
      { cat: 'cat-km-3', name: 'Cacao kem trứng', desc: 'Cacao hòa quyện lớp kem trứng béo ngậy ngọt ngào', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 37000 }] },
      { cat: 'cat-km-3', name: 'Cacao latte (Bạc hà/Dâu/Việt Quất/Chuối)', desc: 'Tùy chọn hương vị hoa quả và bạc hà yêu thích', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-3', name: 'Cacao sữa dừa', desc: 'Cacao hòa nước cốt dừa thơm béo ngậy', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },

      // Trà trái cây
      { cat: 'cat-km-4', name: 'Trà vải', desc: 'Trà thơm hoa lài kết hợp trái vải tươi ngọt mọng', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà dâu', desc: 'Trà dâu tươi chua ngọt sảng khoái', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà dưa lưới', desc: '⭐ Best Seller - Dưa lưới ngọt mát thơm lừng', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà ổi hồng', desc: '⭐ Best Seller - Ổi hồng tươi mát thơm nức mũi', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà ổi hồng chanh dây', desc: 'Ổi hồng phối chanh dây chua ngọt bừng tỉnh', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà việt quất', desc: 'Việt quất bổ dưỡng thơm dịu mát', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà sen nhãn táo đỏ', desc: '⭐ Best Seller - Hạt sen, nhãn nhục và táo đỏ bổ dưỡng', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 35000 }, { name: 'XL', price: 40000 }] },
      { cat: 'cat-km-4', name: 'Trà long nhãn', desc: 'Long nhãn ngọt thanh thanh nhiệt', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà chanh bạc hà', desc: '⭐ Best Seller - Chanh tươi kết hợp lá bạc hà the mát', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-km-4', name: 'Trà chanh dâu', desc: 'Trà chanh tươi hòa quyện mứt dâu', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà quýt', desc: 'Vị quýt ngọt thanh mát rượi', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Trà đá cam quế', desc: 'Cam tươi kết hợp quế thơm nồng ấm mát lạnh', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-4', name: 'Olong lài quế hoa', desc: 'Olong ướp hoa lài và quế hoa thanh tao', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },

      // Latte sữa
      { cat: 'cat-km-5', name: 'Việt quất latte kem trứng/muối', desc: 'Latte việt quất phủ kem trứng hoặc kem muối', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
      { cat: 'cat-km-5', name: 'Việt quất latte phomai kem dẻo', desc: 'Latte việt quất phủ kem phô mai dẻo béo ngậy', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
      { cat: 'cat-km-5', name: 'Sữa dâu phomai / kem trứng / kem muối', desc: 'Sữa dâu thơm ngọt phủ kem phô mai hoặc kem trứng', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
      { cat: 'cat-km-5', name: 'Sữa dâu phomai kem dẻo', desc: 'Sữa dâu phủ lớp kem phô mai dẻo mịn béo ngậy', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
      { cat: 'cat-km-5', name: 'Sữa chuối socola kem trứng / kem muối', desc: 'Sữa chuối hòa quyện socola và kem trứng béo', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },
      { cat: 'cat-km-5', name: 'Sữa chuối socola kem dẻo', desc: 'Sữa chuối socola kết hợp kem phô mai dẻo', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 40000 }, { name: 'XL', price: 50000 }] },

      // Khoai môn
      { cat: 'cat-km-6', name: 'Khoai môn latte', desc: 'Khoai môn béo thơm hòa cùng sữa tươi', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-km-6', name: 'Khoai môn kem muối', desc: 'Khoai môn sữa phủ kem muối béo mặn', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-6', name: 'Khoai môn kem trứng', desc: 'Khoai môn sữa phủ kem trứng béo ngọt', sizes: [{ name: 'M', price: 25000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },

      // Lipton & Nước mát
      { cat: 'cat-km-7', name: 'Lipton sữa', desc: 'Trà Lipton đậm đà pha sữa thơm ngọt', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-km-7', name: 'Lipton chanh', desc: 'Trà Lipton chanh mát lạnh sảng khoái', sizes: [{ name: 'M', price: 18000 }, { name: 'L', price: 23000 }, { name: 'XL', price: 28000 }] },
      { cat: 'cat-km-7', name: 'Cam vắt', desc: 'Cam sành vắt tươi nguyên chất', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },
      { cat: 'cat-km-7', name: 'Chanh tươi', desc: 'Nước chanh đá tươi mát thanh lọc', sizes: [{ name: 'M', price: 15000 }, { name: 'L', price: 20000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-7', name: 'Chanh dây tươi', desc: 'Chanh dây thơm lừng chua ngọt đã khát', sizes: [{ name: 'M', price: 20000 }, { name: 'L', price: 27000 }, { name: 'XL', price: 32000 }] },

      // Sữa chua
      { cat: 'cat-km-8', name: 'Sữa chua đá', desc: 'Sữa chua đá truyền thống chua thanh mát lạnh', sizes: [{ name: 'M', price: 22000 }, { name: 'L', price: 30000 }, { name: 'XL', price: 35000 }] },
      { cat: 'cat-km-8', name: 'Sữa chua việt quất kem phô mai', desc: 'Sữa chua kèm việt quất và kem phô mai béo ngậy', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 38000 }, { name: 'XL', price: 45000 }] },
      { cat: 'cat-km-8', name: 'Sữa chua dâu sấy kem phô mai', desc: 'Sữa chua dâu giòn sấy phủ kem phô mai', sizes: [{ name: 'M', price: 30000 }, { name: 'L', price: 38000 }, { name: 'XL', price: 45000 }] },
      { cat: 'cat-km-8', name: 'Sữa chua chọn vị (Dâu/Việt quất/Đào/Dưa lưới/Ổi/Chanh dây/Mận)', desc: 'Tùy chọn hương vị trái cây yêu thích', sizes: [{ name: 'M', price: 27000 }, { name: 'L', price: 32000 }, { name: 'XL', price: 40000 }] },

      // Bánh bao & Combo
      { cat: 'cat-km-9', name: 'Bánh bao truyền thống', desc: 'Bánh bao nhân thịt cút thơm ngon nóng hổi', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-km-9', name: 'Bánh bao gạo lứt', desc: 'Vỏ gạo lứt tốt cho sức khỏe ăn kiêng', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-km-9', name: 'Bánh bao nguyên cám', desc: 'Bánh bao bột nguyên cám giàu dinh dưỡng', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-km-9', name: 'Combo 3 bánh bao tặng 1 chai sâm', desc: 'Tiết kiệm và no lâu kèm sâm thanh mát', sizes: [{ name: 'Combo', price: 75000 }] }
    ]
  };
  await insertStoreData(kaminStoreId, kaminData);

  // =========================================================================
  // 3. QUÁN KATINAT SAIGON KAFE - media_1789446246317.jpg
  // =========================================================================
  console.log('3. Cập nhật Katinat...');
  const katinatStoreId = 'store-katinat';
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    katinatStoreId,
    'Katinat Saigon Kafe',
    '/uploads/logo_katinat.jpg',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    '91 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM',
    '028 7300 1005',
    'Katinat Special, Cà phê Phin Mê, Trà sữa chôm chôm, Bơ già dừa non.'
  ]);

  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [katinatStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), katinatStoreId, 'menu_katinat.jpg', '/uploads/menu_katinat.jpg', 'jpg', 1]);

  await cleanStoreMenu(katinatStoreId);

  const katinatData = {
    categories: [
      { id: 'cat-kt-1', name: 'Cà phê Phin Mê', order: 1 },
      { id: 'cat-kt-2', name: 'Cà phê Espresso', order: 2 },
      { id: 'cat-kt-3', name: 'Trà Sữa (Milk Tea)', order: 3 },
      { id: 'cat-kt-4', name: 'Phong Vị Mới (Katinat Special)', order: 4 },
      { id: 'cat-kt-5', name: 'Trà Trái Cây (Fruit Tea)', order: 5 }
    ],
    toppings: [
      { id: 'top-kt-1', name: 'Topping Tàu Hũ', price: 15000 },
      { id: 'top-kt-2', name: 'Trân Châu Phô Mai Dẻo', price: 15000 },
      { id: 'top-kt-3', name: 'Trân Châu Trắng', price: 10000 },
      { id: 'top-kt-4', name: 'Huyền Châu', price: 15000 },
      { id: 'top-kt-5', name: 'Kem Sữa Phô Mai', price: 15000 },
      { id: 'top-kt-6', name: 'Bánh Flan', price: 15000 },
      { id: 'top-kt-7', name: 'Thạch Hồng Đài', price: 12000 },
      { id: 'top-kt-8', name: 'Thạch Bưởi Aiyu', price: 12000 }
    ],
    products: [
      // Cà phê Phin Mê
      { cat: 'cat-kt-1', name: 'Mê Sữa Đá', desc: 'Cà phê phin sữa đậm đà trứ danh', sizes: [{ name: 'Nóng', price: 39000 }, { name: 'M', price: 39000 }, { name: 'L', price: 55000 }] },
      { cat: 'cat-kt-1', name: 'Mê Đen Đá', desc: 'Cà phê phin đen nguyên chất', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'M', price: 35000 }, { name: 'L', price: 49000 }] },
      { cat: 'cat-kt-1', name: 'Mê Xỉu', desc: 'Bạc xỉu phin đậm vị sữa ngọt béo', sizes: [{ name: 'Nóng', price: 39000 }, { name: 'M', price: 39000 }, { name: 'L', price: 55000 }] },
      { cat: 'cat-kt-1', name: 'Mê Dừa Non', desc: 'Cà phê phin hòa cùng cốt dừa non thơm béo', sizes: [{ name: 'M', price: 49000 }, { name: 'L', price: 60000 }] },

      // Cà phê Espresso
      { cat: 'cat-kt-2', name: 'Espresso Sữa Đá', desc: 'Espresso hòa quyện sữa đặc', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'M', price: 35000 }, { name: 'L', price: 48000 }] },
      { cat: 'cat-kt-2', name: 'Espresso Đen Đá', desc: 'Espresso nguyên chất đậm hương vị', sizes: [{ name: 'Nóng', price: 32000 }, { name: 'M', price: 32000 }, { name: 'L', price: 45000 }] },
      { cat: 'cat-kt-2', name: 'Espresso Bạc Xỉu', desc: 'Espresso sữa tươi và sữa đặc ngọt dịu', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'M', price: 35000 }, { name: 'L', price: 48000 }] },
      { cat: 'cat-kt-2', name: 'Latte Baba Nana', desc: 'Latte nhung chuối thơm ngon đặc biệt', sizes: [{ name: 'M', price: 59000 }] },
      { cat: 'cat-kt-2', name: 'Latte Hạt Phỉ', desc: 'Latte kem hạt phỉ thơm lừng quyến rũ', sizes: [{ name: 'M', price: 59000 }] },
      { cat: 'cat-kt-2', name: 'Latte Nguyên Bản', desc: 'Latte cổ điển sữa tươi New Zealand', sizes: [{ name: 'Nóng', price: 50000 }, { name: 'M', price: 55000 }] },
      { cat: 'cat-kt-2', name: 'Americano', desc: 'Americano thanh nhẹ sảng khoái', sizes: [{ name: 'Nóng', price: 35000 }, { name: 'M', price: 35000 }] },

      // Trà Sữa (Milk Tea)
      { cat: 'cat-kt-3', name: 'Thanh Hương Camellia', desc: 'Món mới - Trà hoa Camellia thanh tao hòa quyện sữa Meiji', sizes: [{ name: 'M', price: 50000 }, { name: 'L', price: 65000 }] },
      { cat: 'cat-kt-3', name: 'Trà Sữa Chôm Chôm', desc: '⭐ Best Seller - Trà sữa đậm vị kèm chôm chôm tươi ngọt', sizes: [{ name: 'L', price: 60000 }] },
      { cat: 'cat-kt-3', name: 'Oolong Ba Lá', desc: 'Trà sữa Oolong ba lá thơm sâu lắng', sizes: [{ name: 'M', price: 45000 }, { name: 'L', price: 55000 }] },
      { cat: 'cat-kt-3', name: 'Trà Sữa Oolong Nướng', desc: 'Trà sữa oolong nướng thơm đượm vị caramen', sizes: [{ name: 'M', price: 45000 }, { name: 'L', price: 55000 }] },

      // Phong Vị Mới (Katinat Special)
      { cat: 'cat-kt-4', name: 'Iki Matcha Tàu Hũ', desc: 'Món mới - Matcha thượng hạng kết hợp tàu hũ mịn mượt', sizes: [{ name: 'L', price: 69000 }] },
      { cat: 'cat-kt-4', name: 'Iki Matcha Latte', desc: 'Món mới - Matcha latte nguyên bản Nhật Bản', sizes: [{ name: 'L', price: 59000 }] },
      { cat: 'cat-kt-4', name: 'Bơ Già Dừa Non', desc: '⭐ Best Seller - Bơ sáp dẻo quánh phối dừa non béo ngậy', sizes: [{ name: 'M', price: 55000 }, { name: 'L', price: 69000 }] },
      { cat: 'cat-kt-4', name: 'Taro Coco', desc: 'Khoai môn thơm dẻo cùng cốt dừa non', sizes: [{ name: 'M', price: 55000 }, { name: 'L', price: 69000 }] },
      { cat: 'cat-kt-4', name: 'Dâu Lắc Phô Mai', desc: 'Dâu tây tươi lắc cùng phô mai béo mặn', sizes: [{ name: 'M', price: 55000 }, { name: 'L', price: 69000 }] },
      { cat: 'cat-kt-4', name: 'Huyền Châu Đường Mật', desc: 'Sữa tươi trân châu đường mật dẻo thơm', sizes: [{ name: 'L', price: 65000 }] },
      { cat: 'cat-kt-4', name: 'Sô-cô-la Katinat', desc: 'Chocolate Katinat đậm đặc thơm nồng nàn', sizes: [{ name: 'Nóng', price: 45000 }, { name: 'M', price: 55000 }] },

      // Trà Trái Cây (Fruit Tea)
      { cat: 'cat-kt-5', name: 'Hibi Sơ Ri', desc: 'Trà hoa Hibiscus kết hợp trái sơ ri chua ngọt', sizes: [{ name: 'L', price: 69000 }] },
      { cat: 'cat-kt-5', name: 'Cóc Cóc Đắc Đắc', desc: '⭐ Best Seller - Nước cóc ép tươi cùng hạt đác giòn bùi', sizes: [{ name: 'L', price: 69000 }] },
      { cat: 'cat-kt-5', name: 'Trà Oolong Dâu Mai Sơn', desc: 'Oolong hòa mứt dâu Mai Sơn ngọt ngào', sizes: [{ name: 'L', price: 60000 }] },
      { cat: 'cat-kt-5', name: 'Trà Đào Hồng Đài', desc: '⭐ Best Seller - Trà hoa hồng đài thanh mát kèm đào giòn', sizes: [{ name: 'L', price: 65000 }] },
      { cat: 'cat-kt-5', name: 'Trà Cam Quế Hồng Đài', desc: 'Cam tươi quyện vị quế ấm và trà hồng đài', sizes: [{ name: 'L', price: 55000 }] },
      { cat: 'cat-kt-5', name: 'Trà Vải', desc: 'Trà lài phối trái vải mọng nước ngọt thanh', sizes: [{ name: 'L', price: 55000 }] },
      { cat: 'cat-kt-5', name: 'Trà Hoa Cúc Mật Ong', desc: 'Hoa cúc thanh nhiệt dịu ngọt mật ong', sizes: [{ name: 'L', price: 55000 }] }
    ]
  };
  await insertStoreData(katinatStoreId, katinatData);

  // =========================================================================
  // 4. QUÁN HIGHLANDS COFFEE - media_1789446246321.jpg
  // =========================================================================
  console.log('4. Cập nhật Highlands Coffee...');
  const highlandsStoreId = 'store-highlands';
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    highlandsStoreId,
    'Highlands Coffee',
    '/uploads/logo_highlands.png',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    '123 Lê Lợi, Bến Thành, Quận 1, TP.HCM',
    '1900 1755',
    'Cà phê phin truyền thống, Freeze trà xanh đá xay, Trà sen vàng trứ danh.'
  ]);

  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [highlandsStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), highlandsStoreId, 'menu_highlands.jpg', '/uploads/menu_highlands.jpg', 'jpg', 1]);

  await cleanStoreMenu(highlandsStoreId);

  const highlandsData = {
    categories: [
      { id: 'cat-hl-1', name: 'Cà Phê Pha Phin', order: 1 },
      { id: 'cat-hl-2', name: 'Cà Phê Espresso', order: 2 },
      { id: 'cat-hl-3', name: 'Freeze (Đá Xay)', order: 3 },
      { id: 'cat-hl-4', name: 'Trà Highlands', order: 4 },
      { id: 'cat-hl-5', name: 'Thức Uống Khác', order: 5 }
    ],
    toppings: [
      { id: 'top-hl-1', name: 'Thạch sen vàng', price: 10000 },
      { id: 'top-hl-2', name: 'Hạt sen bùi thơm', price: 10000 },
      { id: 'top-hl-3', name: 'Thạch trà đào', price: 10000 },
      { id: 'top-hl-4', name: 'Thạch trà vải', price: 10000 },
      { id: 'top-hl-5', name: 'Đậu đỏ bùi ngọt', price: 10000 },
      { id: 'top-hl-6', name: 'Extra Shot Espresso', price: 10000 }
    ],
    products: [
      // Cà phê pha phin (Nhỏ 10oz, Vừa 12oz, Lớn 16oz)
      { cat: 'cat-hl-1', name: 'Phin Sữa Đá', desc: 'Cà phê phin đậm đà hòa quyện sữa đặc béo ngọt truyền thống', sizes: [{ name: 'Nhỏ', price: 29000 }, { name: 'Vừa', price: 35000 }, { name: 'Lớn', price: 39000 }] },
      { cat: 'cat-hl-1', name: 'Phin Đen Đá', desc: 'Cà phê phin đen nguyên chất đậm chất Việt', sizes: [{ name: 'Nhỏ', price: 29000 }, { name: 'Vừa', price: 35000 }, { name: 'Lớn', price: 39000 }] },
      { cat: 'cat-hl-1', name: 'Bạc Xỉu Đá', desc: 'Phin hòa quyện nhiều sữa ngọt dịu thanh tao', sizes: [{ name: 'Nhỏ', price: 29000 }, { name: 'Vừa', price: 35000 }, { name: 'Lớn', price: 39000 }] },

      // Cà phê Espresso
      { cat: 'cat-hl-2', name: 'Espresso / Americano', desc: 'Espresso đậm đà thơm ngát phong cách Ý', sizes: [{ name: 'Nhỏ', price: 35000 }, { name: 'Vừa', price: 39000 }, { name: 'Lớn', price: 45000 }] },
      { cat: 'cat-hl-2', name: 'Cappuccino / Latte', desc: 'Cà phê Ý kết hợp lớp bọt sữa béo mịn bồng bềnh', sizes: [{ name: 'Nhỏ', price: 55000 }, { name: 'Vừa', price: 65000 }, { name: 'Lớn', price: 69000 }] },
      { cat: 'cat-hl-2', name: 'Mocha / Caramel Macchiato', desc: 'Hòa quyện chocolate hoặc caramel ngọt ấm', sizes: [{ name: 'Nhỏ', price: 59000 }, { name: 'Vừa', price: 69000 }, { name: 'Lớn', price: 75000 }] },

      // Freeze (Đá Xay)
      { cat: 'cat-hl-3', name: 'Freeze Trà Xanh', desc: 'Trà xanh đá xay mát lạnh phủ thạch giòn dai và kem béo', sizes: [{ name: 'Nhỏ', price: 49000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] },
      { cat: 'cat-hl-3', name: 'Freeze Sô-cô-la', desc: 'Sô-cô-la đá xay đậm đặc phủ whipping cream béo ngậy', sizes: [{ name: 'Nhỏ', price: 49000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] },
      { cat: 'cat-hl-3', name: 'Cookies & Cream', desc: 'Bánh cookies thơm giòn xay cùng kem tuyết mịn màng', sizes: [{ name: 'Nhỏ', price: 49000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] },
      { cat: 'cat-hl-3', name: 'Caramel Phin Freeze', desc: 'Cà phê phin xay đá tuyết thơm hương caramel', sizes: [{ name: 'Nhỏ', price: 49000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] },
      { cat: 'cat-hl-3', name: 'Classic Phin Freeze', desc: 'Cà phê phin đá xay cổ điển phủ kem tươi', sizes: [{ name: 'Nhỏ', price: 49000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] },

      // Trà Highlands
      { cat: 'cat-hl-4', name: 'Trà Sen Vàng', desc: '⭐ Best Seller - Hạt sen bùi, củ năng giòn cùng nước trà ô long và kem béo', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-4', name: 'Trà Thạch Đào', desc: 'Trà đen đậm vị kết hợp miếng đào tươi và thạch đào giòn', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-4', name: 'Trà Thanh Đào', desc: 'Trà thơm hoa kết hợp đào tươi thanh mát nhẹ nhàng', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-4', name: 'Trà Thạch Vải', desc: 'Trà thanh dịu kết hợp trái vải tươi mọng nước', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-4', name: 'Trà Xanh Đậu Đỏ', desc: 'Trà xanh mát lành kết hợp đậu đỏ bùi ngọt dẻo thơm', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },

      // Thức Uống Khác
      { cat: 'cat-hl-5', name: 'Chanh Đá Xay / Đá Viên', desc: 'Chanh tươi mát lạnh nạp vitamin C sảng khoái', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-5', name: 'Chanh Dây Đá Viên', desc: 'Chanh dây thơm nồng chua ngọt đã khát', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-5', name: 'Tắc / Quất Đá Viên', desc: 'Quất tươi thơm thanh lọc đề kháng', sizes: [{ name: 'Nhỏ', price: 39000 }, { name: 'Vừa', price: 49000 }, { name: 'Lớn', price: 55000 }] },
      { cat: 'cat-hl-5', name: 'Sô-Cô-La (nóng hoặc đá)', desc: 'Chocolate nguyên chất thơm béo ngọt ngào', sizes: [{ name: 'Nhỏ', price: 54000 }, { name: 'Vừa', price: 59000 }, { name: 'Lớn', price: 65000 }] }
    ]
  };
  await insertStoreData(highlandsStoreId, highlandsData);

  // =========================================================================
  // 5. QUÁN HOGI COFFEE & TEA - media_1789446246328.jpg
  // =========================================================================
  console.log('5. Cập nhật Hogi Coffee & Tea...');
  const hogiStoreId = 'store-hogi';
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    hogiStoreId,
    'Hogi Coffee & Tea',
    '/uploads/logo_hogi.svg',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
    'L4-C27 Phan Thị Ràng, P. Rạch Giá, Kiên Giang',
    '0969 487 712',
    'Menu Tết 2026 đầy đủ 79 món: Cà phê, Cacao, Matcha, Trà thanh mát, Trà sữa đậm vị, Trà trái cây, Sâm bí đao, Yogurt.'
  ]);

  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [hogiStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), hogiStoreId, 'menu_hogi.jpg', '/uploads/menu_hogi.jpg', 'jpg', 1]);

  await cleanStoreMenu(hogiStoreId);

  const hogiData = {
    categories: [
      { id: 'cat-hg-1', name: 'Cà phê', order: 1 },
      { id: 'cat-hg-2', name: 'Cacao', order: 2 },
      { id: 'cat-hg-3', name: 'Matcha Nhật Bản', order: 3 },
      { id: 'cat-hg-4', name: 'Trà thanh mát', order: 4 },
      { id: 'cat-hg-5', name: 'Món mới (New)', order: 5 },
      { id: 'cat-hg-6', name: 'Trà sữa đậm vị', order: 6 },
      { id: 'cat-hg-7', name: 'Trà sáng tạo', order: 7 },
      { id: 'cat-hg-8', name: 'Trà trái cây', order: 8 },
      { id: 'cat-hg-9', name: 'Bí đao', order: 9 },
      { id: 'cat-hg-10', name: 'Yogurt (Sữa chua)', order: 10 }
    ],
    toppings: [
      { id: 'top-hg-1', name: 'Trân châu đen', price: 6000 },
      { id: 'top-hg-2', name: 'Sương sáo', price: 6000 },
      { id: 'top-hg-3', name: 'Pudding', price: 6000 },
      { id: 'top-hg-4', name: 'Trân châu trắng', price: 6000 },
      { id: 'top-hg-5', name: 'Ô long 3Q', price: 6000 },
      { id: 'top-hg-6', name: 'Macchiato', price: 6000 },
      { id: 'top-hg-7', name: 'Đậu đỏ', price: 6000 },
      { id: 'top-hg-8', name: 'Hạt chia', price: 6000 },
      { id: 'top-hg-9', name: 'Kem trứng', price: 8000 },
      { id: 'top-hg-10', name: 'Hạt sen', price: 8000 },
      { id: 'top-hg-11', name: 'Hạt đác', price: 8000 },
      { id: 'top-hg-12', name: 'Củ năng', price: 8000 },
      { id: 'top-hg-13', name: 'Trái cây thêm', price: 8000 }
    ],
    products: [
      // 1. Cà phê
      { cat: 'cat-hg-1', name: '1. Cà phê đen đá', desc: 'Cà phê nguyên chất pha phin hoặc máy', sizes: [{ name: 'Tiêu chuẩn', price: 17000 }] },
      { cat: 'cat-hg-1', name: '2. Cà phê sữa đá', desc: 'Cà phê sữa thơm béo hài hòa', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-1', name: '3. Cà phê kem muối', desc: 'Cà phê lớp kem muối mặn béo ngậy', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-1', name: '4. Cà phê kem trứng', desc: 'Cà phê phủ kem trứng béo ngậy thơm nồng', sizes: [{ name: 'Tiêu chuẩn', price: 24000 }] },
      { cat: 'cat-hg-1', name: '5. Bạc xỉu', desc: 'Vị béo ngậy ngọt ngào nhiều sữa', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-1', name: '6. Cà phê sữa tươi', desc: 'Cà phê đậm vị phối sữa tươi thanh mát', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-1', name: '7. Cà phê sữa tươi sương sáo', desc: 'Cà phê sữa tươi kèm thạch sương sáo giòn mát', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-1', name: '8. Phindi hạnh nhân', desc: 'Cà phê phin thế hệ mới hương hạnh nhân', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-1', name: '9. Cà phê caramel', desc: 'Vị ngọt ấm caramel hòa quyện cà phê', sizes: [{ name: 'Tiêu chuẩn', price: 24000 }] },

      // 2. Cacao
      { cat: 'cat-hg-2', name: '10. Cà phê cacao', desc: 'Hòa quyện độc đáo giữa cà phê và cacao', sizes: [{ name: 'Tiêu chuẩn', price: 17000 }] },
      { cat: 'cat-hg-2', name: '11. Cà phê cacao sữa đá', desc: 'Cà phê phối cacao và sữa đặc ngọt béo', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-2', name: '12. Cacao đá', desc: 'Cacao nguyên chất mát lạnh', sizes: [{ name: 'Tiêu chuẩn', price: 15000 }] },
      { cat: 'cat-hg-2', name: '13. Cacao sữa đá', desc: 'Cacao sữa ngọt béo thơm lừng', sizes: [{ name: 'Tiêu chuẩn', price: 18000 }] },
      { cat: 'cat-hg-2', name: '14. Cacao sữa tươi', desc: 'Cacao hòa quyện cùng sữa tươi thanh béo', sizes: [{ name: 'Tiêu chuẩn', price: 18000 }] },
      { cat: 'cat-hg-2', name: '15. Cacao kem muối', desc: 'Cacao đậm đà phủ lớp kem muối mặn béo', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-2', name: '16. Cacao kem trứng', desc: 'Cacao sánh mịn phủ lớp kem trứng béo ngậy', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-2', name: '17. Latte Chocolate', desc: 'Latte sữa tươi hòa cùng chocolate đậm đặc', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },

      // 3. Matcha Nhật Bản (Oat Milk +2k)
      { cat: 'cat-hg-3', name: '18. Latte Matcha', desc: 'Matcha Uji Nhật Bản đánh tan cùng sữa tươi', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-3', name: '19. Latte Matcha Caramel', desc: 'Matcha sữa thêm sốt caramel ngọt ấm', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-3', name: '20. Latte Matcha Coco', desc: 'Matcha kết hợp nước cốt dừa thơm béo', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-3', name: '21. Latte Matcha đậu đỏ', desc: 'Matcha sữa kèm đậu đỏ bùi ngọt dẻo thơm', sizes: [{ name: 'Tiêu chuẩn', price: 29000 }] },
      { cat: 'cat-hg-3', name: '22. Latte Matcha Macchiato', desc: 'Matcha latte phủ lớp váng sữa macchiato mịn màng', sizes: [{ name: 'Tiêu chuẩn', price: 29000 }] },
      { cat: 'cat-hg-3', name: '23. Latte Matcha Coffee', desc: 'Matcha thơm kết hợp cà phê nguyên chất', sizes: [{ name: 'Tiêu chuẩn', price: 29000 }] },
      { cat: 'cat-hg-3', name: '24. Latte Matcha Strawberry (dâu)', desc: 'Matcha phối mứt dâu tây ngọt thơm', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },
      { cat: 'cat-hg-3', name: '25. Latte Matcha Blueberry (việt quất)', desc: 'Matcha hòa việt quất thanh mát', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },
      { cat: 'cat-hg-3', name: '26. Latte Matcha Mango (xoài)', desc: 'Matcha kết hợp xoài chín nhiệt đới', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },
      { cat: 'cat-hg-3', name: '27. Latte Matcha Peach (đào)', desc: 'Matcha vị đào giòn ngọt thơm lừng', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },

      // 4. Trà thanh mát
      { cat: 'cat-hg-4', name: '28. Trà tắc - Trà chanh', desc: 'Trà tắc hoặc trà chanh thanh mát giải nhiệt', sizes: [{ name: 'Tiêu chuẩn', price: 15000 }] },
      { cat: 'cat-hg-4', name: '29. Trà tắc mật ong', desc: 'Tắc tươi hòa mật ong tự nhiên ngọt dịu', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-4', name: '30. Trà chanh mật ong', desc: 'Chanh tươi hòa mật ong thanh lọc cổ họng', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-4', name: '31. Trà hạt chia sả tắc/chanh', desc: 'Hạt chia sả tắc/chanh tươi mát tốt sức khỏe', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-4', name: '32. Trà mật ong hạt chia sả tắc/chanh', desc: 'Thêm mật ong ngọt dịu bổ dưỡng', sizes: [{ name: 'Tiêu chuẩn', price: 24000 }] },
      { cat: 'cat-hg-4', name: '33. Trà chanh dây', desc: 'Chanh dây thơm lừng chua ngọt mát rượi', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-4', name: '34. Cam vắt', desc: 'Cam sành tươi vắt nguyên chất bổ sung vitamin C', sizes: [{ name: 'Tiêu chuẩn', price: 17000 }] },
      { cat: 'cat-hg-4', name: '35. Trà đường (trà xanh hoa nhài)', desc: 'Trà hoa nhài truyền thống ngọt nhẹ thanh khiết', sizes: [{ name: 'Tiêu chuẩn', price: 12000 }] },

      // 5. Món mới (New)
      { cat: 'cat-hg-5', name: '36. Trà mùa xuân (phiên bản đặc biệt)', desc: 'Phiên bản đặc biệt Tết hoa quả thơm ngát', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-5', name: '37. Trà táo đỏ', desc: 'Táo đỏ bổ dưỡng ngọt thanh an thần', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-5', name: '38. Trà hoa hibiscus', desc: 'Hoa atiso đỏ chua thanh đẹp da', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-5', name: '39. Hồng trà Bá Tước', desc: 'Trà Earl Grey quý phái thơm hương cam bergamot', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-5', name: '40. Hồng trà Bá Tước kem trứng', desc: 'Earl Grey phủ lớp kem trứng béo ngậy ngọt ngào', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-5', name: '41. Hồng trà sữa Bá Tước', desc: 'Trà sữa Earl Grey thơm nức mũi đậm vị trà', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-5', name: '42. Hồng trà sữa Bá Tước kem trứng', desc: 'Trà sữa Earl Grey thêm kem trứng béo thơm', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-5', name: '43. Bơ sữa trân châu đường đen', desc: 'Bơ sáp dẻo phối trân châu đường đen đậm vị', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },
      { cat: 'cat-hg-5', name: '44. Bơ già dừa non', desc: 'Bơ già Đắk Lắk cùng cơm dừa non béo ngọt', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-5', name: '45. Trà mận (phiên bản theo mùa)', desc: 'Trà mận hậu chua ngọt thơm lừng', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-5', name: '46. Trà kiwi', desc: 'Kiwi xanh chua thanh giàu vitamin', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-5', name: '47. Trà lựu đỏ', desc: 'Lựu đỏ ngọt mát rực rỡ sắc xuân', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },

      // 6. Trà sữa đậm vị
      { cat: 'cat-hg-6', name: '48. Trà sữa Phúc Long', desc: 'Vị trà sữa truyền thống đậm đà hậu ngọt sâu', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-6', name: '49. Trà sữa Ôlong', desc: 'Trà sữa olong nướng thơm dịu dàng', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-6', name: '50. Trà sữa Ôlong nhài', desc: 'Hương nhài tinh tế kết hợp olong béo ngậy', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-6', name: '51. Trà sữa Matcha Nhật Bản', desc: 'Trà sữa matcha Uji chuẩn vị Nhật', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-6', name: '52. Trà sữa Socola', desc: 'Trà sữa quyện socola ngọt ngào quyến rũ', sizes: [{ name: 'Tiêu chuẩn', price: 29000 }] },
      { cat: 'cat-hg-6', name: '53. Trà sữa Thái đỏ (Cha Thai)', desc: 'Trà sữa Thái đỏ thơm nồng béo ngọt', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-6', name: '54. Sữa tươi trân châu đường đen', desc: 'Sữa tươi thanh mát cùng trân châu nấu đường đen', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },

      // 7. Trà sáng tạo
      { cat: 'cat-hg-7', name: '55. Trà đào', desc: 'Trà đào thơm mát miếng đào giòn', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-7', name: '56. Trà đào cam sả', desc: 'Vị đào kết hợp cam tươi và sả thơm nồng', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-7', name: '57. Trà vải', desc: 'Trà lài kết hợp trái vải tươi mọng nước', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '58. Trà thạch vải', desc: 'Trà vải thơm mát thêm thạch vải giòn sần sật', sizes: [{ name: 'Tiêu chuẩn', price: 32000 }] },
      { cat: 'cat-hg-7', name: '59. Trà sen vàng', desc: 'Hạt sen bùi béo cùng nước trà thơm ngọt', sizes: [{ name: 'Tiêu chuẩn', price: 30000 }] },
      { cat: 'cat-hg-7', name: '60. Trà ô long hạt sen lá nếp', desc: 'Olong quyện hương lá nếp thơm và hạt sen', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '61. Trà ô long sen nhãn', desc: 'Olong sen kết hợp long nhãn ngọt thanh', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '62. Trà đen macchiato', desc: 'Trà đen đậm vị phủ macchiato sánh mịn', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '63. Trà ôlong macchiato', desc: 'Olong thơm hoa phủ kem macchiato béo mặn', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '64. Hồng trà Phúc Long macchiato', desc: 'Hồng trà đậm vị phủ lớp macchiato', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '65. Hồng trà Bá Tước macchiato', desc: 'Earl Grey thơm quý phái phủ macchiato', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-7', name: '66. Hồng trà sủi bọt', desc: 'Hồng trà lắc sủi bọt mát lạnh đã khát', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },

      // 8. Trà trái cây
      { cat: 'cat-hg-8', name: '67. Trà trái cây nhiệt đới', desc: 'Tổng hợp các loại trái cây tươi thơm mát', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-8', name: '68. Trà mãng cầu', desc: 'Mãng cầu xiêm tươi chua ngọt đậm đà', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-8', name: '69. Trà ổi hồng', desc: 'Ổi hồng thơm nức mũi vị ngọt thanh', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-8', name: '70. Trà dâu', desc: 'Dâu tây chua ngọt thơm mát', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-8', name: '71. Trà dâu tằm', desc: 'Dâu tằm chín mọng chua ngọt đậm vị', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-8', name: '72. Trà lài đác thơm', desc: 'Trà lài kết hợp hạt đác dẻo giòn và thơm', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-8', name: '73. Trà dưa lưới', desc: 'Dưa lưới thanh mát ngọt dịu sảng khoái', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-8', name: '74. Trà xoài chanh leo', desc: 'Xoài chín ngọt ngào phối chanh dây chua thơm', sizes: [{ name: 'Tiêu chuẩn', price: 25000 }] },
      { cat: 'cat-hg-8', name: '75. Trà việt quất', desc: 'Việt quất bổ dưỡng thơm dịu mát', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },

      // 9. Bí đao
      { cat: 'cat-hg-9', name: '76. Sâm bí đao', desc: 'Nước sâm bí đao nấu truyền thống thanh nhiệt', sizes: [{ name: 'Tiêu chuẩn', price: 20000 }] },
      { cat: 'cat-hg-9', name: '77. Hồng trà bí đao', desc: 'Hồng trà đậm thơm kết hợp bí đao ngọt thanh', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-9', name: '78. Trà ô long bí đao', desc: 'Olong thanh tao quyện cùng bí đao giải khát', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },
      { cat: 'cat-hg-9', name: '79. Trà xanh bí đao', desc: 'Trà xanh thơm mát giải nhiệt độc đáo', sizes: [{ name: 'Tiêu chuẩn', price: 22000 }] },

      // 10. Yogurt (Sữa chua)
      { cat: 'cat-hg-10', name: 'Sữa chua Trái cây nhiệt đới', desc: 'Sữa chua dẻo kèm trái cây nhiệt đới tươi', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Việt quất', desc: 'Sữa chua vị việt quất chua ngọt thơm lừng', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Dâu tây', desc: 'Sữa chua dâu tây đỏ mọng thanh mát', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Mãng cầu', desc: 'Sữa chua dầm mãng cầu tươi chua thanh', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Đào', desc: 'Sữa chua đào giòn ngọt thơm dịu', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Ổi hồng', desc: 'Sữa chua thơm nức hương ổi hồng', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Dâu tằm', desc: 'Sữa chua dâu tằm chín mọng', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Khóm (thơm)', desc: 'Sữa chua dầm khóm chua ngọt hấp dẫn', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Dưa lưới', desc: 'Sữa chua dưa lưới ngọt mát lành', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Xoài', desc: 'Sữa chua xoài chín ngọt thơm', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Chanh dây', desc: 'Sữa chua chanh dây chua thơm đậm đà', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Trân châu đường đen', desc: 'Sữa chua kèm trân châu đường đen dẻo ngọt', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] },
      { cat: 'cat-hg-10', name: 'Sữa chua Hạt đác', desc: 'Sữa chua kèm hạt đác rim dẻo dai', sizes: [{ name: 'Tiêu chuẩn', price: 27000 }] }
    ]
  };
  await insertStoreData(hogiStoreId, hogiData);

  console.log('--- HOÀN TẤT CẬP NHẬT 5 QUÁN CHÍNH XÁC 100% VỚI MENU ---');
}

async function cleanStoreMenu(storeId) {
  const prods = await all(`SELECT id FROM products WHERE store_id = ?`, [storeId]);
  for (const p of prods) {
    await run(`DELETE FROM product_sizes WHERE product_id = ?`, [p.id]);
  }
  await run(`DELETE FROM products WHERE store_id = ?`, [storeId]);
  await run(`DELETE FROM categories WHERE store_id = ?`, [storeId]);
  await run(`DELETE FROM product_toppings WHERE store_id = ?`, [storeId]);
}

async function insertStoreData(storeId, data) {
  for (const cat of data.categories) {
    await run(`
      INSERT INTO categories (id, store_id, name, display_order)
      VALUES (?, ?, ?, ?)
    `, [cat.id, storeId, cat.name, cat.order]);
  }

  for (const top of data.toppings) {
    await run(`
      INSERT INTO product_toppings (id, store_id, name, price)
      VALUES (?, ?, ?, ?)
    `, [top.id, storeId, top.name, top.price]);
  }

  for (const prod of data.products) {
    const prodId = `prod-${uuidv4().substring(0, 8)}`;
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      prodId,
      storeId,
      prod.cat,
      prod.name,
      prod.image || '',
      prod.desc || '',
      prod.is_available !== undefined ? prod.is_available : 1
    ]);

    for (let i = 0; i < prod.sizes.length; i++) {
      const sz = prod.sizes[i];
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), prodId, sz.name, sz.price, i === 0 ? 1 : 0]);
    }
  }
}

if (require.main === module) {
  updateAllMenus().catch(console.error);
}

module.exports = { updateAllMenus };
