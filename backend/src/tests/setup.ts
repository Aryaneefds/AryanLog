import { connectDatabase, disconnectDatabase } from '../config/database';

beforeAll(async () => {
    // Check if we are in test environment
    if (process.env.NODE_ENV === 'test') {
        await connectDatabase();
    }
});

afterAll(async () => {
    await disconnectDatabase();
});
