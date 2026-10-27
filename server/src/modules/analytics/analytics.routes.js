const express = require('express');
const analyticsService = require('./analytics.service');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.get('/summary', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const summary = await analyticsService.getDashboardSummary();
    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
