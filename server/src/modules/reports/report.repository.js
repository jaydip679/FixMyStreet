const { IssueReport } = require('./report.model');

class ReportRepository {
  async createReport(reportData) {
    const report = new IssueReport(reportData);
    return report.save();
  }

  async findById(id) {
    return IssueReport.findById(id)
      .populate('citizen', 'name email role')
      .populate('assignedDepartment', 'name code');
  }

  async findByCitizenId(citizenId) {
    return IssueReport.find({ citizen: citizenId })
      .sort({ createdAt: -1 })
      .populate('assignedDepartment', 'name code');
  }

  async findAllReports(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.department) query.assignedDepartment = filters.department;

    return IssueReport.find(query)
      .sort({ createdAt: -1 })
      .populate('citizen', 'name email')
      .populate('assignedDepartment', 'name code');
  }

  async saveReport(reportDocument) {
    return reportDocument.save();
  }

  async countReports(query = {}) {
    return IssueReport.countDocuments(query);
  }
}

module.exports = new ReportRepository();
module.exports.ReportRepository = ReportRepository;
