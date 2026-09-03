const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const { fetchCurrentUser } = require('./middleware/authMiddleware');
const globalVarsMiddleware = require('./middleware/globalVarsMiddleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandlerMiddleware');

const publicRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Trust reverse proxy (required for Render / HTTPS cookies)
app.set('trust proxy', 1);

// Security and performance middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for SSR inline scripts / Google fonts
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// EJS View Engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'nova_institute_session_secret_2026';
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova_institute';

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

// Flash messages
app.use(flash());

// Authentication and global template variables
app.use(fetchCurrentUser);
app.use(globalVarsMiddleware);

// Mount application routes
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/', publicRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
