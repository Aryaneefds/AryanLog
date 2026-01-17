import express from 'express';
import cors from 'cors';
import { env, connectDatabase } from './config/index';
import { errorHandler, notFound, apiLimiter } from './middleware/index';
import routes from './routes/index';

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function start() {
    try {
        await connectDatabase();

        const port = parseInt(env.PORT, 10);
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
            console.log(`📚 API available at http://localhost:${port}/api`);
            console.log(`🌍 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    start();
}

export default app;
