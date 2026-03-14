import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Helper: Generate JWT Token and set cookie
const generateToken = (res, user, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '1d',
  });

  // Set JWT cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict' 
  });

  // Send the final response to the frontend
  return res.status(200).json({
    success: true,
    message: message || `Welcome back, ${user.name}`, // Uses the custom message or defaults to "Welcome back"
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token
  });
};

export default generateToken;