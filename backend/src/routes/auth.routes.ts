import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index';
import { env } from '../config/index';
import { validateBody, authenticate, authLimiter, type AuthRequest } from '../middleware/index';

const router = Router();

// Validation schemas
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});

// Login
router.post(
    '/login',
    authLimiter,
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token (7 days)
            const token = jwt.sign(
                { userId: user._id.toString() },
                env.JWT_SECRET,
                { expiresIn: 604800 } // 7 days in seconds
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    bio: user.bio,
                    avatar: user.avatar,
                    socials: user.socials,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Register (first user only - for initial setup)
router.post(
    '/register',
    authLimiter,
    validateBody(registerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if any user exists
            const existingUsers = await User.countDocuments();
            if (existingUsers > 0) {
                res.status(403).json({ error: 'Registration is disabled' });
                return;
            }

            const { email, password, name } = req.body;

            const passwordHash = await bcrypt.hash(password, 12);

            const user = new User({
                email,
                passwordHash,
                name,
            });

            await user.save();

            const token = jwt.sign(
                { userId: user._id.toString() },
                env.JWT_SECRET,
                { expiresIn: 604800 } // 7 days in seconds
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get current user profile
router.get(
    '/me',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = await User.findById(req.userId).select('-passwordHash');
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }
);

// Update profile
router.patch(
    '/me',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const { name, bio, avatar, socials } = req.body;

            if (name) user.name = name;
            if (bio !== undefined) user.bio = bio;
            if (avatar !== undefined) user.avatar = avatar;
            if (socials) user.socials = { ...user.socials, ...socials };

            await user.save();

            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    bio: user.bio,
                    avatar: user.avatar,
                    socials: user.socials,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
