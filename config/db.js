const mongoose = require('mongoose');

// Connect to MongoDB using the URI from the environment or a local fallback.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog-platform', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection failed. The app will continue to start, but database actions will be unavailable until MongoDB is reachable.');
    console.warn(error.message);
  }
};

module.exports = connectDB;
