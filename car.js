// car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: String,
  licenseNumber: String,
  rentRate: Number,
  location: String,
  customerId: String,
  status: { type: String, enum: ['Booked', 'Available'], default: 'Available' },
  startDate: Date,
  endDate: Date
}, { collection: 'cars' }); // Explicitly specify the collection name

const Car = mongoose.model('Car', carSchema);

module.exports = Car;