import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import sessionRoutes from './routes/sessions.js';
import orderRoutes from './routes/orders.js';
import historyRoutes from './routes/history.js';
import exportRoutes from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initDb();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads route
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend dist if built
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
