
/*
Purpose:
Set up the Express server, middleware,
MongoDB connection and API routes.
*/

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const connectDB = require("./config/db");
const UserRoutes = require("./routes/UserRoutes");
const EmployeeRoutes = require("./routes/EmployeeRoutes");

const apiLimiter = require("./middleware/RateLimitMiddleware");
const fileLogger = require("./middleware/LoggerMiddleware");
const errorHandler = require("./middleware/ErrorMiddleware");

const app = express();

// Trust Vercel's reverse proxy
if (process.env.VERCEL) {
    app.set("trust proxy", 1);
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Console and file logging
app.use(morgan("dev"));
app.use(fileLogger);

// Rate limiting
app.use("/api/v1", apiLimiter);

// Health check endpoint
app.get("/health", (request, response) => {
    return response.status(200).json({
        status: "OK",
        message: "Server is running"
    });
});

// API routes
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/emp", EmployeeRoutes);

// Handle unknown routes
app.use((request, response) => {
    return response.status(404).json({
        message: "Route not found"
    });
});

// Centralized error handling
app.use(errorHandler);

// Server port
const PORT = process.env.PORT || 8081;

// Start server locally
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Run the local server only when not on Vercel
if (!process.env.VERCEL) {
    startServer();
}

// Connect to MongoDB when deployed on Vercel
if (process.env.VERCEL) {
    connectDB();
}

// Export Express app for Vercel
module.exports = app;