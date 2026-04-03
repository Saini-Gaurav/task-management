import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      sendError(res, 'Invalid token type', 401);
      return;
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        sendError(res, 'Access token expired', 401, 'TOKEN_EXPIRED');
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        sendError(res, 'Invalid access token', 401, 'INVALID_TOKEN');
        return;
      }
    }
    sendError(res, 'Authentication failed', 401);
  }
};