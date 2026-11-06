
/*
Purpose:
Log HTTP requests to a local file.
Use console logging on Vercel.
Avoid logging passwords and JWT tokens.
*/

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Log URL path without query parameters
morgan.token("safe-path", (request) => request.path);

const logFormat =
    ":method :safe-path :status :response-time ms :res[content-length]";

let fileLogger;

if (process.env.VERCEL) {
    // Vercel uses console logs
    fileLogger = morgan(logFormat);
} else {
    // Local file logging
    const logDirectory = path.join(__dirname, "../../logs");

    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    const logStream = fs.createWriteStream(
        path.join(logDirectory, "access.log"),
        { flags: "a" }
    );

    fileLogger = morgan(logFormat, {
        stream: logStream
    });
}

module.exports = fileLogger;
