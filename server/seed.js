const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { initSchema, run, all, get, UPLOADS_DIR } = require('./db');

async function seed() {
  await initSchema();
  console.log('Seeding initial data...');

  // 1. Create sample menu image files in uploads
  const menuFiles = [
    {
      name: 'katinat_menu_page1.svg',
      svg: `<svg width="800" height="1100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2b1f16"/>
        <rect x="20" y="20" width="760" height="1060" rx="16" fill="#38291e" stroke="#d97706" stroke-width="3"/>
        <text x="400" y="90" fill="#fef3c7" font-family="sans-serif" font-size="42" font-weight="bold" text-anchor="middle">KATINAT COFFEE &amp; TEA</text>
        <text x="400" y="130" fill="#f59e0b" font-family="sans-serif" font-size="20" letter-spacing="4" text-anchor="middle">OFFICIAL MENU - TRANG 1: CÀ PHÊ &amp; ĐẶC TRƯNG</text>
        <line x1="80" y1="150" x2="720" y2="150" stroke="#d97706" stroke-width="2"/>
        
        <g transform="translate(80, 200)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Cà phê sữa Chóp Chóp</text>
          <text x="615" y="45" fill="#f59e0b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">45.000đ / 55.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Cà phê robusta đậm đà kèm lớp kem béo mặn đặc trưng</text>
        </g>
        <g transform="translate(80, 300)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Bơ Già Dừa Non</text>
          <text x="615" y="45" fill="#f59e0b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">60.000đ / 70.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Bơ sáp Đắk Lắk xay nhuyễn cùng nước cốt dừa béo ngậy</text>
        </g>
        <g transform="translate(80, 400)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Americano Cam Vàng</text>
          <text x="615" y="45" fill="#f59e0b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">45.000đ / 55.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Espresso tươi phối nước cam tươi mát lạnh</text>
        </g>
        <g transform="translate(80, 500)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Cà phê Muối Biển</text>
          <text x="615" y="45" fill="#f59e0b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">45.000đ / 55.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Kem muối biển bồng bềnh phủ trên nền cà phê phin nguyên chất</text>
        </g>
        <text x="400" y="1030" fill="#a89280" font-family="sans-serif" font-size="16" text-anchor="middle">Hotline: 028 7300 1005 • Katinat Saigon Kafe</text>
      </svg>`
    },
    {
      name: 'katinat_menu_page2.svg',
      svg: `<svg width="800" height="1100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2b1f16"/>
        <rect x="20" y="20" width="760" height="1060" rx="16" fill="#38291e" stroke="#10b981" stroke-width="3"/>
        <text x="400" y="90" fill="#fef3c7" font-family="sans-serif" font-size="42" font-weight="bold" text-anchor="middle">KATINAT COFFEE &amp; TEA</text>
        <text x="400" y="130" fill="#10b981" font-family="sans-serif" font-size="20" letter-spacing="4" text-anchor="middle">OFFICIAL MENU - TRANG 2: TRÀ SỮA &amp; TRÀ TRÁI CÂY</text>
        <line x1="80" y1="150" x2="720" y2="150" stroke="#10b981" stroke-width="2"/>
        
        <g transform="translate(80, 200)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Trà Oolong Tứ Quý Sữa</text>
          <text x="615" y="45" fill="#10b981" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">55.000đ / 65.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Trà Oolong thơm hoa hậu vị ngọt thanh kết hợp sữa béo</text>
        </g>
        <g transform="translate(80, 300)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Trà Đào Hồng Đài</text>
          <text x="615" y="45" fill="#10b981" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">50.000đ / 60.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Trà thanh mát cùng miếng đào giòn ngọt tự nhiên</text>
        </g>
        <g transform="translate(80, 400)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Trà Sữa Chôm Chôm</text>
          <text x="615" y="45" fill="#10b981" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">55.000đ / 65.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Món best-seller độc quyền với trái chôm chôm tươi ngọt</text>
        </g>
        <g transform="translate(80, 500)">
          <rect width="640" height="80" rx="8" fill="#4a3728"/>
          <text x="25" y="45" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">Trà Xanh Macchiato</text>
          <text x="615" y="45" fill="#10b981" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="end">50.000đ / 60.000đ</text>
          <text x="25" y="68" fill="#d6c3b3" font-family="sans-serif" font-size="15">Trà xanh thơm thanh cùng lớp váng sữa béo ngậy mềm mịn</text>
        </g>
        <text x="400" y="1030" fill="#a89280" font-family="sans-serif" font-size="16" text-anchor="middle">Topping: Phô mai dẻo (+10k) | Củ năng (+10k) | Kem Cheese (+12k)</text>
      </svg>`
    }
  ];

  for (const mf of menuFiles) {
    fs.writeFileSync(path.join(UPLOADS_DIR, mf.name), mf.svg);
  }

  // 2. Insert 47 Employees
  const employeesList = [
    { id: 'emp-03', name: 'Lâm Hoàng Lam', phone: '0903456789', department: 'Ban GĐ', is_active: 1 },
    { id: 'emp-14', name: 'Nguyễn Ngọc Nguyên', phone: '0914567890', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-15', name: 'Trần Thị Hương', phone: '0915678901', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-16', name: 'Trần Thị Trinh', phone: '0916789012', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-17', name: 'Hồ Huy Toàn', phone: '0917890123', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-18', name: 'Lê Long Giang', phone: '0918901234', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-19', name: 'Thị Yến Linh', phone: '0919012345', department: 'Đầu tư - Pháp lý', is_active: 1 },
    { id: 'emp-20', name: 'Nguyễn Văn Công', phone: '0920123456', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-21', name: 'Trần Văn Nhựt Cường', phone: '0921234567', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-22', name: 'Trương Đình Thi', phone: '0922345678', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-23', name: 'Trần Văn Sua', phone: '0923456789', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-24', name: 'Nguyễn Thị Minh Thư', phone: '0924567890', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-25', name: 'Hưng Tấn Đạt', phone: '0925678901', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-26', name: 'Nguyễn Hồng Ái', phone: '0926789012', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-27', name: 'Đồng Hữu Phú', phone: '0927890123', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-28', name: 'Trần Minh Đăng', phone: '0928901234', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-29', name: 'Dư Văn Đạt', phone: '0929012345', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-30', name: 'Nguyễn Kiều Tiên', phone: '0930123456', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-31', name: 'Phạm Bình An', phone: '0931234567', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-32', name: 'Huỳnh Tấn Lộc', phone: '0932345678', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-33', name: 'Lâm Thiên Phú', phone: '0933456789', department: 'Phòng BIM', is_active: 1 },
    { id: 'emp-34', name: 'Trần Thị Diễm Linh', phone: '0934567890', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-35', name: 'Vũ Huỳnh Như Ý', phone: '0935678901', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-36', name: 'Nguyễn Phương Loan', phone: '0936789012', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-37', name: 'Trần Chí Hậu', phone: '0937890123', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-38', name: 'Trần Võ Phương Nghi', phone: '0938901234', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-39', name: 'Trần Thị Nhung', phone: '0939012345', department: 'Phòng Kinh doanh', is_active: 1 },
    { id: 'emp-40', name: 'Đào Thị Huyền Trân', phone: '0940123456', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-41', name: 'Nguyễn Tất Vũ', phone: '0941234567', department: 'Phòng Kinh doanh', is_active: 1 },
    { id: 'emp-42', name: 'Thị Mỹ Duyên', phone: '0942234567', department: 'Tài chính - Nhân sự', is_active: 1 },
    { id: 'emp-43', name: 'Nguyễn Thị Kim Yến', phone: '0943234567', department: 'Ban GĐ', is_active: 1 },
    { id: 'emp-04', name: 'Vũ Đăng Trình', phone: '0904567890', department: 'BQLDA', is_active: 1 },
    { id: 'emp-05', name: 'Nguyễn Tam Giác', phone: '0905678901', department: 'BQLDA', is_active: 1 },
    { id: 'emp-06', name: 'Trần Trung Tiến', phone: '0906789012', department: 'BQLDA', is_active: 1 },
    { id: 'emp-07', name: 'Trương Vĩnh Thế', phone: '0907890123', department: 'BQLDA', is_active: 1 },
    { id: 'emp-08', name: 'Du Vinh Huê', phone: '0908901234', department: 'BQLDA', is_active: 1 },
    { id: 'emp-09', name: 'Lê Minh Đăng', phone: '0909012345', department: 'BQLDA', is_active: 1 },
    { id: 'emp-10', name: 'Phan Văn Nhân', phone: '0910123456', department: 'BQLDA', is_active: 1 },
    { id: 'emp-11', name: 'Đoàn Tuấn Anh', phone: '0911234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-12', name: 'Nguyễn Văn Chiến', phone: '0912345678', department: 'BQLDA', is_active: 1 },
    { id: 'emp-13', name: 'Trần Thanh Tiến', phone: '0913456789', department: 'BQLDA', is_active: 1 },
    { id: 'emp-44', name: 'Lê Văn Hóa', phone: '0944234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-45', name: 'Lâm Vĩ Khang', phone: '0945234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-46', name: 'Nguyễn Minh Trí', phone: '0946234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-47', name: 'Đinh Đặng Hồng Vĩ', phone: '0947234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-48', name: 'Nguyễn Quang Đủ', phone: '0948234567', department: 'BQLDA', is_active: 1 },
    { id: 'emp-49', name: 'Lê Đình Thạnh', phone: '0949234567', department: 'BQLDA', is_active: 1 }
  ];

  for (const emp of employeesList) {
    await run(`
      INSERT OR REPLACE INTO employees (id, name, phone, department, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [emp.id, emp.name, emp.phone, emp.department, emp.is_active]);
  }
  console.log('Seeded 47 employees.');

  // 3. Insert Stores & Delivery Profiles
  const stores = [
    {
      id: 'store-katinat',
      name: 'Katinat Saigon Kafe',
      logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      address: '91 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM',
      phone: '028 7300 1005',
      notes: 'Quán đông vào khoảng 11h-12h, nên đặt sớm trước 10:30.',
      delivery: {
        recipient_name: 'Nguyễn Văn An',
        recipient_phone: '0901 234 567',
        delivery_address: 'Tầng 8, Tòa nhà Landmark 81, 720A Điện Biên Phủ, P.22, Bình Thạnh',
        desired_delivery_time: '11:15',
        delivery_notes: 'Gọi trước khi giao 5 phút. Shipper lên thang máy tầng 8 lễ tân nhận.'
      },
      menu_files: [
        { file_name: 'katinat_menu_page1.svg', file_path: '/uploads/katinat_menu_page1.svg', file_type: 'svg', page_order: 1 },
        { file_name: 'katinat_menu_page2.svg', file_path: '/uploads/katinat_menu_page2.svg', file_type: 'svg', page_order: 2 }
      ],
      categories: [
        { id: 'cat-kat-1', name: 'Cà phê & Đậm đà', order: 1 },
        { id: 'cat-kat-2', name: 'Trà Sữa & Đậm Vị Trà', order: 2 },
        { id: 'cat-kat-3', name: 'Trà Trái Cây Tươi', order: 3 },
        { id: 'cat-kat-4', name: 'Đá Xay & Sinh Tố', order: 4 }
      ],
      toppings: [
        { id: 'top-kat-1', name: 'Trân châu phô mai dẻo', price: 10000 },
        { id: 'top-kat-2', name: 'Thạch củ năng', price: 10000 },
        { id: 'top-kat-3', name: 'Sương sáo hoàng kim', price: 8000 },
        { id: 'top-kat-4', name: 'Kem cheese Chóp Chóp', price: 12000 },
        { id: 'top-kat-5', name: 'Hạt sen bùi ngọt', price: 10000 }
      ],
      products: [
        {
          id: 'prod-kat-1', category_id: 'cat-kat-1', name: 'Cà phê sữa Chóp Chóp',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80',
          desc: 'Cà phê robusta đậm đà kèm lớp kem béo mặn đặc trưng chóp chóp',
          sizes: [{ name: 'M', price: 45000, default: 1 }, { name: 'L', price: 55000, default: 0 }]
        },
        {
          id: 'prod-kat-2', category_id: 'cat-kat-2', name: 'Trà Oolong Tứ Quý Sữa',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà Oolong nướng thơm hoa đậm vị kết hợp sữa tươi New Zealand',
          sizes: [{ name: 'M', price: 55000, default: 1 }, { name: 'L', price: 65000, default: 0 }]
        },
        {
          id: 'prod-kat-3', category_id: 'cat-kat-4', name: 'Bơ Già Dừa Non',
          image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=300&auto=format&fit=crop&q=80',
          desc: 'Bơ sáp Đắk Lắk dẻo mịn kết hợp cùng nước dừa và cơm dừa non',
          sizes: [{ name: 'M', price: 60000, default: 1 }, { name: 'L', price: 70000, default: 0 }]
        },
        {
          id: 'prod-kat-4', category_id: 'cat-kat-3', name: 'Trà Đào Hồng Đài',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà thảo mộc hồng đài chua ngọt thanh tao kèm miếng đào giòn',
          sizes: [{ name: 'M', price: 50000, default: 1 }, { name: 'L', price: 60000, default: 0 }]
        },
        {
          id: 'prod-kat-5', category_id: 'cat-kat-2', name: 'Trà Sữa Chôm Chôm',
          image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=80',
          desc: 'Vị trà sữa truyền thống thơm ngát kết hợp cùng topping chôm chôm tươi',
          sizes: [{ name: 'M', price: 55000, default: 1 }, { name: 'L', price: 65000, default: 0 }]
        },
        {
          id: 'prod-kat-6', category_id: 'cat-kat-1', name: 'Americano Cam Vàng',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
          desc: 'Espresso nguyên chất kết hợp nước cam tươi sảng khoái đánh thức năng lượng',
          sizes: [{ name: 'M', price: 45000, default: 1 }, { name: 'L', price: 55000, default: 0 }]
        },
        {
          id: 'prod-kat-7', category_id: 'cat-kat-1', name: 'Cà phê Muối Biển',
          image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&auto=format&fit=crop&q=80',
          desc: 'Lớp kem béo ngậy vị mặn mà hòa quyện cùng cà phê phin đậm đà',
          sizes: [{ name: 'M', price: 45000, default: 1 }, { name: 'L', price: 55000, default: 0 }]
        },
        {
          id: 'prod-kat-8', category_id: 'cat-kat-2', name: 'Trà Xanh Macchiato',
          image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=80',
          desc: 'Cốt trà xanh lài hảo hạng phủ macchiato sữa tươi sánh mịn',
          sizes: [{ name: 'M', price: 50000, default: 1 }, { name: 'L', price: 60000, default: 0 }]
        },
        {
          id: 'prod-kat-9', category_id: 'cat-kat-3', name: 'Trà Vải Lài',
          image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà lài thơm nức kết hợp nước cốt vải và trái vải ngâm mọng nước',
          sizes: [{ name: 'M', price: 50000, default: 1 }, { name: 'L', price: 60000, default: 0 }]
        },
        {
          id: 'prod-kat-10', category_id: 'cat-kat-4', name: 'Cacao Dừa Đá Xay',
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80',
          desc: 'Cacao nguyên chất xay nhuyễn cùng nước cốt dừa thơm béo ngậy',
          sizes: [{ name: 'M', price: 60000, default: 1 }, { name: 'L', price: 70000, default: 0 }]
        },
        {
          id: 'prod-kat-11', category_id: 'cat-kat-2', name: 'Matcha Latte Thượng Hạng',
          image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=300&auto=format&fit=crop&q=80',
          desc: 'Bột matcha Uji Nhật Bản đánh tan cùng sữa tươi ấm ngọt dịu',
          sizes: [{ name: 'M', price: 55000, default: 1 }, { name: 'L', price: 65000, default: 0 }]
        },
        {
          id: 'prod-kat-12', category_id: 'cat-kat-1', name: 'Bạc Xỉu Sữa Dừa (TẠM HẾT)',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80',
          desc: 'Món nước đang tạm hết nguyên liệu sữa dừa tươi hôm nay',
          is_available: 0,
          sizes: [{ name: 'M', price: 45000, default: 1 }, { name: 'L', price: 55000, default: 0 }]
        }
      ]
    },
    {
      id: 'store-highlands',
      name: 'Highlands Coffee',
      logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80',
      address: '123 Lê Lợi, Bến Thành, Quận 1, TP.HCM',
      phone: '1900 1755',
      notes: 'Đầy đủ cà phê phin truyền thống và freeze đá xay.',
      delivery: {
        recipient_name: 'Trần Thị Bích',
        recipient_phone: '0902 345 678',
        delivery_address: 'Tầng 8, Tòa nhà Landmark 81, 720A Điện Biên Phủ',
        desired_delivery_time: '11:30',
        delivery_notes: 'Giao tại sảnh lễ tân tầng trệt hoặc gọi trước.'
      },
      menu_files: [
        { file_name: 'highlands_menu.svg', file_path: '/uploads/katinat_menu_page1.svg', file_type: 'svg', page_order: 1 }
      ],
      categories: [
        { id: 'cat-hl-1', name: 'Cà phê Phin Việt Nam', order: 1 },
        { id: 'cat-hl-2', name: 'Freeze Đá Xay', order: 2 },
        { id: 'cat-hl-3', name: 'Trà Highlands', order: 3 }
      ],
      toppings: [
        { id: 'top-hl-1', name: 'Thạch sen vàng', price: 10000 },
        { id: 'top-hl-2', name: 'Hạt sen bùi thơm', price: 10000 },
        { id: 'top-hl-3', name: 'Thạch trà đào', price: 10000 },
        { id: 'top-hl-4', name: 'Bánh Flan mềm mịn', price: 12000 }
      ],
      products: [
        {
          id: 'prod-hl-1', category_id: 'cat-hl-1', name: 'Phin Sữa Đá',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80',
          desc: 'Cà phê phin truyền thống hòa quyện sữa đặc béo ngậy trứ danh',
          sizes: [{ name: 'S', price: 39000, default: 0 }, { name: 'M', price: 45000, default: 1 }, { name: 'L', price: 49000, default: 0 }]
        },
        {
          id: 'prod-hl-2', category_id: 'cat-hl-2', name: 'Freeze Trà Xanh',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
          desc: 'Freeze trà xanh mát lạnh kết hợp thạch giòn dai và kem whipping',
          sizes: [{ name: 'S', price: 55000, default: 0 }, { name: 'M', price: 65000, default: 1 }, { name: 'L', price: 69000, default: 0 }]
        },
        {
          id: 'prod-hl-3', category_id: 'cat-hl-3', name: 'Trà Sen Vàng',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80',
          desc: 'Hạt sen bùi, củ năng giòn cùng nước trà ô long thanh khiết và kem béo',
          sizes: [{ name: 'S', price: 49000, default: 0 }, { name: 'M', price: 55000, default: 1 }, { name: 'L', price: 65000, default: 0 }]
        },
        {
          id: 'prod-hl-4', category_id: 'cat-hl-1', name: 'PhinDi Hạnh Nhân',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
          desc: 'Cà phê Phin thế hệ mới thơm ngát hương hạnh nhân tinh tế',
          sizes: [{ name: 'S', price: 45000, default: 0 }, { name: 'M', price: 49000, default: 1 }, { name: 'L', price: 55000, default: 0 }]
        },
        {
          id: 'prod-hl-5', category_id: 'cat-hl-3', name: 'Trà Thạch Đào',
          image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà đen hảo hạng kết hợp vị đào tươi thơm ngọt và thạch đào dẻo giòn',
          sizes: [{ name: 'S', price: 49000, default: 0 }, { name: 'M', price: 55000, default: 1 }, { name: 'L', price: 65000, default: 0 }]
        },
        {
          id: 'prod-hl-6', category_id: 'cat-hl-2', name: 'Freeze Sô-cô-la',
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80',
          desc: 'Sô-cô-la đậm đặc xay đá tuyết mát lạnh phủ kem tươi ngọt lịm',
          sizes: [{ name: 'S', price: 55000, default: 0 }, { name: 'M', price: 65000, default: 1 }, { name: 'L', price: 69000, default: 0 }]
        }
      ]
    },
    {
      id: 'store-phuclong',
      name: 'Phúc Long Coffee & Tea',
      logo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&auto=format&fit=crop&q=80',
      address: '42 Ngô Đức Kế, Bến Nghé, Quận 1, TP.HCM',
      phone: '028 3822 8333',
      notes: 'Trà đậm vị, hậu ngọt sâu, nên chọn 50% hoặc 70% đường.',
      delivery: {
        recipient_name: 'Lê Hoàng Cường',
        recipient_phone: '0903 456 789',
        delivery_address: 'Tầng 8, Tòa nhà Landmark 81, 720A Điện Biên Phủ',
        desired_delivery_time: '11:45',
        delivery_notes: 'Gọi trước khi giao 10 phút để nhận nước.'
      },
      menu_files: [
        { file_name: 'phuclong_menu.svg', file_path: '/uploads/katinat_menu_page2.svg', file_type: 'svg', page_order: 1 }
      ],
      categories: [
        { id: 'cat-pl-1', name: 'Trà Sữa Truyền Thống', order: 1 },
        { id: 'cat-pl-2', name: 'Trà Trái Cây Đậm Vị', order: 2 },
        { id: 'cat-pl-3', name: 'Cà phê & Đá Xay', order: 3 }
      ],
      toppings: [
        { id: 'top-pl-1', name: 'Thạch Đào Phúc Long', price: 10000 },
        { id: 'top-pl-2', name: 'Trân châu đen dẻo', price: 8000 },
        { id: 'top-pl-3', name: 'Thạch Nha Đam tươi', price: 8000 }
      ],
      products: [
        {
          id: 'prod-pl-1', category_id: 'cat-pl-1', name: 'Trà Sữa Phúc Long',
          image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà đen hảo hạng đậm đà vị chát nhẹ hòa quyện sữa béo ngậy đặc trưng',
          sizes: [{ name: 'Regular', price: 50000, default: 1 }, { name: 'Large', price: 60000, default: 0 }]
        },
        {
          id: 'prod-pl-2', category_id: 'cat-pl-2', name: 'Trà Đào Phúc Long',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80',
          desc: 'Trà đen thanh đậm kết hợp đào miếng tươi giòn ngọt tự nhiên',
          sizes: [{ name: 'Regular', price: 55000, default: 1 }, { name: 'Large', price: 65000, default: 0 }]
        },
        {
          id: 'prod-pl-3', category_id: 'cat-pl-2', name: 'Trà Vải Lài',
          image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&auto=format&fit=crop&q=80',
          desc: 'Hương lài tinh khiết êm dịu kết hợp vị ngọt mọng của trái vải tươi',
          sizes: [{ name: 'Regular', price: 55000, default: 1 }, { name: 'Large', price: 65000, default: 0 }]
        },
        {
          id: 'prod-pl-4', category_id: 'cat-pl-1', name: 'Hồng Trà Sữa',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
          desc: 'Hồng trà thơm ấm quyện cùng dòng sữa béo ngậy ngọt ngào',
          sizes: [{ name: 'Regular', price: 45000, default: 1 }, { name: 'Large', price: 55000, default: 0 }]
        },
        {
          id: 'prod-pl-5', category_id: 'cat-pl-3', name: 'Cà phê Vanilla Latte',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80',
          desc: 'Espresso thơm nồng kết hợp sữa tươi và sốt vanilla ngọt dịu',
          sizes: [{ name: 'Regular', price: 50000, default: 1 }, { name: 'Large', price: 60000, default: 0 }]
        }
      ]
    }
  ];

  for (const st of stores) {
    await run(`
      INSERT OR REPLACE INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [st.id, st.name, st.logo, st.cover_image, st.address, st.phone, st.notes]);

    await run(`
      INSERT OR REPLACE INTO delivery_profiles (id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `dp-${st.id}`,
      st.id,
      st.delivery.recipient_name,
      st.delivery.recipient_phone,
      st.delivery.delivery_address,
      st.delivery.desired_delivery_time,
      st.delivery.delivery_notes
    ]);

    for (const mf of st.menu_files) {
      await run(`
        INSERT OR REPLACE INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [uuidv4(), st.id, mf.file_name, mf.file_path, mf.file_type, mf.page_order]);
    }

    for (const cat of st.categories) {
      await run(`
        INSERT OR REPLACE INTO categories (id, store_id, name, display_order)
        VALUES (?, ?, ?, ?)
      `, [cat.id, st.id, cat.name, cat.order]);
    }

    for (const top of st.toppings) {
      await run(`
        INSERT OR REPLACE INTO product_toppings (id, store_id, name, price)
        VALUES (?, ?, ?, ?)
      `, [top.id, st.id, top.name, top.price]);
    }

    for (const prod of st.products) {
      await run(`
        INSERT OR REPLACE INTO products (id, store_id, category_id, name, image, description, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        prod.id,
        st.id,
        prod.category_id,
        prod.name,
        prod.image,
        prod.desc,
        prod.is_available !== undefined ? prod.is_available : 1
      ]);

      for (const sz of prod.sizes) {
        await run(`
          INSERT OR REPLACE INTO product_sizes (id, product_id, size_name, price, is_default)
          VALUES (?, ?, ?, ?, ?)
        `, [uuidv4(), prod.id, sz.name, sz.price, sz.default || 0]);
      }
    }
  }
  console.log('Seeded 3 Stores with products, sizes, toppings, and menu files.');

  // 4. Create Today's Active Session (Katinat)
  const today = new Date().toISOString().split('T')[0];
  const sessionId = 'session-today';

  const katStore = stores[0];
  await run(`
    INSERT OR REPLACE INTO daily_order_sessions (
      id, session_date, store_id, status, open_time, close_time, notes,
      recipient_name_snapshot, recipient_phone_snapshot, delivery_address_snapshot, delivery_time_snapshot, delivery_note_snapshot
    ) VALUES (?, ?, ?, 'OPEN', '08:30', '11:00', 'Phiên order nước trưa nay - Katinat', ?, ?, ?, ?, ?)
  `, [
    sessionId,
    today,
    katStore.id,
    katStore.delivery.recipient_name,
    katStore.delivery.recipient_phone,
    katStore.delivery.delivery_address,
    katStore.delivery.desired_delivery_time,
    katStore.delivery.delivery_notes
  ]);

  // 5. Seed Realistic Orders for Today
  const todayOrders = [
    {
      emp_id: 'emp-01',
      items: [
        {
          prod_id: 'prod-kat-1',
          name: 'Cà phê sữa Chóp Chóp',
          size: 'M',
          price: 45000,
          qty: 2,
          sugar: '30%',
          ice: 'Ít đá',
          topping: 'Kem cheese Chóp Chóp',
          topping_price: 12000,
          note: 'Không quá ngọt'
        }
      ]
    },
    {
      emp_id: 'emp-02',
      items: [
        {
          prod_id: 'prod-kat-2',
          name: 'Trà Oolong Tứ Quý Sữa',
          size: 'L',
          price: 65000,
          qty: 1,
          sugar: '50%',
          ice: 'Ít đá',
          topping: 'Trân châu phô mai dẻo',
          topping_price: 10000,
          note: 'Cho nhiều ống hút'
        }
      ]
    },
    {
      emp_id: 'emp-03',
      items: [
        {
          prod_id: 'prod-kat-3',
          name: 'Bơ Già Dừa Non',
          size: 'M',
          price: 60000,
          qty: 1,
          sugar: '30%',
          ice: 'Bình thường',
          topping: '',
          topping_price: 0,
          note: 'Ít ngọt'
        }
      ]
    },
    {
      emp_id: 'emp-04',
      items: [
        {
          prod_id: 'prod-kat-6',
          name: 'Americano Cam Vàng',
          size: 'M',
          price: 45000,
          qty: 2,
          sugar: '0%',
          ice: 'Ít đá',
          topping: '',
          topping_price: 0,
          note: ''
        },
        {
          prod_id: 'prod-kat-6',
          name: 'Americano Cam Vàng',
          size: 'L',
          price: 55000,
          qty: 1,
          sugar: '0%',
          ice: 'Không đá',
          topping: '',
          topping_price: 0,
          note: 'Để riêng trong tủ lạnh'
        }
      ]
    },
    {
      emp_id: 'emp-05',
      items: [
        {
          prod_id: 'prod-kat-4',
          name: 'Trà Đào Hồng Đài',
          size: 'M',
          price: 50000,
          qty: 1,
          sugar: '50%',
          ice: 'Ít đá',
          topping: 'Thạch củ năng',
          topping_price: 10000,
          note: ''
        }
      ]
    },
    {
      emp_id: 'emp-06',
      items: [
        {
          prod_id: 'prod-kat-5',
          name: 'Trà Sữa Chôm Chôm',
          size: 'M',
          price: 55000,
          qty: 1,
          sugar: '50%',
          ice: 'Bình thường',
          topping: 'Trân châu phô mai dẻo',
          topping_price: 10000,
          note: ''
        }
      ]
    },
    {
      emp_id: 'emp-07',
      items: [
        {
          prod_id: 'prod-kat-11',
          name: 'Matcha Latte Thượng Hạng',
          size: 'M',
          price: 55000,
          qty: 2,
          sugar: '30%',
          ice: 'Ít đá',
          topping: '',
          topping_price: 0,
          note: ''
        }
      ]
    },
    {
      emp_id: 'emp-08',
      items: [
        {
          prod_id: 'prod-kat-11',
          name: 'Matcha Latte Thượng Hạng',
          size: 'M',
          price: 55000,
          qty: 2,
          sugar: '0%',
          ice: 'Bình thường',
          topping: '',
          topping_price: 0,
          note: ''
        },
        {
          prod_id: 'prod-kat-11',
          name: 'Matcha Latte Thượng Hạng',
          size: 'L',
          price: 65000,
          qty: 1,
          sugar: '50%',
          ice: 'Ít đá',
          topping: 'Trân châu phô mai dẻo',
          topping_price: 10000,
          note: ''
        }
      ]
    }
  ];

  const subsidyPerPerson = 20000;

  for (const ord of todayOrders) {
    const orderId = uuidv4();
    let total = 0;
    for (const item of ord.items) {
      total += (item.price + item.topping_price) * item.qty;
    }

    const subsidy = Math.min(total, subsidyPerPerson);
    const empPaid = Math.max(0, total - subsidy);

    await run(`
      INSERT INTO orders (id, session_id, employee_id, total_amount, subsidy_amount, employee_paid_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
    `, [orderId, sessionId, ord.emp_id, total, subsidy, empPaid]);

    for (const item of ord.items) {
      const itemPrice = (item.price + item.topping_price) * item.qty;
      await run(`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, store_name_snapshot, product_name_snapshot,
          size_snapshot, unit_price_snapshot, topping_snapshot, topping_price_snapshot,
          options_snapshot, item_total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        orderId,
        item.prod_id,
        item.qty,
        katStore.name,
        item.name,
        item.size,
        item.price,
        item.topping,
        item.topping_price,
        JSON.stringify({ sugar: item.sugar, ice: item.ice, note: item.note }),
        itemPrice
      ]);
    }
  }
  console.log('Seeded Today session with 8 orders (total 13 cups) for instant aggregation & copy test.');

  // 6. Seed a Past Closed Session (Highlands Coffee, 3 days ago)
  const pastDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
  const pastSessionId = 'session-past-1';
  const hlStore = stores[1];

  await run(`
    INSERT OR REPLACE INTO daily_order_sessions (
      id, session_date, store_id, status, open_time, close_time, notes,
      recipient_name_snapshot, recipient_phone_snapshot, delivery_address_snapshot, delivery_time_snapshot, delivery_note_snapshot
    ) VALUES (?, ?, ?, 'CLOSED', '09:00', '10:30', 'Phiên order Highlands', ?, ?, ?, ?, ?)
  `, [
    pastSessionId,
    pastDate,
    hlStore.id,
    hlStore.delivery.recipient_name,
    hlStore.delivery.recipient_phone,
    hlStore.delivery.delivery_address,
    hlStore.delivery.desired_delivery_time,
    hlStore.delivery.delivery_notes
  ]);

  const pastOrders = [
    {
      emp_id: 'emp-01',
      items: [{ prod_id: 'prod-hl-1', name: 'Phin Sữa Đá', size: 'M', price: 45000, qty: 1, sugar: '100%', ice: 'Bình thường', topping: '', topping_price: 0, note: '' }]
    },
    {
      emp_id: 'emp-02',
      items: [{ prod_id: 'prod-hl-3', name: 'Trà Sen Vàng', size: 'M', price: 55000, qty: 1, sugar: '50%', ice: 'Ít đá', topping: 'Thạch sen vàng', topping_price: 10000, note: '' }]
    },
    {
      emp_id: 'emp-05',
      items: [{ prod_id: 'prod-hl-2', name: 'Freeze Trà Xanh', size: 'L', price: 69000, qty: 1, sugar: '70%', ice: 'Bình thường', topping: '', topping_price: 0, note: '' }]
    }
  ];

  for (const ord of pastOrders) {
    const orderId = uuidv4();
    let total = 0;
    for (const item of ord.items) {
      total += (item.price + item.topping_price) * item.qty;
    }
    const subsidy = Math.min(total, subsidyPerPerson);
    const empPaid = Math.max(0, total - subsidy);
    await run(`
      INSERT INTO orders (id, session_id, employee_id, total_amount, subsidy_amount, employee_paid_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
    `, [orderId, pastSessionId, ord.emp_id, total, subsidy, empPaid]);

    for (const item of ord.items) {
      const itemPrice = (item.price + item.topping_price) * item.qty;
      await run(`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, store_name_snapshot, product_name_snapshot,
          size_snapshot, unit_price_snapshot, topping_snapshot, topping_price_snapshot,
          options_snapshot, item_total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        orderId,
        item.prod_id,
        item.qty,
        hlStore.name,
        item.name,
        item.size,
        item.price,
        item.topping,
        item.topping_price,
        JSON.stringify({ sugar: item.sugar, ice: item.ice, note: item.note }),
        itemPrice
      ]);
    }
  }

  const { updateAllMenus } = require('./seed_exact_menus');
  await updateAllMenus();

  console.log('Seed completed successfully!');
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
