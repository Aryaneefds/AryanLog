import { Request, Response, NextFunction } from 'express';
import { CONSTANTS } from '../config/index';

interface CacheOptions {
    ttl?: number;
    private?: boolean;
}

// Simple in-memory cache for development
const cache = new Map<string, { data: unknown; expires: number }>();

export function cacheResponse(options: CacheOptions = {}) {
    const ttl = options.ttl ?? CONSTANTS.CACHE_TTL.POST;
    const isPrivate = options.private ?? false;

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = `${req.method}:${req.originalUrl}`;
        const cached = cache.get(key);

        if (cached && cached.expires > Date.now()) {
            res.set('X-Cache', 'HIT');
            res.set('Cache-Control', `${isPrivate ? 'private' : 'public'}, max-age=${ttl}`);
            res.json(cached.data);
            return;
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data: unknown) => {
            cache.set(key, {
                data,
                expires: Date.now() + ttl * 1000,
            });

            res.set('X-Cache', 'MISS');
            res.set('Cache-Control', `${isPrivate ? 'private' : 'public'}, max-age=${ttl}`);
            return originalJson(data);
        };

        next();
    };
}

export function invalidateCache(patterns: string[]): void {
    for (const [key] of cache) {
        if (patterns.some(pattern => key.includes(pattern))) {
            cache.delete(key);
        }
    }
}

export function clearCache(): void {
    cache.clear();
}
