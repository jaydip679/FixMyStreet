const mongoose = require('mongoose');
const { ReportStatus } = require('./report.workflow');

const IssueCategories = {
  POTHOLE: 'POTHOLE',
  GARBAGE: 'GARBAGE',
  STREETLIGHT: 'STREETLIGHT',
  WATER_LEAKAGE: 'WATER_LEAKAGE',
  INFRASTRUCTURE_OTHER: 'INFRASTRUCTURE_OTHER'
};

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      enum: {
        values: Object.values(IssueCategories),
        message: '{VALUE} is not a supported issue category'
      },
      required: [true, 'Issue category is required']
    },
    location: {
      type: locationSchema,
      required: [true, 'Report location details are required']
    },
    photoUrl: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.SUBMITTED,
      index: true
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting citizen ID is required'],
      index: true
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    assignedWorker: {
      type: String,
      trim: true,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const IssueReport = mongoose.model('IssueReport', reportSchema);

module.exports = {
  IssueReport,
  IssueCategories,
  ReportStatus
};
