const { ReportService } = require('./report.service');
const { ReportStatus } = require('./report.workflow');
const { ForbiddenError, ValidationError, NotFoundError } = require('../../shared/errors/app-error');

describe('ReportService — Unit Tests for Business Rules 1 to 5', () => {
  let reportService;
  let mockRepo;
  let mockDeptService;
  let mockNotifService;

  beforeEach(() => {
    mockRepo = {
      createReport: jest.fn(),
      findById: jest.fn(),
      findByCitizenId: jest.fn(),
      findAllReports: jest.fn(),
      saveReport: jest.fn()
    };
    mockDeptService = {
      getDepartmentById: jest.fn()
    };
    mockNotifService = {
      notifyCitizen: jest.fn()
    };
    reportService = new ReportService(mockRepo, mockDeptService, mockNotifService);
  });

  // Rule 1: Citizens can access only their own reports
  test('Rule 1: citizen_can_access_own_report_details', async () => {
    // Arrange
    const citizenUser = { id: 'citizen_123', role: 'CITIZEN' };
    const report = {
      _id: 'report_1',
      title: 'Pothole on Main St',
      citizen: { _id: 'citizen_123' },
      status: ReportStatus.SUBMITTED
    };
    mockRepo.findById.mockResolvedValue(report);

    // Act
    const result = await reportService.getReportById('report_1', citizenUser);

    // Assert
    expect(result).toBe(report);
  });

  test('Rule 1: citizen_attempting_to_access_another_citizens_report_is_rejected_with_forbidden', async () => {
    // Arrange
    const citizenUser = { id: 'citizen_attacker', role: 'CITIZEN' };
    const report = {
      _id: 'report_1',
      title: 'Private Report',
      citizen: { _id: 'citizen_owner' },
      status: ReportStatus.SUBMITTED
    };
    mockRepo.findById.mockResolvedValue(report);

    // Act & Assert
    await expect(reportService.getReportById('report_1', citizenUser)).rejects.toThrow(ForbiddenError);
  });

  test('Rule 1: admin_can_access_any_citizens_report', async () => {
    // Arrange
    const adminUser = { id: 'admin_999', role: 'ADMIN' };
    const report = {
      _id: 'report_1',
      title: 'Citizen Report',
      citizen: { _id: 'citizen_123' },
      status: ReportStatus.SUBMITTED
    };
    mockRepo.findById.mockResolvedValue(report);

    // Act
    const result = await reportService.getReportById('report_1', adminUser);

    // Assert
    expect(result).toBe(report);
  });

  // Rule 2: Only Admins can review and manage reports
  test('Rule 2: citizen_attempting_status_update_is_rejected_with_forbidden', async () => {
    // Arrange
    const citizenUser = { id: 'citizen_123', role: 'CITIZEN' };

    // Act & Assert
    await expect(
      reportService.updateReportStatus('report_1', { status: ReportStatus.VERIFIED }, citizenUser)
    ).rejects.toThrow(ForbiddenError);
  });

  // Rule 3: Report status must follow the agreed workflow
  test('Rule 3: admin_attempting_invalid_status_transition_is_rejected_without_state_change', async () => {
    // Arrange
    const adminUser = { id: 'admin_1', role: 'ADMIN' };
    const report = {
      _id: 'report_1',
      title: 'Pothole',
      status: ReportStatus.SUBMITTED,
      citizen: { _id: 'citizen_1' }
    };
    mockRepo.findById.mockResolvedValue(report);

    // Act & Assert: Disallowed transition from SUBMITTED directly to RESOLVED
    await expect(
      reportService.updateReportStatus('report_1', { status: ReportStatus.RESOLVED }, adminUser)
    ).rejects.toThrow(ValidationError);
    expect(report.status).toBe(ReportStatus.SUBMITTED); // Invariant: stored state remains unchanged
    expect(mockRepo.saveReport).not.toHaveBeenCalled();
  });

  test('Rule 3: admin_rejecting_report_without_rejection_reason_is_rejected', async () => {
    // Arrange
    const adminUser = { id: 'admin_1', role: 'ADMIN' };
    const report = {
      _id: 'report_1',
      title: 'Pothole',
      status: ReportStatus.UNDER_REVIEW,
      citizen: { _id: 'citizen_1' }
    };
    mockRepo.findById.mockResolvedValue(report);

    // Act & Assert
    await expect(
      reportService.updateReportStatus('report_1', { status: ReportStatus.REJECTED }, adminUser)
    ).rejects.toThrow(ValidationError);
  });

  // Rule 4: Department assignment must reference a valid department
  test('Rule 4: admin_assigning_nonexistent_department_is_rejected_with_not_found', async () => {
    // Arrange
    const adminUser = { id: 'admin_1', role: 'ADMIN' };
    mockDeptService.getDepartmentById.mockRejectedValue(new NotFoundError('Department not found'));

    // Act & Assert
    await expect(
      reportService.assignDepartment('report_1', { departmentId: 'invalid_dept_id' }, adminUser)
    ).rejects.toThrow(NotFoundError);
  });

  // Rule 5: Notifications must reflect real report events
  test('Rule 5: valid_status_transition_creates_notification_for_report_owner', async () => {
    // Arrange
    const adminUser = { id: 'admin_1', role: 'ADMIN' };
    const report = {
      _id: 'report_10',
      title: 'Broken Streetlight',
      status: ReportStatus.SUBMITTED,
      citizen: { _id: 'citizen_owner_id' }
    };
    mockRepo.findById.mockResolvedValue(report);
    mockRepo.saveReport.mockImplementation(async (r) => r);

    // Act: Valid transition SUBMITTED -> UNDER_REVIEW
    await reportService.updateReportStatus('report_10', { status: ReportStatus.UNDER_REVIEW }, adminUser);

    // Assert
    expect(mockNotifService.notifyCitizen).toHaveBeenCalledTimes(1);
    expect(mockNotifService.notifyCitizen).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'citizen_owner_id',
        reportId: 'report_10'
      })
    );
  });
});
