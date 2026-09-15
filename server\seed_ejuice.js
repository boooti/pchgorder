const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { run, all, get } = require('./db');

async function seedEJuice() {
  console.log('Seeding quán Ê Juice (Rạch Giá)...');

  const store = {
    id: 'store-ejuice',
    name: 'Ê Juice (Rạch Giá)',
    logo: '/uploads/logo_ejuice.svg',
    cover_image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    address: 'Đối diện Trường TT GD TX Rạch Giá, Kiên Giang',
    phone: '0977 581 547',
    notes: 'Tươi mát nhức người! Menu đầy đủ cà phê, matcha, trà trái cây, sinh tố, nước ép tươi.',
    delivery: {
      recipient_name: 'Huỳnh Thái Lel',
      recipient_phone: '0901 234 567',
      delivery_address: 'Tầng 8, Tòa nhà Landmark 81, 720A Điện Biên Phủ',
      desired_delivery_time: '11:30',
      delivery_notes: 'Gọi trước khi giao 5 phút, shipper gửi lễ tân tầng trệt hoặc tầng 8.'
    },
    menu_files: [
      { file_name: 'menu_ejuice.jpg', file_path: '/uploads/menu_ejuice.jpg', file_type: 'jpg', page_order: 1 }
    ],
    categories: [
      { id: 'cat-ej-1', name: 'Ê cà phê !', order: 1 },
      { id: 'cat-ej-2', name: 'Matcha & Cacao', order: 2 },
      { id: 'cat-ej-3', name: 'Trà trái cây tươi', order: 3 },
      { id: 'cat-ej-4', name: 'Hồng trà & Olong', order: 4 },
      { id: 'cat-ej-5', name: 'Trái cây dầm', order: 5 },
      { id: 'cat-ej-6', name: 'Nước ép tươi', order: 6 },
      { id: 'cat-ej-7', name: 'Sinh tố', order: 7 },
      { id: 'cat-ej-8', name: 'Yaout & Dừa', order: 8 }
    ],
    toppings: [
      { id: 'top-ej-1', name: 'Trân châu trắng', price: 3000 },
      { id: 'top-ej-2', name: 'Kem muối', price: 5000 },
      { id: 'top-ej-3', name: 'Thạch nổ củ năng', price: 3000 }
    ],
    products: [
      // 1. Ê cà phê !
      {
        id: 'prod-ej-cf1', category_id: 'cat-ej-1', name: 'Cà phê máy',
        desc: 'Cà phê pha máy nguyên chất thơm lừng, đậm gu',
        sizes: [{ name: 'Tiêu chuẩn', price: 20000, default: 1 }]
      },
      {
        id: 'prod-ej-cf2', category_id: 'cat-ej-1', name: 'Phê phin',
        desc: 'Cà phê phin truyền thống đậm đà phong vị Việt',
        sizes: [{ name: 'Tiêu chuẩn', price: 15000, default: 1 }]
      },
      {
        id: 'prod-ej-cf3', category_id: 'cat-ej-1', name: 'Cà phê sữa VN',
        desc: 'Cà phê pha phin hòa quyện sữa đặc béo ngậy ngọt ngào',
        sizes: [{ name: 'Tiêu chuẩn', price: 20000, default: 1 }]
      },
      {
        id: 'prod-ej-cf4', category_id: 'cat-ej-1', name: 'Cà phê muối',
        desc: 'Best-seller lớp kem muối béo mặn hòa quyện nền cà phê đậm đà',
        sizes: [{ name: 'Tiêu chuẩn', price: 25000, default: 1 }]
      },
      {
        id: 'prod-ej-cf5', category_id: 'cat-ej-1', name: 'Cà phê sữa tươi',
        desc: 'Cà phê nguyên chất kết hợp sữa tươi thanh béo dịu nhẹ',
        sizes: [{ name: 'Tiêu chuẩn', price: 20000, default: 1 }]
      },
      {
        id: 'prod-ej-cf6', category_id: 'cat-ej-1', name: 'Bạc xỉu',
        desc: 'Nhiều sữa ít cà phê, béo thơm ngọt dịu',
        sizes: [{ name: 'Tiêu chuẩn', price: 20000, default: 1 }]
      },
      {
        id: 'prod-ej-cf7', category_id: 'cat-ej-1', name: 'Trà lài',
        desc: 'Trà lài ướp hoa tươi thơm mát, thanh lọc giải nhiệt',
        sizes: [{ name: 'Tiêu chuẩn', price: 15000, default: 1 }]
      },

      // 2. Matcha & Cacao
      {
        id: 'prod-ej-mc1', category_id: 'cat-ej-2', name: 'Matcha latte',
        desc: 'Bột trà xanh Nhật Bản hòa quyện sữa tươi thơm béo mịn màng',
        sizes: [{ name: 'L', price: 25000, default: 1 }, { name: 'XL', price: 30000, default: 0 }]
      },
      {
        id: 'prod-ej-mc2', category_id: 'cat-ej-2', name: 'Matcha latte kem muối',
        desc: 'Matcha sữa tươi phủ lớp kem muối mặn béo ngậy cực cuốn',
        sizes: [{ name: 'L', price: 27000, default: 1 }, { name: 'XL', price: 32000, default: 0 }]
      },
      {
        id: 'prod-ej-mc3', category_id: 'cat-ej-2', name: 'Matcha latte dâu',
        desc: 'Matcha cao cấp kết hợp mứt dâu tây chua ngọt tươi mới',
        sizes: [{ name: 'L', price: 25000, default: 1 }, { name: 'XL', price: 30000, default: 0 }]
      },
      {
        id: 'prod-ej-mc4', category_id: 'cat-ej-2', name: 'Matcha latte xoài',
        desc: 'Matcha sữa thơm lừng kết hợp xoài tươi nhiệt đới',
        sizes: [{ name: 'L', price: 25000, default: 1 }, { name: 'XL', price: 30000, default: 0 }]
      },
      {
        id: 'prod-ej-mc5', category_id: 'cat-ej-2', name: 'Matcha latte đào',
        desc: 'Sự kết hợp độc đáo giữa matcha béo và đào thơm giòn thanh mát',
        sizes: [{ name: 'L', price: 25000, default: 1 }, { name: 'XL', price: 30000, default: 0 }]
      },
      {
        id: 'prod-ej-mc6', category_id: 'cat-ej-2', name: 'Cacao latte',
        desc: 'Cacao nguyên chất đậm đà kết hợp sữa tươi béo thơm',
        sizes: [{ name: 'L', price: 25000, default: 1 }]
      },
      {
        id: 'prod-ej-mc7', category_id: 'cat-ej-2', name: 'Cacao sữa',
        desc: 'Cacao pha sữa đặc sánh mịn, ngọt béo',
        sizes: [{ name: 'L', price: 22000, default: 1 }]
      },
      {
        id: 'prod-ej-mc8', category_id: 'cat-ej-2', name: 'Cacao đá/nóng',
        desc: 'Cacao đậm vị truyền thống, dùng nóng hoặc đá',
        sizes: [{ name: 'L', price: 22000, default: 1 }]
      },
      {
        id: 'prod-ej-mc9', category_id: 'cat-ej-2', name: 'Khoai môn latte',
        desc: 'Khoai môn bùi béo dẻo thơm hòa quyện sữa tươi',
        sizes: [{ name: 'L', price: 25000, default: 1 }]
      },
      {
        id: 'prod-ej-mc10', category_id: 'cat-ej-2', name: 'Trà sữa gạo rang HOT/ICE',
        desc: 'Hương gạo rang thơm lừng phong cách Nhật, vị trà sữa béo ngậy',
        sizes: [{ name: 'L', price: 25000, default: 1 }, { name: 'XL', price: 30000, default: 0 }]
      },

      // 3. Trà trái cây tươi
      {
        id: 'prod-ej-tc1', category_id: 'cat-ej-3', name: 'Trà chanh',
        desc: 'Trà chanh truyền thống chua thanh đã khát',
        sizes: [{ name: 'L', price: 15000, default: 1 }, { name: 'XL', price: 20000, default: 0 }]
      },
      {
        id: 'prod-ej-tc2', category_id: 'cat-ej-3', name: 'Trà đào',
        desc: 'Trà đào thơm nức mũi kèm những lát đào giòn ngọt',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-tc3', category_id: 'cat-ej-3', name: 'Trà tắc miền tây',
        desc: 'Tắc thơm chua mát đậm chất giải nhiệt miền Tây',
        sizes: [{ name: 'L', price: 15000, default: 1 }, { name: 'XL', price: 20000, default: 0 }]
      },
      {
        id: 'prod-ej-tc4', category_id: 'cat-ej-3', name: 'Trà tắc thái xanh',
        desc: 'Trà xanh Thái Lan đậm vị hòa quyện tắc tươi',
        sizes: [{ name: 'L', price: 17000, default: 1 }, { name: 'XL', price: 22000, default: 0 }]
      },
      {
        id: 'prod-ej-tc5', category_id: 'cat-ej-3', name: 'Trà ổi hồng',
        desc: 'Ổi hồng thơm ngát, vị chua ngọt nhẹ tênh cực đã',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-tc6', category_id: 'cat-ej-3', name: 'Trà dâu',
        desc: 'Trà dâu tây tươi mọng nước, màu hồng bắt mắt',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-tc7', category_id: 'cat-ej-3', name: 'Trà vải hoa hồng',
        desc: 'Hương hoa hồng quyến rũ kết hợp vải ngọt mọng nước',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-tc8', category_id: 'cat-ej-3', name: 'Trà dâu tằm',
        desc: 'Dâu tằm chín mọng chua ngọt thanh mát bổ dưỡng',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },

      // 4. Hồng trà & Olong
      {
        id: 'prod-ej-ht1', category_id: 'cat-ej-4', name: 'Hồng trà kem muối',
        desc: 'Hồng trà đậm vị phủ kem cheese muối mặn béo ngậy',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-ht2', category_id: 'cat-ej-4', name: 'Olong kem muối',
        desc: 'Trà ô long thơm hoa thảo mộc phủ lớp kem muối sánh mịn',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-ht3', category_id: 'cat-ej-4', name: 'Hồng trà chanh',
        desc: 'Hồng trà truyền thống kết hợp chanh tươi chua ngọt thanh khiết',
        sizes: [{ name: 'L', price: 15000, default: 1 }, { name: 'XL', price: 20000, default: 0 }]
      },

      // 5. Trái cây dầm
      {
        id: 'prod-ej-cd1', category_id: 'cat-ej-5', name: 'Bơ dầm',
        desc: 'Bơ sáp dẻo quánh dầm sữa đặc và cốt dừa béo bùi',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },

      // 6. Nước ép
      {
        id: 'prod-ej-ne1', category_id: 'cat-ej-6', name: 'Ép cam lòng',
        desc: 'Cam sành vắt tươi mọng nước, giàu Vitamin C',
        sizes: [{ name: 'L', price: 12000, default: 1 }, { name: 'XL', price: 19000, default: 0 }]
      },
      {
        id: 'prod-ej-ne2', category_id: 'cat-ej-6', name: 'Ép dưa hấu',
        desc: 'Dưa hấu tươi ép nguyên chất mát lạnh sảng khoái',
        sizes: [{ name: 'L', price: 12000, default: 1 }, { name: 'XL', price: 19000, default: 0 }]
      },
      {
        id: 'prod-ej-ne3', category_id: 'cat-ej-6', name: 'Ép lựu, lê, dưa lưới, ổi, dứa',
        desc: 'Nước ép thanh mát phối hợp ngũ quả thơm ngon',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-ne4', category_id: 'cat-ej-6', name: 'Ép táo, cà rốt, cà chua',
        desc: 'Combo nước ép đẹp da, giữ dáng, tốt cho sức khỏe',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-ne5', category_id: 'cat-ej-6', name: 'Ép Mix (mún gì được đó)',
        desc: 'Tùy chọn mix các loại trái cây tươi ngon theo sở thích',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },

      // 7. Sinh tố
      {
        id: 'prod-ej-st1', category_id: 'cat-ej-7', name: 'Sinh tố Cam, cà rốt, xoài, dâu',
        desc: 'Sinh tố nhiệt đới xay nhuyễn cùng sữa đặc và đá tuyết',
        sizes: [{ name: 'L', price: 17000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-st2', category_id: 'cat-ej-7', name: 'Sinh tố Bơ, dừa (topping vụn dừa sấy)',
        desc: 'Sinh tố bơ dừa béo ngậy phủ vụn dừa sấy giòn tan',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },

      // 8. Yaout & Dừa
      {
        id: 'prod-ej-yd1', category_id: 'cat-ej-8', name: 'Yaout dâu',
        desc: 'Sữa chua dẻo mịn kết hợp sốt dâu tây ngọt ngào chua nhẹ',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-yd2', category_id: 'cat-ej-8', name: 'Yaout đào',
        desc: 'Sữa chua mát lạnh thơm lừng vị đào tươi',
        sizes: [{ name: 'L', price: 20000, default: 1 }, { name: 'XL', price: 25000, default: 0 }]
      },
      {
        id: 'prod-ej-yd3', category_id: 'cat-ej-8', name: 'Dừa tươi',
        desc: 'Nước dừa tươi nguyên chất thanh ngọt tự nhiên',
        sizes: [{ name: 'Ly', price: 20000, default: 1 }]
      },
      {
        id: 'prod-ej-yd4', category_id: 'cat-ej-8', name: 'Dừa tắc',
        desc: 'Nước dừa ngọt dịu pha chút tắc chua thanh, giải nhiệt tức thì',
        sizes: [{ name: 'L', price: 15000, default: 1 }, { name: 'XL', price: 20000, default: 0 }]
      }
    ]
  };

  // Upsert Store
  await run(`
    INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [store.id, store.name, store.logo, store.cover_image, store.address, store.phone, store.notes]);

  // Delivery Profile
  await run(`
    INSERT OR REPLACE INTO delivery_profiles (
      id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'del-ejuice',
    store.id,
    store.delivery.recipient_name,
    store.delivery.recipient_phone,
    store.delivery.delivery_address,
    store.delivery.desired_delivery_time,
    store.delivery.delivery_notes
  ]);

  // Clean old menu files for ejuice, then insert
  await run(`DELETE FROM store_menu_files WHERE store_id = ?`, [store.id]);
  for (const mf of store.menu_files) {
    await run(`
      INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [uuidv4(), store.id, mf.file_name, mf.file_path, mf.file_type, mf.page_order]);
  }

  // Insert categories
  for (const cat of store.categories) {
    await run(`
      INSERT OR REPLACE INTO categories (id, store_id, name, display_order)
      VALUES (?, ?, ?, ?)
    `, [cat.id, store.id, cat.name, cat.order]);
  }

  // Insert toppings
  for (const top of store.toppings) {
    await run(`
      INSERT OR REPLACE INTO product_toppings (id, store_id, name, price)
      VALUES (?, ?, ?, ?)
    `, [top.id, store.id, top.name, top.price]);
  }

  // Insert products and sizes
  for (const prod of store.products) {
    // Check if product exists to keep any existing id or replace
    await run(`
      INSERT OR REPLACE INTO products (id, store_id, category_id, name, image, description, is_available)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      prod.id,
      store.id,
      prod.category_id,
      prod.name,
      '', // will be filled by update_product_images.js
      prod.desc
    ]);

    await run(`DELETE FROM product_sizes WHERE product_id = ?`, [prod.id]);
    for (const sz of prod.sizes) {
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), prod.id, sz.name, sz.price, sz.default || 0]);
    }
  }

  console.log(`Successfully seeded ${store.products.length} products for Ê Juice!`);
}

seedEJuice().then(() => {
  console.log('Done seed Ê Juice.');
  process.exit(0);
}).catch(err => {
  console.error('Error seeding Ê Juice:', err);
  process.exit(1);
});
