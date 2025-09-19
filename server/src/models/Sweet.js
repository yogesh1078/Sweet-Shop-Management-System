const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sweet name is required'],
    trim: true,
    minlength: [2, 'Sweet name must be at least 2 characters long'],
    maxlength: [100, 'Sweet name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'other'],
      message: 'Category must be one of: chocolate, candy, cake, cookie, ice-cream, pastry, other'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed 10000']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Image URL must be a valid HTTP/HTTPS URL']
  }
}, {
  timestamps: true
});

// Index for search functionality
sweetSchema.index({ name: 'text', category: 'text', description: 'text' });
sweetSchema.index({ category: 1 });
sweetSchema.index({ price: 1 });

module.exports = mongoose.model('Sweet', sweetSchema);
