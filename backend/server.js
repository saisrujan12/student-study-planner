const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, mobile apps, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/tasks', taskRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB if MONGO_URI is provided
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn('WARNING: MONGO_URI not set. Database features will not work.');
  }

  const server = app.listen(PORT, () => {
    console.log(`StudyFlow API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  return server;
};

// Only start the server if this file is run directly (not imported in tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
