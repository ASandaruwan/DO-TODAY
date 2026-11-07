const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize against NoSQL query injection
app.use(mongoSanitize());

// Static folder for local uploads fallback with strict security headers (Stored XSS mitigation)
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Health check endpoints (Liveness & Deep DB Readiness)
app.get('/api/health', (req, res) => {
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;
  const status = isDbReady ? 'ok' : 'degraded';
  const statusCode = isDbReady ? 200 : 503;

  res.status(statusCode).json({
    status,
    database: isDbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/healthz/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/healthz/ready', (req, res) => {
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;
  if (!isDbReady) {
    return res.status(503).json({ status: 'unready', database: 'disconnected' });
  }
  return res.status(200).json({ status: 'ready', database: 'connected' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

