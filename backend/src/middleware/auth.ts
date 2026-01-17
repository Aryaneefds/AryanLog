import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index';

export interface AuthRequest extends Request {
    userId?: string;
}

interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization required' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.userId = decoded.userId;
    } catch {
        // Token invalid, but continue without auth
    }

    next();
}
