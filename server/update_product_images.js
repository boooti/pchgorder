const { run, all } = require('./db');

// Standardized Shared Category Images for Maximum Simplicity & Elegance
const SHARED_IMAGES = {
  // 1. Pure Aesthetic Coffee
  COFFEE: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
  // 2. Fresh Iced Tea / Fruit Tea
  TEA: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  // 3. Fresh Smoothie & Cold-Pressed Juice
  SMOOTHIE_JUICE: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  // 4. Matcha, Cacao & Creamy Milk Tea
  MATCHA_MILKTEA: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400',
  // 5. Yogurt / Fruit Crush / Coconut
  YAOURT_DESSERT: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400'
};

function getImageForDrink(name, categoryName) {
  const n = (name + ' ' + (categoryName || '')).toLowerCase();

  // 1. Sinh tố & Nước ép
  if (
    n.includes('sinh tố') ||
    n.includes('nước ép') ||
    n.includes('ép ') ||
    n.startsWith('ép') ||
    n.includes('dầm') ||
    n.includes('smoothie') ||
    n.includes('juice') ||
    n.includes('bơ sáp') ||
    n.includes('bơ dừa')
  ) {
    return SHARED_IMAGES.SMOOTHIE_JUICE;
  }

  // 2. Cà phê
  if (
    n.includes('cà phê') ||
    n.includes('cafe') ||
    n.includes('coffee') ||
    n.includes('phin') ||
    n.includes('đen đá') ||
    n.includes('sữa đá') ||
    n.includes('bạc xỉu') ||
    n.includes('cà phê muối') ||
    n.includes('espresso') ||
    n.includes('americano') ||
    n.includes('cappuccino') ||
    n.includes('latte') && !n.includes('matcha') && !n.includes('cacao')
  ) {
    return SHARED_IMAGES.COFFEE;
  }

  // 3. Matcha & Cacao & Trà sữa
  if (
    n.includes('matcha') ||
    n.includes('cacao') ||
    n.includes('socola') ||
    n.includes('sô-cô-la') ||
    n.includes('choco') ||
    n.includes('milo') ||
    n.includes('trà sữa') ||
    n.includes('khoai môn') ||
    n.includes('oreo')
  ) {
    return SHARED_IMAGES.MATCHA_MILKTEA;
  }

  // 4. Yaout & Dừa & Sữa chua
  if (
    n.includes('yaout') ||
    n.includes('sữa chua') ||
    n.includes('yogurt') ||
    n.includes('dừa tươi') ||
    n.includes('dừa tắc')
  ) {
    return SHARED_IMAGES.YAOURT_DESSERT;
  }

  // 5. Trà các loại (Trà đào, trà tắc, trà lài, trà chanh, trà dâu, trà ô long, hồng trà...)
  return SHARED_IMAGES.TEA;
}

async function updateAllProductImages() {
  console.log('Bắt đầu chuẩn hóa hình ảnh minh họa menu dùng chung theo danh mục...');

  const products = await all(`
    SELECT p.id, p.name, p.store_id, c.name as cat_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `);

  console.log(`Tìm thấy ${products.length} món nước trong cơ sở dữ liệu.`);

  let updatedCount = 0;
  for (const prod of products) {
    const imageUrl = getImageForDrink(prod.name, prod.cat_name);
    await run('UPDATE products SET image = ? WHERE id = ?', [imageUrl, prod.id]);
    updatedCount++;
  }

  console.log(`Đã cập nhật thành công hình ảnh dùng chung cho ${updatedCount} món nước!`);
}

if (require.main === module) {
  updateAllProductImages().catch(console.error);
}

module.exports = { SHARED_IMAGES, getImageForDrink, updateAllProductImages };
