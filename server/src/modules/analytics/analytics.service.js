const { IssueReport } = require('../reports/report.model');
const { ReportStatus } = require('../reports/report.workflow');

class AnalyticsService {
  async getDashboardSummary() {
    const totalReports = await IssueReport.countDocuments();
    const resolvedReports = await IssueReport.countDocuments({ status: ReportStatus.RESOLVED });
    const inProgressReports = await IssueReport.countDocuments({ status: ReportStatus.IN_PROGRESS });
    const pendingReviewReports = await IssueReport.countDocuments({
      status: { $in: [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW] }
    });

    // Counts by status
    const statusAggregation = await IssueReport.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = {};
    Object.values(ReportStatus).forEach(s => { byStatus[s] = 0; });
    statusAggregation.forEach(item => {
      byStatus[item._id] = item.count;
    });

    // Counts by category
    const categoryAggregation = await IssueReport.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byCategory = {};
    categoryAggregation.forEach(item => {
      byCategory[item._id] = item.count;
    });

    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    return {
      totalReports,
      resolvedReports,
      inProgressReports,
      pendingReviewReports,
      resolutionRate,
      byStatus,
      byCategory
    };
  }
}

module.exports = new AnalyticsService();
