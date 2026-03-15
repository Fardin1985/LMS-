import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (res, user, message) => {
  // 1. 👇 Use 'userId' instead of 'id' to match your req.id in controllers
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/", // ✅ add this
    maxAge: 24 * 60 * 60 * 1000,
  });
  // 3. Return the full user object (including photoUrl) so Redux stays updated
  return res.status(200).json({
    success: true,
    message: message || `Welcome back, ${user.name}`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl, // 👈 Added this for your dashboard!
    }
  });
};

export default generateToken;