const mongoose = require('mongoose');

const NotificationEvents = {
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  REPORT_VERIFIED: 'REPORT_VERIFIED',
  REPORT_REJECTED: 'REPORT_REJECTED',
  REPORT_ASSIGNED: 'REPORT_ASSIGNED',
  WORK_STARTED: 'WORK_STARTED',
  REPORT_RESOLVED: 'REPORT_RESOLVED'
};

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssueReport',
      required: [true, 'Related report ID is required']
    },
    event: {
      type: String,
      enum: Object.values(NotificationEvents),
      required: [true, 'Notification event type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Notification,
  NotificationEvents
};
