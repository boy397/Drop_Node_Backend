import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { verifyAccessToken } from '../utils/token';
import { userRepository } from '../repositories/user.repository';
import { UserRole } from '../constants';
import { IUser } from '../models/user.model';

// Extend Express Request interface to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in. Please log in to get access.');
    }

    // 2. Verify token signature and expiration
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token. Please log in again.');
    }

    // 3. Check if user still exists
    const currentUser = await userRepository.findById(decoded.userId);
    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // 4. Grant access and attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Restrict routes to specific roles (Authorization)
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('You are not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};
