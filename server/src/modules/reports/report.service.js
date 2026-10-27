const reportRepository = require('./report.repository');
const departmentService = require('../departments/department.service');
const notificationService = require('../notifications/notification.service');
const { NotificationEvents } = require('../notifications/notification.model');
const { validateTransition, ReportStatus } = require('./report.workflow');
const {
  NotFoundError,
  ForbiddenError,
  ValidationError
} = require('../../shared/errors/app-error');

class ReportService {
  constructor(
    repo = reportRepository,
    deptService = departmentService,
    notifService = notificationService
  ) {
    this.repo = repo;
    this.deptService = deptService;
    this.notifService = notifService;
  }

  /**
   * Rule 1 & Rule 5: Citizen creates an IssueReport and receives a submission notification
   */
  async createReport(citizenId, reportInput) {
    const report = await this.repo.createReport({
      ...reportInput,
      citizen: citizenId,
      status: ReportStatus.SUBMITTED
    });

    // Notify the citizen of successful report creation (Rule 5)
    await this.notifService.notifyCitizen({
      recipientId: citizenId,
      reportId: report._id,
      event: NotificationEvents.REPORT_SUBMITTED,
      title: 'Report Submitted',
      message: `Your civic issue report "${report.title}" was successfully submitted and is awaiting review.`
    });

    return report;
  }

  /**
   * Rule 1: Citizens can access only their own reports; Admins can access all
   */
  async getReportById(reportId, user) {
    const report = await this.repo.findById(reportId);
    if (!report) {
      throw new NotFoundError(`IssueReport with ID ${reportId} not found`);
    }

    // Enforce Rule 1: Citizen isolation
    if (user.role === 'CITIZEN') {
      const ownerId = report.citizen._id ? report.citizen._id.toString() : report.citizen.toString();
      if (ownerId !== user.id.toString()) {
        throw new ForbiddenError('Access forbidden: you can access only your own reports');
      }
    }

    return report;
  }

  /**
   * Rule 1: Citizens view only their submitted reports; Admins view all with filters
   */
  async listReports(user, filters = {}) {
    if (user.role === 'CITIZEN') {
      return this.repo.findByCitizenId(user.id);
    }
    return this.repo.findAllReports(filters);
  }

  /**
   * Rule 2, Rule 3 & Rule 5: Status update with workflow verification and citizen notification
   */
  async updateReportStatus(reportId, { status: nextStatus, rejectionReason, resolutionNotes }, adminUser) {
    // Enforce Rule 2: Only Admins can manage report status
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenError('Access forbidden: only administrators can update report status');
    }

    const report = await this.repo.findById(reportId);
    if (!report) {
      throw new NotFoundError(`IssueReport with ID ${reportId} not found`);
    }

    // Enforce Rule 3: Validate deterministic transition
    validateTransition(report.status, nextStatus);

    // Business invariant: Rejection requires a reason
    if (nextStatus === ReportStatus.REJECTED && !rejectionReason) {
      throw new ValidationError('A rejection reason is mandatory when rejecting a report');
    }

    // Apply status update
    report.status = nextStatus;
    if (rejectionReason) report.rejectionReason = rejectionReason;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;

    const updatedReport = await this.repo.saveReport(report);

    // Rule 5: In-app notification for the report owner
    const ownerId = report.citizen._id ? report.citizen._id : report.citizen;
    let eventType = NotificationEvents.REPORT_VERIFIED;
    let eventTitle = 'Report Status Updated';
    let eventMessage = `Your report "${report.title}" status changed to ${nextStatus}.`;

    if (nextStatus === ReportStatus.VERIFIED) {
      eventType = NotificationEvents.REPORT_VERIFIED;
      eventTitle = 'Report Verified';
      eventMessage = `Your report "${report.title}" has been verified by the municipal authority.`;
    } else if (nextStatus === ReportStatus.REJECTED) {
      eventType = NotificationEvents.REPORT_REJECTED;
      eventTitle = 'Report Rejected';
      eventMessage = `Your report "${report.title}" was rejected: ${rejectionReason}`;
    } else if (nextStatus === ReportStatus.IN_PROGRESS) {
      eventType = NotificationEvents.WORK_STARTED;
      eventTitle = 'Work In Progress';
      eventMessage = `Field work has commenced on your report "${report.title}".`;
    } else if (nextStatus === ReportStatus.RESOLVED) {
      eventType = NotificationEvents.REPORT_RESOLVED;
      eventTitle = 'Report Resolved';
      eventMessage = `Your report "${report.title}" has been resolved. Notes: ${resolutionNotes || 'Remediation completed'}`;
    }

    await this.notifService.notifyCitizen({
      recipientId: ownerId,
      reportId: report._id,
      event: eventType,
      title: eventTitle,
      message: eventMessage
    });

    return updatedReport;
  }

  /**
   * Rule 2, Rule 3, Rule 4 & Rule 5: Department assignment with valid department reference
   */
  async assignDepartment(reportId, { departmentId, assignedWorker }, adminUser) {
    // Enforce Rule 2: Admin only
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenError('Access forbidden: only administrators can assign departments');
    }

    // Enforce Rule 4: Department must exist
    const department = await this.deptService.getDepartmentById(departmentId);

    const report = await this.repo.findById(reportId);
    if (!report) {
      throw new NotFoundError(`IssueReport with ID ${reportId} not found`);
    }

    // If report is VERIFIED, transition to ASSIGNED; if already ASSIGNED, update assignment
    if (report.status === ReportStatus.VERIFIED) {
      validateTransition(report.status, ReportStatus.ASSIGNED);
      report.status = ReportStatus.ASSIGNED;
    } else if (report.status !== ReportStatus.ASSIGNED && report.status !== ReportStatus.IN_PROGRESS) {
      throw new ValidationError(
        `Cannot assign department to report in '${report.status}' status. Report must be in 'VERIFIED' or 'ASSIGNED' state.`
      );
    }

    report.assignedDepartment = department._id;
    if (assignedWorker) {
      report.assignedWorker = assignedWorker;
    }

    const updatedReport = await this.repo.saveReport(report);

    // Rule 5: Notify citizen of departmental assignment
    const ownerId = report.citizen._id ? report.citizen._id : report.citizen;
    await this.notifService.notifyCitizen({
      recipientId: ownerId,
      reportId: report._id,
      event: NotificationEvents.REPORT_ASSIGNED,
      title: 'Department Assigned',
      message: `Your report "${report.title}" has been assigned to the ${department.name}.`
    });

    return updatedReport;
  }
}

module.exports = new ReportService();
module.exports.ReportService = ReportService;
