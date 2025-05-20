const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const startPoller = require('./utils/poller');

const purifierRoutes = require('./routes/purifierRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Disable 'x-powered-by' header
app.disable('x-powered-by');

app.set('etag', false); // Disable ETag header

// Middleware to remove or modify headers
app.use((req, res, next) => {

  // Remove unwanted headers 
  res.removeHeader('Connection');

  next();
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/purifiers', purifierRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//message from server 
app.get('/', (req, res) => {
  res.send('Hello from server');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

module.exports = app;