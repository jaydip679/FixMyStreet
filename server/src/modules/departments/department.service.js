const { Department } = require('./department.model');
const { NotFoundError, ConflictError } = require('../../shared/errors/app-error');

class DepartmentService {
  async getAllDepartments() {
    return Department.find().sort({ name: 1 });
  }

  async getDepartmentById(id) {
    const dept = await Department.findById(id);
    if (!dept) {
      throw new NotFoundError(`Department with ID ${id} not found`);
    }
    return dept;
  }

  async createDepartment({ name, code, description, contactEmail }) {
    const existing = await Department.findOne({
      $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }]
    });
    if (existing) {
      throw new ConflictError('A department with this name or code already exists');
    }

    const dept = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description,
      contactEmail
    });
    return dept.save();
  }

  async seedDefaultDepartments() {
    const count = await Department.countDocuments();
    if (count > 0) return;

    const defaults = [
      { name: 'Public Works Department', code: 'PWD', description: 'Roads, pavements, potholes, bridges' },
      { name: 'Sanitation & Waste Management', code: 'SWM', description: 'Garbage accumulation, litter bins, dumping' },
      { name: 'Electrical & Streetlighting', code: 'ELEC', description: 'Streetlights, exposed cables, junction boxes' },
      { name: 'Water Supply & Sewerage', code: 'WSS', description: 'Pipeline leakages, drainage overflows, sewer blockages' }
    ];

    await Department.insertMany(defaults);
  }
}

module.exports = new DepartmentService();
