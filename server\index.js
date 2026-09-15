const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initSchema, UPLOADS_DIR } = require('./db');

const employeesRouter = require('./routes/employees');
const storesRouter = require('./routes/stores');
const productsRouter = require('./routes/products');
const sessionsRouter = require('./routes/sessions');
const ordersRouter = require('./routes/orders');
const aggregationRouter = require('./routes/aggregation');
const statsRouter = require('./routes/stats');
const exportRouter = require('./routes/export');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes
app.use('/api/employees', employeesRouter);
app.use('/api/stores', storesRouter);
app.use('/api', productsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/aggregation', aggregationRouter);
app.use('/api/stats', statsRouter);
app.use('/api/export', exportRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ'
  });
});

// Initialize database and start server
initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`☕ Web App Order Nước Nội Bộ đang chạy tại:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API Endpoint: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
