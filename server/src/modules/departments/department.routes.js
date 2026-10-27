const express = require('express');
const departmentService = require('./department.service');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.status(200).json({
      success: true,
      count: departments.length,
      data: { departments }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
