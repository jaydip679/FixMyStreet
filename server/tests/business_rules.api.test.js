const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User, UserRoles } = require('../src/modules/users/user.model');
const { IssueReport } = require('../src/modules/reports/report.model');
const { Department } = require('../src/modules/departments/department.model');
const { Notification } = require('../src/modules/notifications/notification.model');
const { ReportStatus } = require('../src/modules/reports/report.workflow');

describe('Business Rules 1 to 5 — API Integration Tests', () => {
  let mongoServer;
  let citizenToken1;
  let citizenId1;
  let citizenToken2;
  let adminToken;
  let sampleDepartmentId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await IssueReport.deleteMany({});
    await Department.deleteMany({});
    await Notification.deleteMany({});

    // Create Citizen 1
    const resCit1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Citizen One',
      email: 'citizen1@example.com',
      password: 'password123',
      role: UserRoles.CITIZEN
    });
    citizenToken1 = resCit1.body.data.token;
    citizenId1 = resCit1.body.data.user._id;

    // Create Citizen 2
    const resCit2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Citizen Two',
      email: 'citizen2@example.com',
      password: 'password123',
      role: UserRoles.CITIZEN
    });
    citizenToken2 = resCit2.body.data.token;

    // Create Admin
    const resAdmin = await request(app).post('/api/v1/auth/register').send({
      name: 'Municipal Admin',
      email: 'admin@fixmystreet.gov',
      password: 'adminPassword123',
      role: UserRoles.ADMIN
    });
    adminToken = resAdmin.body.data.token;

    // Create Department
    const dept = await Department.create({
      name: 'Road Maintenance Dept',
      code: 'RMD',
      description: 'Handles road repairs'
    });
    sampleDepartmentId = dept._id.toString();
  });

  // ==========================================
  // RULE 1: Citizens Can Access Only Their Own Reports
  // ==========================================
  test('Rule 1: citizen can view own report but is denied access to another citizens report', async () => {
    // Arrange: Citizen 1 submits a report
    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Deep Pothole on 1st Main',
        description: 'Large hazardous pothole near crossroad.',
        category: 'POTHOLE',
        location: { address: '1st Main Road, Sector 4' }
      });
    const reportId = createRes.body.data.report._id;

    // Act 1: Citizen 1 retrieves their own report
    const ownAccessRes = await request(app)
      .get(`/api/v1/reports/${reportId}`)
      .set('Authorization', `Bearer ${citizenToken1}`);

    // Assert 1: Access allowed
    expect(ownAccessRes.status).toBe(200);
    expect(ownAccessRes.body.data.report.title).toBe('Deep Pothole on 1st Main');

    // Act 2: Citizen 2 attempts to retrieve Citizen 1's report
    const otherAccessRes = await request(app)
      .get(`/api/v1/reports/${reportId}`)
      .set('Authorization', `Bearer ${citizenToken2}`);

    // Assert 2: Access denied with 403 Forbidden
    expect(otherAccessRes.status).toBe(403);
    expect(otherAccessRes.body.success).toBe(false);
    expect(otherAccessRes.body.message).toContain('only your own reports');
  });

  // ==========================================
  // RULE 2: Only Admins Can Review and Manage Reports
  // ==========================================
  test('Rule 2: citizens cannot perform administrative status update or assignment', async () => {
    // Arrange: Create a report
    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Broken Streetlight Pole',
        description: 'Light has been flickering and completely failed.',
        category: 'STREETLIGHT',
        location: { address: 'Street 10, Block C' }
      });
    const reportId = createRes.body.data.report._id;

    // Act 1: Citizen attempts to update status
    const statusRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({ status: ReportStatus.UNDER_REVIEW });

    // Assert 1: Forbidden
    expect(statusRes.status).toBe(403);

    // Act 2: Citizen attempts department assignment
    const assignRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/assign`)
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({ departmentId: sampleDepartmentId });

    // Assert 2: Forbidden
    expect(assignRes.status).toBe(403);
  });

  // ==========================================
  // RULE 3: Report Status Must Follow the Agreed Workflow
  // ==========================================
  test('Rule 3: invalid status transition is rejected and leaves stored status unchanged', async () => {
    // Arrange: Report created in SUBMITTED status
    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Garbage Dump Overflow',
        description: 'Waste overflowing onto the pedestrian pathway.',
        category: 'GARBAGE',
        location: { address: 'Market Yard Gate 2' }
      });
    const reportId = createRes.body.data.report._id;

    // Act: Admin attempts invalid transition: SUBMITTED directly to RESOLVED
    const res = await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ReportStatus.RESOLVED });

    // Assert: 400 Bad Request
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid report status transition');

    // Invariant verification: Report in database must still be in SUBMITTED status
    const dbReport = await IssueReport.findById(reportId);
    expect(dbReport.status).toBe(ReportStatus.SUBMITTED);
  });

  // ==========================================
  // RULE 4: Department Assignment Must Reference a Valid Department
  // ==========================================
  test('Rule 4: assigning nonexistent department fails with 404, valid department succeeds', async () => {
    // Arrange: Create report and move to VERIFIED
    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Water Main Leak',
        description: 'Potable water leaking continuously on road.',
        category: 'WATER_LEAKAGE',
        location: { address: 'Subhash Road Junction' }
      });
    const reportId = createRes.body.data.report._id;

    // Step 1: Advance to UNDER_REVIEW
    await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ReportStatus.UNDER_REVIEW });

    // Step 2: Advance to VERIFIED
    await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ReportStatus.VERIFIED });

    // Act 1: Attempt to assign nonexistent department ID
    const fakeDeptId = new mongoose.Types.ObjectId().toString();
    const invalidAssignRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ departmentId: fakeDeptId });

    // Assert 1: Fails with 404 Not Found
    expect(invalidAssignRes.status).toBe(404);

    // Act 2: Assign valid department
    const validAssignRes = await request(app)
      .patch(`/api/v1/reports/${reportId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ departmentId: sampleDepartmentId, assignedWorker: 'Worker Ramesh' });

    // Assert 2: 200 OK and status updated to ASSIGNED
    expect(validAssignRes.status).toBe(200);
    expect(validAssignRes.body.data.report.assignedDepartment).toBe(sampleDepartmentId);
    expect(validAssignRes.body.data.report.status).toBe(ReportStatus.ASSIGNED);
  });

  // ==========================================
  // RULE 5: Notifications Must Reflect Real Report Events
  // ==========================================
  test('Rule 5: status transition creates in-app notification specifically for the report owner', async () => {
    // Arrange: Citizen 1 submits report
    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${citizenToken1}`)
      .send({
        title: 'Drainage Clogged',
        description: 'Storm drain clogged with debris.',
        category: 'WATER_LEAKAGE',
        location: { address: 'Lane 5, Park View' }
      });
    const reportId = createRes.body.data.report._id;

    // Act: Admin reviews report: SUBMITTED -> UNDER_REVIEW
    await request(app)
      .patch(`/api/v1/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ReportStatus.UNDER_REVIEW });

    // Assert: Citizen 1 has notifications (submission + status update)
    const notifRes1 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${citizenToken1}`);

    expect(notifRes1.status).toBe(200);
    expect(notifRes1.body.data.notifications.length).toBeGreaterThanOrEqual(2);
    const latestNotif = notifRes1.body.data.notifications[0];
    expect(latestNotif.recipient.toString()).toBe(citizenId1.toString());

    // Assert: Citizen 2 has ZERO notifications
    const notifRes2 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${citizenToken2}`);
    expect(notifRes2.body.data.notifications.length).toBe(0);
  });
});
