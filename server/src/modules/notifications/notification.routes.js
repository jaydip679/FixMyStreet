const express = require('express');
const notificationService = require('./notification.service');
const { authenticate } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user.id);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
