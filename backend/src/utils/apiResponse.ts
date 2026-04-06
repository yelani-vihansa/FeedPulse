import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'OK',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    message
  });
};

export const sendError = (
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  error: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
    message
  });
};
