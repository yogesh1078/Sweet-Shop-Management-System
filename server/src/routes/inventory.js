const express = require('express');
const { body, validationResult } = require('express-validator');
const Sweet = require('../models/Sweet');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/inventory/sweets/:id/purchase
// @desc    Purchase a sweet (decrease quantity)
// @access  Private
router.post('/sweets/:id/purchase', [
  authenticate,
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Purchase quantity must be at least 1')
    .isInt({ max: 1000 })
    .withMessage('Purchase quantity cannot exceed 1000')
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

    const { quantity } = req.body;
    const sweetId = req.params.id;

    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sweet not found'
      });
    }

    // Check if enough quantity is available
    if (sweet.quantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Only ${sweet.quantity} items available`
      });
    }

    // Update quantity
    sweet.quantity -= quantity;
    await sweet.save();

    res.json({
      status: 'success',
      message: 'Purchase successful',
      data: {
        sweet: {
          id: sweet._id,
          name: sweet.name,
          quantity: sweet.quantity
        },
        purchasedQuantity: quantity,
        remainingStock: sweet.quantity
      }
    });
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during purchase'
    });
  }
});

// @route   POST /api/inventory/sweets/:id/restock
// @desc    Restock a sweet (increase quantity)
// @access  Private (Admin only)
router.post('/sweets/:id/restock', [
  authenticate,
  authorize('admin'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Restock quantity must be at least 1')
    .isInt({ max: 10000 })
    .withMessage('Restock quantity cannot exceed 10000')
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

    const { quantity } = req.body;
    const sweetId = req.params.id;

    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sweet not found'
      });
    }

    // Update quantity
    sweet.quantity += quantity;
    await sweet.save();

    res.json({
      status: 'success',
      message: 'Restock successful',
      data: {
        sweet: {
          id: sweet._id,
          name: sweet.name,
          quantity: sweet.quantity
        },
        restockedQuantity: quantity,
        newStock: sweet.quantity
      }
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during restock'
    });
  }
});

// @route   GET /api/inventory/stock
// @desc    Get inventory status (low stock items)
// @access  Private (Admin only)
router.get('/stock', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const lowStockThreshold = parseInt(req.query.threshold) || 10;
    
    const lowStockItems = await Sweet.find({
      quantity: { $lte: lowStockThreshold }
    }).sort({ quantity: 1 });

    const totalItems = await Sweet.countDocuments();
    const lowStockCount = lowStockItems.length;

    res.json({
      status: 'success',
      data: {
        lowStockItems,
        summary: {
          totalItems,
          lowStockCount,
          threshold: lowStockThreshold
        }
      }
    });
  } catch (error) {
    console.error('Get stock status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching stock status'
    });
  }
});

// @route   GET /api/inventory/analytics
// @desc    Get inventory analytics
// @access  Private (Admin only)
router.get('/analytics', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const totalSweets = await Sweet.countDocuments();
    const totalValue = await Sweet.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    const categoryStats = await Sweet.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const outOfStock = await Sweet.countDocuments({ quantity: 0 });
    const lowStock = await Sweet.countDocuments({ quantity: { $lte: 10, $gt: 0 } });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalSweets,
          totalValue: totalValue[0]?.totalValue || 0,
          outOfStock,
          lowStock
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
