import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return sendError(res, 'No token provided', 401, 'AUTH_TOKEN_MISSING');
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (error) {
    return sendError(res, 'Invalid token', 401, 'AUTH_TOKEN_INVALID');
  }
};