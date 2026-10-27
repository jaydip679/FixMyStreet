const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorHandler = require('./shared/middleware/error.middleware');
const { NotFoundError } = require('./shared/errors/app-error');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

// Global middleware
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (mandatory for deployment monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount module routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes); // Convenience alias

const reportRoutes = require('./modules/reports/report.routes');
const departmentRoutes = require('./modules/departments/department.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

app.use('/api/v1/reports', reportRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/v1/departments', departmentRoutes);
app.use('/api/departments', departmentRoutes);

app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all for undefined routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
