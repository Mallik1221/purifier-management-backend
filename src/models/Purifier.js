const mongoose = require('mongoose');

const PurifierSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    houseNoStreet: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{10}$/
    }
  },
  status: {
    type: Boolean,
    default: false // This represents the device status
  },
  onlineStatus: {
    type: Boolean,
    default: false // This represents the switch status, defaulting to offline
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastOnline: {
  type: Date,
  default: null
}
}, {
  timestamps: true
});

module.exports = mongoose.model('Purifier', PurifierSchema);