const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
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

// Static folder for local uploads fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint (§12)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);

// Tasks and Users routes will be registered here (Phase 3)
// Placeholder loaders for Phase 3:
app.use('/api/tasks', (req, res, next) => {
  try {
    const taskRoutes = require('./routes/task.routes');
    return taskRoutes(req, res, next);
  } catch (err) {
    next();
  }
});

app.use('/api/users', (req, res, next) => {
  try {
    const userRoutes = require('./routes/user.routes');
    return userRoutes(req, res, next);
  } catch (err) {
    next();
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

