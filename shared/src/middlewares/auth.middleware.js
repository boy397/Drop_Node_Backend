"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const app_error_1 = require("../errors/app-error");
const token_1 = require("../utils/token");
const protect = async (req, _res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw new app_error_1.UnauthorizedError('You are not logged in. Please log in to get access.');
        }
        let decoded;
        try {
            decoded = (0, token_1.verifyAccessToken)(token);
        }
        catch (err) {
            throw new app_error_1.UnauthorizedError('Invalid or expired token. Please log in again.');
        }
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new app_error_1.UnauthorizedError('You are not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new app_error_1.ForbiddenError('You do not have permission to perform this action'));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
