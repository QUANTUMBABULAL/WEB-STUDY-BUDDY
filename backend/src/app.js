const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

const DEV_FALLBACK_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];

const createApp = ({ allowedOrigins = [], fallbackOrigin } = {}) => {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(compression());

  const safeOrigins = buildOriginList(allowedOrigins, fallbackOrigin);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || safeOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // ROUTES
  app.use('/api/auth', authRoutes);
  app.use('/api/messages', chatRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/user', userRoutes);

  // Health check
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  });

  return app;
};

function buildOriginList(origins = [], fallbackOrigin) {
  const fallback = fallbackOrigin || DEV_FALLBACK_ORIGINS[1];
  return Array.from(new Set([...DEV_FALLBACK_ORIGINS, fallback, ...origins].filter(Boolean)));
}

module.exports = createApp;
