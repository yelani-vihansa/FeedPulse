import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid credentials', 401, 'AUTH_INVALID_CREDENTIALS');
  }
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  return sendSuccess(res, { token }, 'Login successful');
};

export const createDefaultAdmin = async () => {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    const user = new User({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    await user.save();
    console.log('Admin created:', process.env.ADMIN_EMAIL);
    return;
  }

  const passwordMatches = await existing.comparePassword(process.env.ADMIN_PASSWORD!);
  if (!passwordMatches) {
    existing.password = process.env.ADMIN_PASSWORD!;
    await existing.save();
    console.log('Admin password updated:', process.env.ADMIN_EMAIL);
  }
};