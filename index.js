import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to database');

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Database connection error:', error);
}

//Routes
// app.use('/api/users', userRoutes);