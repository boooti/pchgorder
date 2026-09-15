const { run, all, get } = require('./db');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { getImageForDrink } = require('./update_product_images');

async function updateAllMenus() {
  console.log('Đang cập nhật 4 quán theo đúng hình menu đính kèm...');

  // 1. Quán 1: Hogi Coffee & Tea
  const hogiStoreId = 'store-hogi';
  await run(`
    INSERT INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      logo = excluded.logo,
      cover_image = excluded.cover_image,
      address = excluded.address,
      phone = excluded.phone,
      notes = excluded.notes,
      is_active = 1
  `, [
    hogiStoreId,
    'Hogi Coffee & Tea',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    'L4-C27 Phan Thị Ràng, P. Rạch Giá',
    '0969 487 712',
    'Menu áp dụng dịp Tết 2026 - Đầy đủ Cà phê, Trà sữa, Trà sáng tạo, Yogurt'
  ]);

  await run(`
    INSERT OR REPLACE INTO delivery_profiles (id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes)
    VALUES (?, ?, 'Lê Long Giang', '0918 901 234', 'Văn phòng Công ty', '11:15', 'Gọi trước khi giao 5 phút')
  `, [`dp-${hogiStoreId}`, hogiStoreId]);

  // Menu file for Hogi
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [hogiStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, 'menu_hogi.jpg', '/uploads/menu_hogi.jpg', 'jpg', 1)
  `, [uuidv4(), hogiStoreId]);

  // Clean old products for Hogi
  await run(`DELETE FROM products WHERE store_id = ?`, [hogiStoreId]);
  await run(`DELETE FROM categories WHERE store_id = ?`, [hogiStoreId]);
  await run(`DELETE FROM product_toppings WHERE store_id = ?`, [hogiStoreId]);

  // Categories for Hogi
  const hogiCats = [
    { id: 'cat-hg-new', name: 'Món Mới (New)' },
    { id: 'cat-hg-cf', name: 'Cà Phê' },
    { id: 'cat-hg-ts', name: 'Trà Sữa Đậm Vị' },
    { id: 'cat-hg-st', name: 'Trà Sáng Tạo' },
    { id: 'cat-hg-tc', name: 'Trà Trái Cây' },
    { id: 'cat-hg-mc', name: 'Matcha Nhật Bản' },
    { id: 'cat-hg-ca', name: 'Cacao' },
    { id: 'cat-hg-tm', name: 'Trà Thanh Mát' },
    { id: 'cat-hg-yg', name: 'Yogurt (Sữa Chua)' },
    { id: 'cat-hg-bd', name: 'Bí Đao' }
  ];
  for (let i = 0; i < hogiCats.length; i++) {
    await run(`INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)`, [
      hogiCats[i].id, hogiStoreId, hogiCats[i].name, i + 1
    ]);
  }

  // Toppings for Hogi
  const hogiToppings = [
    { name: 'Trân châu đen', price: 6000 },
    { name: 'Sương sáo', price: 6000 },
    { name: 'Pudding', price: 6000 },
    { name: 'Trân châu trắng', price: 6000 },
    { name: 'Ô long 3Q', price: 6000 },
    { name: 'Macchiato', price: 6000 },
    { name: 'Đậu đỏ', price: 6000 },
    { name: 'Hạt chia', price: 6000 },
    { name: 'Kem trứng', price: 8000 },
    { name: 'Hạt sen', price: 8000 },
    { name: 'Hạt đác', price: 8000 },
    { name: 'Củ năng', price: 8000 },
    { name: 'Trái cây thêm', price: 8000 }
  ];
  for (const t of hogiToppings) {
    await run(`INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)`, [
      uuidv4(), hogiStoreId, t.name, t.price
    ]);
  }

  // Products for Hogi
  const hogiProducts = [
    // Món mới
    { cat: 'cat-hg-new', name: 'Trà mùa xuân (bản đặc biệt)', price: 30000, desc: 'Trà thảo mộc thơm thanh phiên bản đặc biệt' },
    { cat: 'cat-hg-new', name: 'Trà táo đỏ', price: 30000, desc: 'Trà táo đỏ thanh mát bổ dưỡng' },
    { cat: 'cat-hg-new', name: 'Trà hoa hibiscus', price: 27000, desc: 'Vị chua ngọt thanh tao hoa atiso đỏ' },
    { cat: 'cat-hg-new', name: 'Hồng trà Bá Tước', price: 22000, desc: 'Hồng trà Earl Grey hương cam bergamot' },
    { cat: 'cat-hg-new', name: 'Hồng trà Bá Tước kem trứng', price: 27000, desc: 'Lớp kem trứng béo ngậy phủ trên hồng trà' },
    { cat: 'cat-hg-new', name: 'Hồng trà sữa Bá Tước', price: 27000, desc: 'Trà sữa hương Bá Tước thơm nồng' },
    { cat: 'cat-hg-new', name: 'Hồng trà sữa Bá Tước kem trứng', price: 30000, desc: 'Trà sữa Bá Tước kết hợp kem trứng béo' },
    { cat: 'cat-hg-new', name: 'Bơ sữa trân châu đường đen', price: 32000, desc: 'Bơ sáp béo ngậy kèm trân châu đường đen' },
    { cat: 'cat-hg-new', name: 'Bơ già dừa non', price: 30000, desc: 'Bơ sáp dẻo quánh cùng dừa non ngọt bùi' },
    { cat: 'cat-hg-new', name: 'Trà mận (theo mùa)', price: 27000, desc: 'Mận tươi chua ngọt mọng nước' },
    { cat: 'cat-hg-new', name: 'Trà kiwi', price: 30000, desc: 'Kiwi tươi mát lạnh đánh thức năng lượng' },
    { cat: 'cat-hg-new', name: 'Trà lựu đỏ', price: 30000, desc: 'Hạt lựu đỏ ngọt ngào thanh khiết' },

    // Cà phê
    { cat: 'cat-hg-cf', name: 'Cà phê đen đá', price: 17000, desc: 'Espresso cà phê pha máy đậm đà nguyên chất' },
    { cat: 'cat-hg-cf', name: 'Cà phê sữa đá', price: 20000, desc: 'Cà phê pha máy hòa quyện sữa đặc truyền thống' },
    { cat: 'cat-hg-cf', name: 'Cà phê kem muối', price: 22000, desc: 'Cà phê thơm nồng với lớp kem muối biển sánh mịn' },
    { cat: 'cat-hg-cf', name: 'Cà phê kem trứng', price: 24000, desc: 'Lớp kem trứng thơm béo phủ trên cà phê đậm' },
    { cat: 'cat-hg-cf', name: 'Bạc xỉu', price: 20000, desc: 'Nhiều sữa ít cà phê ngọt ngào béo thơm' },
    { cat: 'cat-hg-cf', name: 'Cà phê sữa tươi', price: 20000, desc: 'Cà phê thơm mát cùng sữa tươi thanh trùng' },
    { cat: 'cat-hg-cf', name: 'Cà phê sữa tươi sương sáo', price: 22000, desc: 'Sữa tươi cà phê thanh mát kèm thạch sương sáo' },
    { cat: 'cat-hg-cf', name: 'Phindi hạnh nhân', price: 25000, desc: 'Cà phê đậm thơm ngát vị hạnh nhân' },
    { cat: 'cat-hg-cf', name: 'Cà phê caramel', price: 24000, desc: 'Sốt caramel thơm ngậy hòa quyện espresso' },

    // Trà sữa đậm vị
    { cat: 'cat-hg-ts', name: 'Trà sữa Phúc Long', price: 27000, desc: 'Vị trà sữa đậm đà đặc trưng' },
    { cat: 'cat-hg-ts', name: 'Trà sữa Ôlong', price: 27000, desc: 'Trà ô long nướng béo ngậy' },
    { cat: 'cat-hg-ts', name: 'Trà sữa Ôlong nhài', price: 27000, desc: 'Hương hoa nhài thơm ngát ngọt dịu' },
    { cat: 'cat-hg-ts', name: 'Trà sữa Matcha Nhật Bản', price: 30000, desc: 'Bột trà xanh nguyên chất đậm vị' },
    { cat: 'cat-hg-ts', name: 'Trà sữa Socola', price: 29000, desc: 'Hương cacao socola béo thơm quyến rũ' },
    { cat: 'cat-hg-ts', name: 'Trà sữa Thái đỏ (Cha Thai)', price: 27000, desc: 'Trà sữa Thái thơm ngát màu cam đỏ đặc trưng' },
    { cat: 'cat-hg-ts', name: 'Sữa tươi trân châu đường đen', price: 27000, desc: 'Sữa tươi Đà Lạt cùng trân châu đường đen dẻo mềm' },

    // Trà sáng tạo
    { cat: 'cat-hg-st', name: 'Trà đào', price: 25000, desc: 'Trà đào thơm mát miếng đào giòn ngọt' },
    { cat: 'cat-hg-st', name: 'Trà đào cam sả', price: 30000, desc: 'Sự kết hợp hoàn hảo giữa đào, cam vàng và sả tươi' },
    { cat: 'cat-hg-st', name: 'Trà vải', price: 27000, desc: 'Trà vải thơm thanh giải nhiệt' },
    { cat: 'cat-hg-st', name: 'Trà thạch vải', price: 32000, desc: 'Trà vải kèm thạch vải dẻo giòn' },
    { cat: 'cat-hg-st', name: 'Trà sen vàng', price: 30000, desc: 'Trà ô long kèm hạt sen bùi ngậy' },
    { cat: 'cat-hg-st', name: 'Trà ô long hạt sen lá nếp', price: 27000, desc: 'Hương lá nếp thơm phức quyện hạt sen' },
    { cat: 'cat-hg-st', name: 'Trà ô long sen nhãn', price: 27000, desc: 'Hạt sen bùi và cùi nhãn ngọt lành' },
    { cat: 'cat-hg-st', name: 'Trà đen macchiato', price: 27000, desc: 'Trà đen hảo hạng phủ kem macchiato' },
    { cat: 'cat-hg-st', name: 'Trà ôlong macchiato', price: 27000, desc: 'Ôlong thơm ngát cùng lớp bọt sữa' },
    { cat: 'cat-hg-st', name: 'Hồng trà Phúc Long macchiato', price: 27000, desc: 'Lớp kem béo trên nền hồng trà đậm vị' },
    { cat: 'cat-hg-st', name: 'Hồng trà Bá Tước macchiato', price: 27000, desc: 'Hương cam bergamot với macchiato sánh mịn' },
    { cat: 'cat-hg-st', name: 'Hồng trà sủi bọt', price: 20000, desc: 'Trà truyền thống lắc sủi bọt tươi mát' },

    // Trà trái cây
    { cat: 'cat-hg-tc', name: 'Trà trái cây nhiệt đới', price: 25000, desc: 'Hòa quyện nhiều loại trái cây tươi mát' },
    { cat: 'cat-hg-tc', name: 'Trà mãng cầu', price: 27000, desc: 'Mãng cầu xiêm chua ngọt giải nhiệt' },
    { cat: 'cat-hg-tc', name: 'Trà ổi hồng', price: 25000, desc: 'Ổi hồng thanh ngọt hương thơm tự nhiên' },
    { cat: 'cat-hg-tc', name: 'Trà dâu', price: 25000, desc: 'Dâu tây tươi mọng nước mát lạnh' },
    { cat: 'cat-hg-tc', name: 'Trà dâu tằm', price: 27000, desc: 'Dâu tằm chín mọng chua ngọt đậm đà' },
    { cat: 'cat-hg-tc', name: 'Trà lài đác thơm', price: 27000, desc: 'Hạt đác rim thơm cùng hương trà lài' },
    { cat: 'cat-hg-tc', name: 'Trà dưa lưới', price: 25000, desc: 'Dưa lưới thanh mát ngọt dịu' },
    { cat: 'cat-hg-tc', name: 'Trà xoài chanh leo', price: 25000, desc: 'Xoài chín ngọt cùng chanh dây sảng khoái' },
    { cat: 'cat-hg-tc', name: 'Trà việt quất', price: 27000, desc: 'Việt quất bổ dưỡng thơm ngát' },

    // Matcha Nhật Bản
    { cat: 'cat-hg-mc', name: 'Latte Matcha', price: 25000, desc: 'Matcha Uji thơm bùi béo ngậy' },
    { cat: 'cat-hg-mc', name: 'Latte Matcha Caramel', price: 27000, desc: 'Matcha kết hợp sốt caramel ngọt lịm' },
    { cat: 'cat-hg-mc', name: 'Latte Matcha Coco', price: 27000, desc: 'Matcha hòa quyện nước dừa tươi' },
    { cat: 'cat-hg-mc', name: 'Latte Matcha đậu đỏ', price: 29000, desc: 'Matcha kèm đậu đỏ bùi ngọt phong cách Nhật' },
    { cat: 'cat-hg-mc', name: 'Latte Matcha Machiato', price: 29000, desc: 'Lớp kem macchiato béo mịn trên nền matcha' },

    // Cacao
    { cat: 'cat-hg-ca', name: 'Cacao sữa đá', price: 18000, desc: 'Cacao nguyên chất đậm thơm ngọt béo' },
    { cat: 'cat-hg-ca', name: 'Cacao kem muối', price: 20000, desc: 'Cacao kem muối mằn mặn béo ngậy' },
    { cat: 'cat-hg-ca', name: 'Cacao kem trứng', price: 22000, desc: 'Cacao hòa quyện lớp kem trứng béo' },
    { cat: 'cat-hg-ca', name: 'Latte Chocolate', price: 22000, desc: 'Sữa tươi socola mềm mịn ngọt ngào' },

    // Trà thanh mát
    { cat: 'cat-hg-tm', name: 'Trà tắc - Trà chanh', price: 15000, desc: 'Thức uống giải khát quốc dân mát lạnh' },
    { cat: 'cat-hg-tm', name: 'Trà chanh mật ong', price: 20000, desc: 'Mật ong rừng hòa cùng chanh tươi thanh mát' },
    { cat: 'cat-hg-tm', name: 'Trà chanh dây', price: 20000, desc: 'Chanh dây tươi thơm nức chua ngọt' },
    { cat: 'cat-hg-tm', name: 'Cam vắt', price: 17000, desc: 'Cam sành vắt tươi nguyên chất bổ sung vitamin C' },

    // Yogurt
    { cat: 'cat-hg-yg', name: 'Sữa chua Trái cây nhiệt đới', price: 27000, desc: 'Sữa chua dẻo mịn kết hợp trái cây tươi' },
    { cat: 'cat-hg-yg', name: 'Sữa chua Việt quất', price: 27000, desc: 'Sữa chua kết hợp mứt việt quất chua ngọt' },
    { cat: 'cat-hg-yg', name: 'Sữa chua Trân châu đường đen', price: 27000, desc: 'Sữa chua cùng trân châu dai mềm' },

    // Bí đao
    { cat: 'cat-hg-bd', name: 'Sâm bí đao', price: 20000, desc: 'Nước sâm bí đao thanh nhiệt làm mát cơ thể' },
    { cat: 'cat-hg-bd', name: 'Trà ô long bí đao', price: 22000, desc: 'Trà ô long kết hợp cốt bí đao thanh lọc' }
  ];

  for (const p of hogiProducts) {
    const prodId = uuidv4();
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [prodId, hogiStoreId, p.cat, p.name, getImageForDrink(p.name, p.cat), p.desc]);

    await run(`
      INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
      VALUES (?, ?, 'Tiêu chuẩn', ?, 1)
    `, [uuidv4(), prodId, p.price]);
  }
  console.log(`Đã nạp thành công menu Hogi Coffee & Tea (${hogiProducts.length} món, 13 topping).`);

  // 2. Quán 2: Kamin Coffee
  const kaminStoreId = 'store-kamin';
  await run(`
    INSERT INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      logo = excluded.logo,
      cover_image = excluded.cover_image,
      address = excluded.address,
      phone = excluded.phone,
      notes = excluded.notes,
      is_active = 1
  `, [
    kaminStoreId,
    'Kamin Coffee',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    'F1-17 Hoàng Văn Thụ',
    '0844 482 225',
    'Chuyên cà phê, matcha, cacao milo, trà trái cây các size M, L, XL'
  ]);

  await run(`
    INSERT OR REPLACE INTO delivery_profiles (id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes)
    VALUES (?, ?, 'Trần Thị Diễm Linh', '0934 567 890', 'Văn phòng Công ty', '11:15', 'Gọi trước khi giao 5 phút')
  `, [`dp-${kaminStoreId}`, kaminStoreId]);

  // Menu file for Kamin
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [kaminStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, 'menu_kamin.jpg', '/uploads/menu_kamin.jpg', 'jpg', 1)
  `, [uuidv4(), kaminStoreId]);

  // Clean old products for Kamin
  await run(`DELETE FROM products WHERE store_id = ?`, [kaminStoreId]);
  await run(`DELETE FROM categories WHERE store_id = ?`, [kaminStoreId]);
  await run(`DELETE FROM product_toppings WHERE store_id = ?`, [kaminStoreId]);

  // Categories for Kamin
  const kaminCats = [
    { id: 'cat-km-cf', name: 'Cà Phê' },
    { id: 'cat-km-mc', name: 'Matcha' },
    { id: 'cat-km-ca', name: 'Cacao (Milo)' },
    { id: 'cat-km-tc', name: 'Trà Trái Cây' },
    { id: 'cat-km-ls', name: 'Latte Sữa & Khoai Môn' },
    { id: 'cat-km-nm', name: 'Nước Mát & Lipton' }
  ];
  for (let i = 0; i < kaminCats.length; i++) {
    await run(`INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)`, [
      kaminCats[i].id, kaminStoreId, kaminCats[i].name, i + 1
    ]);
  }

  // Toppings for Kamin
  const kaminToppings = [
    { name: 'Trân châu', price: 7000 },
    { name: 'Kem phô mai', price: 10000 },
    { name: 'Kem trứng', price: 10000 },
    { name: 'Kem muối', price: 10000 }
  ];
  for (const t of kaminToppings) {
    await run(`INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)`, [
      uuidv4(), kaminStoreId, t.name, t.price
    ]);
  }

  // Products for Kamin (with sizes M, L, XL)
  const kaminProducts = [
    { cat: 'cat-km-cf', name: 'Đen đá', sizes: [{ n: 'M', p: 15000 }, { n: 'L', p: 18000 }, { n: 'XL', p: 25000 }] },
    { cat: 'cat-km-cf', name: 'Phin sữa đá', sizes: [{ n: 'M', p: 18000 }, { n: 'L', p: 25000 }, { n: 'XL', p: 30000 }] },
    { cat: 'cat-km-cf', name: 'Cà phê kem muối / kem trứng', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 37000 }] },
    { cat: 'cat-km-cf', name: 'Bạc xỉu', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-cf', name: 'Bạc xỉu kem muối / kem trứng', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 35000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-cf', name: 'Phindi hạnh nhân', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-cf', name: 'Phindi sữa dừa', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-cf', name: 'Phindi choco', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-cf', name: 'Sữa tươi cafe', sizes: [{ n: 'M', p: 20000 }, { n: 'L', p: 25000 }, { n: 'XL', p: 30000 }] },

    // Matcha
    { cat: 'cat-km-mc', name: 'Matcha Latte', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-mc', name: 'Matcha Latte kem muối', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-mc', name: 'Matcha Latte kem trứng', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-mc', name: 'Matcha Oreo', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-mc', name: 'Coco Matcha', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-mc', name: 'Matcha Latte dâu / việt quất', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-mc', name: 'Matcha Latte dâu kem phô mai', sizes: [{ n: 'M', p: 30000 }, { n: 'L', p: 35000 }, { n: 'XL', p: 40000 }] },

    // Cacao
    { cat: 'cat-km-ca', name: 'Cacao Latte', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] },
    { cat: 'cat-km-ca', name: 'Cacao Latte Oreo', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-ca', name: 'Cacao kem muối', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 37000 }] },
    { cat: 'cat-km-ca', name: 'Cacao kem trứng', sizes: [{ n: 'M', p: 27000 }, { n: 'L', p: 32000 }, { n: 'XL', p: 37000 }] },
    { cat: 'cat-km-ca', name: 'Cacao sữa dừa', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },

    // Trà trái cây
    { cat: 'cat-km-tc', name: 'Trà vải', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà dâu', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà dưa lưới', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà ổi hồng', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà ổi hồng chanh dây', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà việt quất', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà sen nhãn táo đỏ', sizes: [{ n: 'M', p: 30000 }, { n: 'L', p: 35000 }, { n: 'XL', p: 40000 }] },
    { cat: 'cat-km-tc', name: 'Trà long nhãn', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-tc', name: 'Trà chanh bạc hà', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] },

    // Latte sữa & Khoai môn
    { cat: 'cat-km-ls', name: 'Khoai môn Latte', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] },
    { cat: 'cat-km-ls', name: 'Khoai môn kem muối', sizes: [{ n: 'M', p: 25000 }, { n: 'L', p: 30000 }, { n: 'XL', p: 35000 }] },
    { cat: 'cat-km-ls', name: 'Sữa dâu phô mai kem dẻo', sizes: [{ n: 'M', p: 30000 }, { n: 'L', p: 40000 }, { n: 'XL', p: 50000 }] },

    // Nước mát & Lipton
    { cat: 'cat-km-nm', name: 'Lipton sữa', sizes: [{ n: 'M', p: 22000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] },
    { cat: 'cat-km-nm', name: 'Lipton chanh', sizes: [{ n: 'M', p: 18000 }, { n: 'L', p: 23000 }, { n: 'XL', p: 28000 }] },
    { cat: 'cat-km-nm', name: 'Cam vắt tươi', sizes: [{ n: 'M', p: 20000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] },
    { cat: 'cat-km-nm', name: 'Chanh dây tươi', sizes: [{ n: 'M', p: 20000 }, { n: 'L', p: 27000 }, { n: 'XL', p: 32000 }] }
  ];

  for (const p of kaminProducts) {
    const prodId = uuidv4();
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, 'Món đặc trưng Kamin Coffee', 1)
    `, [prodId, kaminStoreId, p.cat, p.name, getImageForDrink(p.name, p.cat)]);

    for (let s = 0; s < p.sizes.length; s++) {
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), prodId, p.sizes[s].n, p.sizes[s].p, s === 0 ? 1 : 0]);
    }
  }
  console.log(`Đã nạp thành công menu Kamin Coffee (${kaminProducts.length} món các size M, L, XL).`);

  // 3. Quán 3: Katinat Coffee & Tea
  const katStoreId = 'store-katinat';
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [katStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, 'menu_katinat.jpg', '/uploads/menu_katinat.jpg', 'jpg', 1)
  `, [uuidv4(), katStoreId]);

  // Clean old products for Katinat
  await run(`DELETE FROM products WHERE store_id = ?`, [katStoreId]);
  await run(`DELETE FROM categories WHERE store_id = ?`, [katStoreId]);
  await run(`DELETE FROM product_toppings WHERE store_id = ?`, [katStoreId]);

  const katCats = [
    { id: 'cat-kt-cf', name: 'Cà Phê Phin Mê & Espresso' },
    { id: 'cat-kt-pv', name: 'Phong Vị Mới (Katinat Special)' },
    { id: 'cat-kt-ts', name: 'Trà Sữa Đậm Vị' },
    { id: 'cat-kt-tc', name: 'Trà Trái Cây' }
  ];
  for (let i = 0; i < katCats.length; i++) {
    await run(`INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)`, [
      katCats[i].id, katStoreId, katCats[i].name, i + 1
    ]);
  }

  const katToppings = [
    { name: 'Topping Tàu Hũ', price: 15000 },
    { name: 'Trân Châu Phô Mai Dẻo', price: 15000 },
    { name: 'Trân Châu Trắng', price: 10000 },
    { name: 'Huyền Châu Đường Mật', price: 15000 },
    { name: 'Kem Sữa Phô Mai', price: 15000 },
    { name: 'Bánh Flan', price: 15000 },
    { name: 'Thạch Hồng Đài', price: 12000 },
    { name: 'Thạch Bưởi Aiyu', price: 12000 }
  ];
  for (const t of katToppings) {
    await run(`INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)`, [
      uuidv4(), katStoreId, t.name, t.price
    ]);
  }

  const katProducts = [
    // Cà phê
    { cat: 'cat-kt-cf', name: 'Mê Sữa Đá', sizes: [{ n: 'M', p: 39000 }, { n: 'L', p: 55000 }] },
    { cat: 'cat-kt-cf', name: 'Mê Đen Đá', sizes: [{ n: 'M', p: 35000 }, { n: 'L', p: 49000 }] },
    { cat: 'cat-kt-cf', name: 'Mê Xỉu', sizes: [{ n: 'M', p: 39000 }, { n: 'L', p: 55000 }] },
    { cat: 'cat-kt-cf', name: 'Mê Dừa Non', sizes: [{ n: 'M', p: 49000 }, { n: 'L', p: 60000 }] },
    { cat: 'cat-kt-cf', name: 'Espresso Sữa Đá', sizes: [{ n: 'M', p: 35000 }, { n: 'L', p: 48000 }] },
    { cat: 'cat-kt-cf', name: 'Espresso Đen Đá', sizes: [{ n: 'M', p: 32000 }, { n: 'L', p: 45000 }] },
    { cat: 'cat-kt-cf', name: 'Americano', sizes: [{ n: 'Tiêu chuẩn', p: 35000 }] },
    { cat: 'cat-kt-cf', name: 'Latte Baba Nana', sizes: [{ n: 'Tiêu chuẩn', p: 59000 }] },
    { cat: 'cat-kt-cf', name: 'Latte Hạt Phỉ', sizes: [{ n: 'Tiêu chuẩn', p: 59000 }] },

    // Phong vị mới
    { cat: 'cat-kt-pv', name: 'Iki Matcha Tàu Hũ', sizes: [{ n: 'Tiêu chuẩn', p: 69000 }] },
    { cat: 'cat-kt-pv', name: 'Iki Matcha Latte', sizes: [{ n: 'Tiêu chuẩn', p: 59000 }] },
    { cat: 'cat-kt-pv', name: 'Bơ Già Dừa Non', sizes: [{ n: 'M', p: 55000 }, { n: 'L', p: 69000 }] },
    { cat: 'cat-kt-pv', name: 'Taro Coco', sizes: [{ n: 'M', p: 55000 }, { n: 'L', p: 69000 }] },
    { cat: 'cat-kt-pv', name: 'Dâu Lắc Phô Mai', sizes: [{ n: 'M', p: 55000 }, { n: 'L', p: 69000 }] },
    { cat: 'cat-kt-pv', name: 'Huyền Châu Đường Mật', sizes: [{ n: 'Tiêu chuẩn', p: 65000 }] },
    { cat: 'cat-kt-pv', name: 'Sô-Cô-La Katinat', sizes: [{ n: 'M', p: 45000 }, { n: 'L', p: 55000 }] },

    // Trà sữa
    { cat: 'cat-kt-ts', name: 'Thanh Hương Camellia', sizes: [{ n: 'M', p: 50000 }, { n: 'L', p: 65000 }] },
    { cat: 'cat-kt-ts', name: 'Trà Sữa Chôm Chôm', sizes: [{ n: 'Tiêu chuẩn', p: 60000 }] },
    { cat: 'cat-kt-ts', name: 'Oolong Ba Lá', sizes: [{ n: 'M', p: 45000 }, { n: 'L', p: 55000 }] },
    { cat: 'cat-kt-ts', name: 'Trà Sữa Oolong Nướng', sizes: [{ n: 'M', p: 45000 }, { n: 'L', p: 55000 }] },

    // Trà trái cây
    { cat: 'cat-kt-tc', name: 'Hibi Sơ Ri', sizes: [{ n: 'Tiêu chuẩn', p: 69000 }] },
    { cat: 'cat-kt-tc', name: 'Cóc Cóc Đác Đác', sizes: [{ n: 'Tiêu chuẩn', p: 69000 }] },
    { cat: 'cat-kt-tc', name: 'Trà Oolong Dâu Mai Sơn', sizes: [{ n: 'Tiêu chuẩn', p: 60000 }] },
    { cat: 'cat-kt-tc', name: 'Trà Đào Hồng Đài', sizes: [{ n: 'Tiêu chuẩn', p: 65000 }] },
    { cat: 'cat-kt-tc', name: 'Trà Cam Quế Hồng Đài', sizes: [{ n: 'Tiêu chuẩn', p: 55000 }] },
    { cat: 'cat-kt-tc', name: 'Trà Vải', sizes: [{ n: 'Tiêu chuẩn', p: 55000 }] },
    { cat: 'cat-kt-tc', name: 'Trà Hoa Cúc Mật Ong', sizes: [{ n: 'Tiêu chuẩn', p: 55000 }] }
  ];

  for (const p of katProducts) {
    const prodId = uuidv4();
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, 'Món chính thức Katinat Coffee & Tea', 1)
    `, [prodId, katStoreId, p.cat, p.name, getImageForDrink(p.name, p.cat)]);

    for (let s = 0; s < p.sizes.length; s++) {
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), prodId, p.sizes[s].n, p.sizes[s].p, s === 0 ? 1 : 0]);
    }
  }
  console.log(`Đã nạp thành công menu Katinat (${katProducts.length} món chuẩn hình).`);

  // 4. Quán 4: Highlands Coffee
  const hlStoreId = 'store-highlands';
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [hlStoreId]);
  await run(`
    INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
    VALUES (?, ?, 'menu_highlands.jpg', '/uploads/menu_highlands.jpg', 'jpg', 1)
  `, [uuidv4(), hlStoreId]);

  // Clean old products for Highlands
  await run(`DELETE FROM products WHERE store_id = ?`, [hlStoreId]);
  await run(`DELETE FROM categories WHERE store_id = ?`, [hlStoreId]);
  await run(`DELETE FROM product_toppings WHERE store_id = ?`, [hlStoreId]);

  const hlCats = [
    { id: 'cat-hl-ph', name: 'Cà Phê Pha Phin' },
    { id: 'cat-hl-fr', name: 'Freeze Đá Xay' },
    { id: 'cat-hl-tr', name: 'Trà Highlands' },
    { id: 'cat-hl-es', name: 'Cà Phê Espresso' },
    { id: 'cat-hl-ok', name: 'Thức Uống Khác' }
  ];
  for (let i = 0; i < hlCats.length; i++) {
    await run(`INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)`, [
      hlCats[i].id, hlStoreId, hlCats[i].name, i + 1
    ]);
  }

  const hlToppings = [
    { name: 'Thạch sen vàng', price: 10000 },
    { name: 'Hạt sen', price: 10000 },
    { name: 'Thạch đào', price: 10000 },
    { name: 'Thạch vải', price: 10000 },
    { name: 'Đậu đỏ', price: 10000 },
    { name: 'Thêm Shot Espresso', price: 10000 }
  ];
  for (const t of hlToppings) {
    await run(`INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)`, [
      uuidv4(), hlStoreId, t.name, t.price
    ]);
  }

  const hlProducts = [
    // Phin
    { cat: 'cat-hl-ph', name: 'Phin Sữa Đá', sizes: [{ n: 'Nhỏ', p: 29000 }, { n: 'Vừa', p: 35000 }, { n: 'Lớn', p: 39000 }] },
    { cat: 'cat-hl-ph', name: 'Phin Đen Đá', sizes: [{ n: 'Nhỏ', p: 29000 }, { n: 'Vừa', p: 35000 }, { n: 'Lớn', p: 39000 }] },
    { cat: 'cat-hl-ph', name: 'Bạc Xỉu Đá', sizes: [{ n: 'Nhỏ', p: 29000 }, { n: 'Vừa', p: 35000 }, { n: 'Lớn', p: 39000 }] },

    // Freeze
    { cat: 'cat-hl-fr', name: 'Freeze Trà Xanh', sizes: [{ n: 'Nhỏ', p: 49000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] },
    { cat: 'cat-hl-fr', name: 'Freeze Sô-cô-la', sizes: [{ n: 'Nhỏ', p: 49000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] },
    { cat: 'cat-hl-fr', name: 'Cookies & Cream', sizes: [{ n: 'Nhỏ', p: 49000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] },
    { cat: 'cat-hl-fr', name: 'Caramel Phin Freeze', sizes: [{ n: 'Nhỏ', p: 49000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] },
    { cat: 'cat-hl-fr', name: 'Classic Phin Freeze', sizes: [{ n: 'Nhỏ', p: 49000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] },

    // Trà
    { cat: 'cat-hl-tr', name: 'Trà Sen Vàng', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-tr', name: 'Trà Thạch Đào', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-tr', name: 'Trà Thanh Đào', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-tr', name: 'Trà Thạch Vải', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-tr', name: 'Trà Xanh Đậu Đỏ', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },

    // Espresso
    { cat: 'cat-hl-es', name: 'Espresso / Americano', sizes: [{ n: 'Nhỏ', p: 35000 }, { n: 'Vừa', p: 39000 }, { n: 'Lớn', p: 45000 }] },
    { cat: 'cat-hl-es', name: 'Cappuccino / Latte', sizes: [{ n: 'Nhỏ', p: 55000 }, { n: 'Vừa', p: 65000 }, { n: 'Lớn', p: 69000 }] },
    { cat: 'cat-hl-es', name: 'Mocha / Caramel Macchiato', sizes: [{ n: 'Nhỏ', p: 59000 }, { n: 'Vừa', p: 69000 }, { n: 'Lớn', p: 75000 }] },

    // Khác
    { cat: 'cat-hl-ok', name: 'Chanh Đá Xay / Đá Viên', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-ok', name: 'Chanh Dây Đá Viên', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-ok', name: 'Tắc / Quất Đá Viên', sizes: [{ n: 'Nhỏ', p: 39000 }, { n: 'Vừa', p: 49000 }, { n: 'Lớn', p: 55000 }] },
    { cat: 'cat-hl-ok', name: 'Sô-Cô-La (nóng hoặc đá)', sizes: [{ n: 'Nhỏ', p: 54000 }, { n: 'Vừa', p: 59000 }, { n: 'Lớn', p: 65000 }] }
  ];

  for (const p of hlProducts) {
    const prodId = uuidv4();
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, 'Món chính thức Highlands Coffee', 1)
    `, [prodId, hlStoreId, p.cat, p.name, getImageForDrink(p.name, p.cat)]);

    for (let s = 0; s < p.sizes.length; s++) {
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), prodId, p.sizes[s].n, p.sizes[s].p, s === 0 ? 1 : 0]);
    }
  }
  console.log(`Đã nạp thành công menu Highlands Coffee (${hlProducts.length} món chuẩn hình).`);

  // Switch today's session to Hogi Coffee & Tea
  const today = new Date().toISOString().split('T')[0];
  await run(`
    UPDATE daily_order_sessions
    SET store_id = ?,
        notes = 'Phiên order Hogi Coffee & Tea - Đầy đủ trà, cà phê, yogurt',
        recipient_name_snapshot = 'Lê Long Giang',
        recipient_phone_snapshot = '0918 901 234',
        delivery_address_snapshot = 'Văn phòng Công ty',
        delivery_time_snapshot = '11:15',
        delivery_note_snapshot = 'Gọi trước khi giao 5 phút'
    WHERE id = 'session-today'
  `, [hogiStoreId]);

  console.log('Hoàn thành cập nhật toàn bộ menu!');
}

updateAllMenus().catch(console.error);
