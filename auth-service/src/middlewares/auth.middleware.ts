import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@shared/errors/app-error';
import { verifyAccessToken } from '@shared/utils/token';
import { userRepository } from '../repositories/user.repository';
import { UserRole } from '@shared/constants';
import { IUser } from '../models/user.model';

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

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in. Please log in to get access.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token. Please log in again.');
    }

    const currentUser = await userRepository.findById(decoded.userId);
    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

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
