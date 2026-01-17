const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bglog');
        console.log('Connected to MongoDB');

        const newPassword = 'password123';
        const hash = await bcrypt.hash(newPassword, 12);

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: 'aryanyadav830670@gmail.com' },
            { $set: { passwordHash: hash } }
        );

        console.log('✅ Password reset for: aryanyadav830670@gmail.com');
        console.log('✅ New password: password123');
        console.log('Modified count:', result.modifiedCount);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
