const express = require('express');
const mongoose = require('mongoose');

// Import Route Handlers
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('Social Media API is running...');
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/social_media_db'; // Replace with your MongoDB Atlas URI if needed

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });