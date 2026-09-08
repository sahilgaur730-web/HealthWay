/**
 * HealthWay Express Backend Server Entry Point
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth').router;
const referralsRoutes = require('./routes/referrals');
const diagnosticsRoutes = require('./routes/diagnostics');
const medicinesRoutes = require('./routes/medicines');
const highriskRoutes = require('./routes/highrisk');
const dashboardRoutes = require('./routes/dashboard');
const syncRoutes = require('./routes/sync');
const emergencyRoutes = require('./routes/emergency');
const abdmRoutes = require('./routes/abdm');
const fhirRoutes = require('./routes/fhir');
const interopRoutes = require('./routes/interop');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow development and deployed clients
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HealthWay Backend API Services',
    state: 'Maharashtra Rural Health Telemedicine Network',
    version: '1.0.0-MH',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    supportedModules: [
      'auth',
      'referrals',
      'diagnostics',
      'medicines',
      'highrisk',
      'dashboard',
      'sync',
      'emergency',
      'abdm',
      'fhir',
      'interop'
    ]
  });
});

// Fast latency ping endpoint
app.all('/api/ping', (req, res) => {
  res.status(200).json({ status: 'pong', timestamp: Date.now() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/highrisk', highriskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/abdm', abdmRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/interop', interopRoutes);

// 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `HealthWay API route not found: [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[HealthWay Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Only listen if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[HealthWay Backend] Server active and listening on port ${PORT}`);
    console.log(`[HealthWay Backend] Health Check available at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
