"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecrets = () => {
    return {
        secret: process.env.JWT_SECRET || 'ecommerce_jwt_access_secret_key_2026_safe_local',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'ecommerce_jwt_refresh_secret_key_2026_safe_local',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    };
};
const generateAccessToken = (payload) => {
    const cfg = getSecrets();
    return jsonwebtoken_1.default.sign(payload, cfg.secret, {
        expiresIn: cfg.expiresIn,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    const cfg = getSecrets();
    return jsonwebtoken_1.default.sign(payload, cfg.refreshSecret, {
        expiresIn: cfg.refreshExpiresIn,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    const cfg = getSecrets();
    return jsonwebtoken_1.default.verify(token, cfg.secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const cfg = getSecrets();
    return jsonwebtoken_1.default.verify(token, cfg.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
