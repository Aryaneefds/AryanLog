require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connection Successful!');
        console.log('Database name:', mongoose.connection.name);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:');
        console.error(err.message);
        process.exit(1);
    });
