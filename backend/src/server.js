
/*
Purpose:
Set up the Express server, middleware,
MongoDB connection and API routes.
*/

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");
const UserRoutes = require("./routes/UserRoutes");
const EmployeeRoutes = require("./routes/EmployeeRoutes");

const apiLimiter = require("./middleware/RateLimitMiddleware");
const fileLogger = require("./middleware/LoggerMiddleware");
const errorHandler = require("./middleware/ErrorMiddleware");

const app = express();

// Trust reverse proxy when deployed
if (process.env.VERCEL) {
    app.set("trust proxy", 1);
}

// CORS configuration
const frontendOrigin = process.env.CORS_ORIGIN;

const corsOptions = {
    origin: (origin, callback) => {

        // Allow requests without an Origin header
        // such as Postman and server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        // Allow only the configured frontend origin
        if (frontendOrigin && origin === frontendOrigin) {
            return callback(null, true);
        }

        // Reject other browser origins
        return callback(null, false);
    },

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    optionsSuccessStatus: 204
};

// Apply CORS
app.use(cors(corsOptions));

// Helmet security configuration
// Allow the frontend to display uploaded profile pictures
app.use(helmet({
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    }
}));

// Parse JSON requests
app.use(express.json());

// Serve uploaded employee profile pictures
const uploadDirectory = path.join(__dirname, "../uploads");

app.use(
    "/uploads",
    express.static(uploadDirectory, {
        dotfiles: "deny",
        index: false
    })
);

// Console and file logging
app.use(morgan("dev"));
app.use(fileLogger);

// Rate limiting
// Protects Signup, Login and other API routes
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

// Export Express app for deployment
module.exports = app;
