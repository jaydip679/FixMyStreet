const { z } = require('zod');
const { UserRoles } = require('../users/user.model');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([UserRoles.CITIZEN, UserRoles.ADMIN]).optional().default(UserRoles.CITIZEN)
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
};
