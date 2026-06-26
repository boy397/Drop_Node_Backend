import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers
app.use(helmet());

// 2. CORS Policies
app.use(
  cors({
    origin: true, // In production, replace with specific domain, e.g. client URL
    credentials: true,
  })
);

// 3. Global Rate Limiting
const limiter = rateLimit({
  max: 150, // Limit each IP to 150 requests per 15-minute window
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. Request Logging
app.use((req, _res, next) => {
  console.log(`[Gateway] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Routing...`);
  next();
});

// 5. Block Public Access to Internal APIs (Security Best Practice!)
app.all('/api/internal/*', (_req, res) => {
  res.status(403).json({
    status: 'error',
    message: 'Access Denied: Internal routing endpoints are blocked from public access.',
  });
});

// 6. Microservices Routing Proxies
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
const CART_URL = process.env.CART_SERVICE_URL || 'http://localhost:5003';
const ORDER_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5004';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005';
const CONTENT_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:5006';

// Auth & User Service Proxy
app.use('/api/auth', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, pathRewrite: { '^/': '/api/auth/' } }));
app.use('/api/users', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, pathRewrite: { '^/': '/api/users/' } }));

// Catalog & Product Service Proxy
app.use('/api/products', createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/': '/api/products/' } }));
app.use('/api/categories', createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/': '/api/categories/' } }));
app.use('/api/deals', createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/': '/api/deals/' } }));
app.use('/api/inventory', createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/': '/api/inventory/' } }));

// Cart & Wishlist Service Proxy
app.use('/api/cart', createProxyMiddleware({ target: CART_URL, changeOrigin: true, pathRewrite: { '^/': '/api/cart/' } }));
app.use('/api/wishlist', createProxyMiddleware({ target: CART_URL, changeOrigin: true, pathRewrite: { '^/': '/api/wishlist/' } }));
app.use('/api/coupons', createProxyMiddleware({ target: CART_URL, changeOrigin: true, pathRewrite: { '^/': '/api/coupons/' } }));

// Order & Checkout Service Proxy
app.use('/api/orders', createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathRewrite: { '^/': '/api/orders/' } }));
app.use('/api/payments', createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathRewrite: { '^/': '/api/payments/' } }));
app.use('/api/tracking', createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathRewrite: { '^/': '/api/tracking/' } }));

// Notification Service Proxy
app.use('/api/notifications', createProxyMiddleware({ target: NOTIFICATION_URL, changeOrigin: true, pathRewrite: { '^/': '/api/notifications/' } }));

// CMS & Blog Service Proxy
app.use('/api/blogs', createProxyMiddleware({ target: CONTENT_URL, changeOrigin: true, pathRewrite: { '^/': '/api/blogs/' } }));
app.use('/api/cms', createProxyMiddleware({ target: CONTENT_URL, changeOrigin: true, pathRewrite: { '^/': '/api/cms/' } }));

// Unified Swagger Documentation Aggregator placeholder
// (In Phase 7, we will configure this to fetch and display aggregated OpenAPIs)
app.get('/api-docs', (_req, res) => {
  res.status(200).send('Unified API Documentation Gateway Dashboard. Active in container mode.');
});

// 7. Base Health check for Gateway
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    message: 'API Gateway is online and routing traffic.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🔑 Routing /api/auth -> ${AUTH_URL}`);
  console.log(`📦 Routing /api/products -> ${CATALOG_URL}`);
  console.log(`🛒 Routing /api/cart -> ${CART_URL}`);
  console.log(`💳 Routing /api/orders -> ${ORDER_URL}`);
  console.log(`🔔 Routing /api/notifications -> ${NOTIFICATION_URL}`);
  console.log(`📝 Routing /api/blogs -> ${CONTENT_URL}`);
});
