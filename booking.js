const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: String,
  customerId: String,
  contactNumber: String,
  licenseNumber: String,
  model: String,
  maker: String,
  startDate: Date,
  endDate: Date,
  duration: Number
}, { collection: 'bookings' });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;