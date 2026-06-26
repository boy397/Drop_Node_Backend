"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const app_error_1 = require("../errors/app-error");
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, _next) => {
    let error = err;
    // Log all errors to console / service logs (can be customized per service)
    console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message}`, err.stack);
    // Handle Zod Schema Validation Errors
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = {};
        err.errors.forEach((issue) => {
            const field = issue.path.join('.');
            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }
            formattedErrors[field].push(issue.message);
        });
        error = new app_error_1.ValidationError(formattedErrors);
    }
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate value entered for ${field} field. Please use another value.`;
        error = new app_error_1.AppError(message, 409);
    }
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        const path = err.path;
        error = new app_error_1.AppError(`Invalid format for field: ${path}`, 400);
    }
    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const formattedErrors = {};
        const mongooseErrors = err.errors;
        Object.keys(mongooseErrors).forEach((key) => {
            formattedErrors[key] = [mongooseErrors[key].message];
        });
        error = new app_error_1.ValidationError(formattedErrors);
    }
    // Operational, trusted error: send message to client
    if (error instanceof app_error_1.AppError) {
        res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
            ...(error instanceof app_error_1.ValidationError ? { errors: error.errors } : {}),
            ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
        });
        return;
    }
    // Programming or other unknown error: don't leak details in production
    const responseMessage = process.env.NODE_ENV === 'development' ? error.message : 'Internal server error';
    res.status(500).json({
        status: 'error',
        message: responseMessage,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    });
};
exports.globalErrorHandler = globalErrorHandler;
