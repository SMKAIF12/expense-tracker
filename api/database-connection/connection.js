require('dotenv').config();
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    const uri = process.env.URL;
    if (!uri) {
        throw new Error("Please define the URL environment variable inside .env or Vercel Settings");
    }
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        };
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log('MongoDB connection successful.');
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection Failed: ', e);
        throw e;
    }
    return cached.conn;
};

module.exports = connectDB;