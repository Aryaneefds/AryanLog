import { Request, Response, NextFunction } from 'express';
import { env } from '../config/index';

interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        res.status(400).json({
            error: 'Validation failed',
            details: err.message,
        });
        return;
    }

    // Mongoose duplicate key error
    if (err.code === '11000') {
        res.status(409).json({
            error: 'Duplicate entry',
            details: 'A record with this value already exists',
        });
        return;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            error: 'Invalid ID format',
        });
        return;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Invalid token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Token expired',
        });
        return;
    }

    // Custom errors with status code
    if (err.statusCode) {
        res.status(err.statusCode).json({
            error: err.message,
        });
        return;
    }

    // Default server error
    res.status(500).json({
        error: env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}

export function notFound(req: Request, res: Response): void {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
    });
}
