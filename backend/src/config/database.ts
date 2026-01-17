import mongoose from 'mongoose';
import { env } from './env';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

export async function connectDatabase(): Promise<void> {
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(env.MONGODB_URI);
            console.log('✅ Connected to MongoDB');
            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, error);

            if (retries < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    console.error('💥 Failed to connect to MongoDB after maximum retries');
    process.exit(1);
}

export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
});
