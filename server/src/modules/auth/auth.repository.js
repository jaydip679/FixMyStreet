const { User } = require('../users/user.model');

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    return User.findById(id);
  }

  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }
}

module.exports = new AuthRepository();
