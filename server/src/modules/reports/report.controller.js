const reportService = require('./report.service');

class ReportController {
  async create(req, res, next) {
    try {
      const report = await reportService.createReport(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Issue report created successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const reports = await reportService.listReports(req.user, req.query);
      res.status(200).json({
        success: true,
        count: reports.length,
        data: { reports }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const report = await reportService.getReportById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const report = await reportService.updateReportStatus(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        message: 'Report status updated successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req, res, next) {
    try {
      const report = await reportService.assignDepartment(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        message: 'Department assigned successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
