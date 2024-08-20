const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./db'); // Import the User model from db.js
const Car = require('./car'); // Import the Car model from car.js
const Booking = require('./booking'); // Import the Booking model from booking.js
const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for session
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rentorqDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to check if user is logged in and has the role 'customer'
function checkCustomerRole(req, res, next) {
  if (req.session.customerId && req.session.role === 'customer') {
    next();
  } else {
    res.redirect('/login');
  }
}

// Define the home route
app.get('/', (req, res) => {
  res.render('index');
});

// Define the sign-up route
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  const newUser = new User({
    username,
    email,
    password,
    role
  });

  try {
    await newUser.save();
    res.redirect('/'); // Redirect to home page after successful sign-up
  } catch (err) {
    res.send('Error signing up');
  }
});

// Define the login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: email, password: password });
    if (foundUser) {
      req.session.customerId = foundUser._id;
      req.session.role = foundUser.role;
      if (foundUser.role === 'admin') {
        res.redirect('/admin-dashboard');
      } else {
        res.redirect('/customer');
      }
    } else {
      res.send('Invalid email or password');
    }
  } catch (err) {
    res.send('Error logging in');
  }
});

// Define the admin dashboard route
app.get('/admin-dashboard', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.render('admin-dashboard', { cars });
  } catch (err) {
    res.send('Error fetching car data');
  }
});

// Define the route to add a car
app.post('/add-car', async (req, res) => {
  const { make, model, year, licenseNumber, rentRate, location, customerId, status, startDate, endDate } = req.body;

  const newCar = new Car({
    make,
    model,
    year,
    licenseNumber,
    rentRate,
    location,
    customerId,
    status,
    startDate,
    endDate
  });

  try {
    await newCar.save();
    res.redirect('/admin-dashboard');
  } catch (err) {
    res.send('Error adding car');
  }
});

// Define the route to delete a car
app.post('/delete-car', async (req, res) => {
  const { licenseNumber } = req.body;

  try {
    await Car.deleteOne({ licenseNumber });
    res.redirect('/admin-dashboard');
  } catch (err) {
    res.send('Error deleting car');
  }
});

app.post('/update-car', async (req, res) => {
  const { licenseNumber, status, rentRate, location, startDate, endDate } = req.body;

  const updateData = { status };

  if (status === 'Available') {
    updateData.startDate = null;
    updateData.endDate = null;
    updateData.customerId = null;
  } else if (status === 'Booked') {
    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }
    updateData.customerId = "Booked by Admin";
  }

  if (rentRate) {
    updateData.rentRate = rentRate;
  }

  if (location) {
    updateData.location = location;
  }

  try {
    await Car.updateOne({ licenseNumber }, updateData);
    res.redirect('/admin-dashboard');
  } catch (err) {
    res.send('Error updating car');
  }
});

// Define the route to search for cars for admins
app.get('/search-cars', async (req, res) => {
  const query = req.query.query;
  let searchCriteria = {
    $or: [
      { make: { $regex: query, $options: 'i' } },
      { model: { $regex: query, $options: 'i' } },
      { year: Number(query) },
      { licenseNumber: { $regex: query, $options: 'i' } }
    ]
  };

  if (query.toLowerCase() === 'available') {
    searchCriteria = { status: 'Available' };
  }

  const cars = await Car.find(searchCriteria);

  if (req.xhr) {
    return res.json(cars);
  }

  res.render('admin-dashboard', { cars });
});

// Define the route to search for cars for customers
app.get('/customer-search-cars', checkCustomerRole, async (req, res) => {
  const { query, rentRate } = req.query;
  let searchCriteria = {
    status: 'Available',
    $or: [
      { make: { $regex: query, $options: 'i' } },
      { model: { $regex: query, $options: 'i' } },
      { year: Number(query) },
      { licenseNumber: { $regex: query, $options: 'i' } }
    ]
  };

  if (query.toLowerCase() === 'available') {
    searchCriteria = { status: 'Available' };
  }

  if (rentRate) {
    const rentRateValue = parseFloat(rentRate.replace('$', ''));
    if (!isNaN(rentRateValue)) {
      searchCriteria.rentRate = {
        $gte: rentRateValue - 10,
        $lte: rentRateValue + 10
      };
    }
  }

  const cars = await Car.find(searchCriteria);

  res.render('customer', { cars, customerName: req.session.customerName });
});


// Customer page route
app.get('/customer', checkCustomerRole, async (req, res) => {
  const cars = await Car.find({ status: 'Available' });
  const customer = await User.findById(req.session.customerId);
  const bookingSuccess = req.query.bookingSuccess === 'true';
  res.render('customer', { cars, customerName: customer.username, bookingSuccess });
});

// Customer page route
app.get('/customer', checkCustomerRole, async (req, res) => {
  const cars = await Car.find({ status: 'Available' });
  const customer = await User.findById(req.session.customerId);
  const bookingSuccess = req.query.bookingSuccess === 'true';
  res.render('customer', { cars, customerName: customer.username, bookingSuccess });
});

// Booking route
app.post('/book-car', checkCustomerRole, async (req, res) => {
  const { name, contactNumber, carId, startDate, endDate } = req.body;
  const customerId = req.session.customerId;

  const car = await Car.findById(carId);
  const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

  const newBooking = new Booking({
    name,
    customerId,
    contactNumber,
    licenseNumber: car.licenseNumber,
    model: car.model,
    maker: car.maker,
    startDate,
    endDate,
    duration
  });

  try {
    await newBooking.save();
    await Car.updateOne({ _id: carId }, { status: 'Booked', startDate, endDate, customerId });
    res.redirect('/customer?bookingSuccess=true');
  } catch (err) {
    res.send('Error booking car');
  }
});

// app.js
// Route to render the My Rides page
app.get('/my-rides-page', checkCustomerRole, (req, res) => {
  res.render('myRides');
});

// Route to get all booked rides for the logged-in customer
app.get('/my-rides', checkCustomerRole, async (req, res) => {
  const customerId = req.session.customerId;
  try {
    const rides = await Booking.find({ customerId });
    res.json(rides);
  } catch (err) {
    res.status(500).send('Error fetching rides');
  }
});

// app.js
// Route to clear all rides for the logged-in customer
app.post('/clear-rides', checkCustomerRole, async (req, res) => {
  const customerId = req.session.customerId;
  try {
    const bookings = await Booking.find({ customerId });
    for (const booking of bookings) {
      const car = await Car.findById(booking.car._id);
      car.status = 'available';
      car.customerId = null;
      car.startDate = null;
      car.endDate = null;
      await car.save();
      await booking.remove();
    }
    res.send('All rides cleared successfully');
  } catch (err) {
    res.status(500).send('Error clearing rides');
  }
});
// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/customer');
    }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});