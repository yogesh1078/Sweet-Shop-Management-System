const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Sweet = require('../models/Sweet');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sweets
// @desc    Create a new sweet
// @access  Private (Admin only)
router.post('/', [
  authenticate,
  authorize('admin'),
  body('name')
    .isLength({ min: 2 })
    .withMessage('Sweet name must be at least 2 characters long')
    .isLength({ max: 100 })
    .withMessage('Sweet name cannot exceed 100 characters'),
  body('category')
    .isIn(['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, category, price, quantity, description, imageUrl } = req.body;

    // Check if sweet with same name already exists
    const existingSweet = await Sweet.findOne({ name });
    if (existingSweet) {
      return res.status(400).json({
        status: 'error',
        message: 'A sweet with this name already exists'
      });
    }

    const sweet = new Sweet({
      name,
      category,
      price,
      quantity,
      description,
      imageUrl
    });

    await sweet.save();

    res.status(201).json({
      status: 'success',
      message: 'Sweet created successfully',
      data: { sweet }
    });
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating sweet'
    });
  }
});

// @route   GET /api/sweets
// @desc    Get all sweets with optional filtering and pagination
// @access  Private
router.get('/', [
  authenticate,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'other'])
    .withMessage('Invalid category filter'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be non-negative'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be non-negative')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const sweets = await Sweet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sweet.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        sweets,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching sweets'
    });
  }
});

// @route   GET /api/sweets/search
// @desc    Search sweets by name, category, or description
// @access  Private
router.get('/search', [
  authenticate,
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.q;

    const sweets = await Sweet.find({
      $text: { $search: searchQuery }
    })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Sweet.countDocuments({
      $text: { $search: searchQuery }
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        sweets,
        searchQuery,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching sweets'
    });
  }
});

// @route   GET /api/sweets/:id
// @desc    Get a single sweet by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sweet not found'
      });
    }

    res.json({
      status: 'success',
      data: { sweet }
    });
  } catch (error) {
    console.error('Get sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching sweet'
    });
  }
});

// @route   PUT /api/sweets/:id
// @desc    Update a sweet
// @access  Private (Admin only)
router.put('/:id', [
  authenticate,
  authorize('admin'),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Sweet name must be at least 2 characters long')
    .isLength({ max: 100 })
    .withMessage('Sweet name cannot exceed 100 characters'),
  body('category')
    .optional()
    .isIn(['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sweet not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing sweet
    if (req.body.name && req.body.name !== sweet.name) {
      const existingSweet = await Sweet.findOne({ name: req.body.name });
      if (existingSweet) {
        return res.status(400).json({
          status: 'error',
          message: 'A sweet with this name already exists'
        });
      }
    }

    const updatedSweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Sweet updated successfully',
      data: { sweet: updatedSweet }
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating sweet'
    });
  }
});

// @route   DELETE /api/sweets/:id
// @desc    Delete a sweet
// @access  Private (Admin only)
router.delete('/:id', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sweet not found'
      });
    }

    await Sweet.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting sweet'
    });
  }
});

module.exports = router;
