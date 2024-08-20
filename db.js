// db.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rentorqDB');

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
}, { collection: 'users' }); // Specify the collection name

const User = mongoose.model('User', userSchema);

module.exports = User;