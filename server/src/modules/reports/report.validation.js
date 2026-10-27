const { z } = require('zod');
const { IssueCategories } = require('./report.model');
const { ReportStatus } = require('./report.workflow');

const createReportSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z.nativeEnum(IssueCategories),
  location: z.object({
    address: z.string().trim().min(3, 'Address must be at least 3 characters'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }),
  photoUrl: z.string().url('Photo URL must be a valid URL').optional().or(z.literal(''))
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  rejectionReason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters').optional(),
  resolutionNotes: z.string().trim().optional()
});

const assignDepartmentSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  assignedWorker: z.string().trim().min(2, 'Assigned worker name must be at least 2 characters').optional()
});

module.exports = {
  createReportSchema,
  updateStatusSchema,
  assignDepartmentSchema
};
