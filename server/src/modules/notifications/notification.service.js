const { Notification, NotificationEvents } = require('./notification.model');
const { NotFoundError, ForbiddenError } = require('../../shared/errors/app-error');

class NotificationService {
  async notifyCitizen({ recipientId, reportId, event, title, message }) {
    const notification = new Notification({
      recipient: recipientId,
      report: reportId,
      event,
      title,
      message
    });
    return notification.save();
  }

  async getNotificationsForUser(userId) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('report', 'title status category');
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    if (notification.recipient.toString() !== userId.toString()) {
      throw new ForbiddenError('Access forbidden: you cannot modify another citizen’s notifications');
    }
    notification.isRead = true;
    return notification.save();
  }
}

module.exports = new NotificationService();
module.exports.NotificationService = NotificationService;
module.exports.NotificationEvents = NotificationEvents;
