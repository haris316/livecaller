import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import test from "./routes/test/route.js"
import weekly from "./routes/weekly/route.js"
import daily from "./routes/daily/route.js"
import live from "./routes/live/route.js"
import points from "./routes/points/route.js"

dotenv.config();

const PORT = process.env.PORT || 7000;
const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

// Create HTTP server
const server = http.createServer(app);

// Start Server and Connect to DB
try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGO);
    console.log('Connected to database');

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Database connection error:', error);
}

//Routes
app.use('/cron/test', test);
app.use('/cron/weekly', weekly);
app.use('/cron/daily', daily);
app.use('/cron/live', live);
app.use('/cron/points', points);