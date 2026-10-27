const bcrypt = require('bcryptjs');
const { connectDatabase, disconnectDatabase } = require('./db');
const { User, UserRoles } = require('../modules/users/user.model');
const { Department } = require('../modules/departments/department.model');
const { IssueReport, IssueCategories } = require('../modules/reports/report.model');
const { Notification, NotificationEvents } = require('../modules/notifications/notification.model');
const { ReportStatus } = require('../modules/reports/report.workflow');

async function seedDatabase() {
  await connectDatabase();
  console.log('[Seed] Seeding demo data for FixMyStreet...');

  // Clear existing demo collections
  await User.deleteMany({});
  await Department.deleteMany({});
  await IssueReport.deleteMany({});
  await Notification.deleteMany({});

  // 1. Seed Departments
  const departments = await Department.insertMany([
    { name: 'Public Works Department', code: 'PWD', description: 'Roads, pavements, potholes, bridges', contactEmail: 'pwd@city.gov' },
    { name: 'Sanitation & Waste Management', code: 'SWM', description: 'Garbage accumulation, litter bins, dumping', contactEmail: 'sanitation@city.gov' },
    { name: 'Electrical & Streetlighting', code: 'ELEC', description: 'Streetlights, exposed cables, junction boxes', contactEmail: 'electrical@city.gov' },
    { name: 'Water Supply & Sewerage', code: 'WSS', description: 'Pipeline leakages, drainage overflows, sewer blockages', contactEmail: 'water@city.gov' }
  ]);
  const [pwd, swm, elec, wss] = departments;

  // 2. Seed Users (Admin + Citizen)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const citizenPassword = await bcrypt.hash('password123', salt);

  const admin = await User.create({
    name: 'Municipal Admin Officer',
    email: 'admin@fixmystreet.gov',
    password: adminPassword,
    role: UserRoles.ADMIN
  });

  const citizen = await User.create({
    name: 'Ramesh Patel',
    email: 'citizen@fixmystreet.local',
    password: citizenPassword,
    role: UserRoles.CITIZEN
  });

  // 3. Seed Sample Reports across Lifecycle
  const r1 = await IssueReport.create({
    title: 'Deep crater pothole near Bus Station',
    description: 'A 2-foot wide pothole causing severe traffic slowdown and hazard for two-wheelers.',
    category: IssueCategories.POTHOLE,
    location: { address: 'Opposite Central Bus Station, Station Road', latitude: 23.2156, longitude: 72.6369 },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60',
    status: ReportStatus.IN_PROGRESS,
    citizen: citizen._id,
    assignedDepartment: pwd._id,
    assignedWorker: 'Road Repair Crew 04'
  });

  const r2 = await IssueReport.create({
    title: 'Overflowing commercial waste bin',
    description: 'Dumpster has not been cleared for 4 days, garbage spilling onto walkway.',
    category: IssueCategories.GARBAGE,
    location: { address: 'Market Lane, Sector 7 Commercial Complex', latitude: 23.2201, longitude: 72.6412 },
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=60',
    status: ReportStatus.SUBMITTED,
    citizen: citizen._id
  });

  const r3 = await IssueReport.create({
    title: 'Broken streetlight outside school gate',
    description: 'Streetlight pole head is broken and unlit, creating a safety hazard for evening students.',
    category: IssueCategories.STREETLIGHT,
    location: { address: 'Gate 3, Navodaya Vidyalaya, Ring Road', latitude: 23.2188, longitude: 72.6321 },
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=60',
    status: ReportStatus.VERIFIED,
    citizen: citizen._id
  });

  const r4 = await IssueReport.create({
    title: 'Drinking water pipe leakage',
    description: 'Underground potable water pipe ruptured, flooding pedestrian pathway.',
    category: IssueCategories.WATER_LEAKAGE,
    location: { address: 'Near Water Tank, Block B, Indiranagar', latitude: 23.2132, longitude: 72.6455 },
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=60',
    status: ReportStatus.RESOLVED,
    citizen: citizen._id,
    assignedDepartment: wss._id,
    assignedWorker: 'Plumbing Crew B',
    resolutionNotes: 'Pipe joint replaced and pressure tested on 27-Oct-2026. Trench refilled and restored.'
  });

  // 4. Seed Notifications for Citizen
  await Notification.create([
    {
      recipient: citizen._id,
      report: r1._id,
      event: NotificationEvents.REPORT_ASSIGNED,
      title: 'Department Assigned',
      message: `Your report "${r1.title}" has been assigned to the Public Works Department.`
    },
    {
      recipient: citizen._id,
      report: r4._id,
      event: NotificationEvents.REPORT_RESOLVED,
      title: 'Report Resolved',
      message: `Your report "${r4.title}" has been resolved. Notes: Pipe joint replaced and restored.`
    }
  ]);

  console.log('[Seed] Demo data successfully seeded!');
  console.log('--- Admin credentials: admin@fixmystreet.gov / admin123');
  console.log('--- Citizen credentials: citizen@fixmystreet.local / password123');
  await disconnectDatabase();
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
