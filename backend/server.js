const cors = require("cors");

app.use(cors({
  origin: "*"
}));
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routers FIRST (before static)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));

// Root API status
app.get('/api', (req, res) => {
    res.json({ message: 'Template Sharing Platform API is running...' });
});

// Serve frontend static files for all non-API routes
app.use(express.static(path.join(__dirname, '../frontend')));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.message);
    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
