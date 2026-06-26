import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { verifyAccessToken } from '../utils/token';
import { UserRole } from '../constants';

export interface IAuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: IAuthUser;
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

    req.authUser = {
      id: decoded.userId,
      role: decoded.role as UserRole,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      return next(new UnauthorizedError('You are not authenticated'));
    }

    if (!roles.includes(req.authUser.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};
