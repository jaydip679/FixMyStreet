const express = require('express');
const reportController = require('./report.controller');
const validate = require('../../shared/middleware/validate.middleware');
const {
  createReportSchema,
  updateStatusSchema,
  assignDepartmentSchema
} = require('./report.validation');
const {
  authenticate,
  requireAdmin
} = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Protected: All authenticated users can list and create reports (Rule 1 filters by role in service)
router.post('/', authenticate, validate(createReportSchema), reportController.create);
router.get('/', authenticate, reportController.list);
router.get('/:id', authenticate, reportController.getById);

// Admin only: Status updates (Rule 2 & 3) and Department Assignment (Rule 2 & 4)
router.patch('/:id/status', authenticate, requireAdmin, validate(updateStatusSchema), reportController.updateStatus);
router.patch('/:id/assign', authenticate, requireAdmin, validate(assignDepartmentSchema), reportController.assign);

module.exports = router;
