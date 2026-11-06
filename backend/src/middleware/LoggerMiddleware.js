/*
Purpose:
Log HTTP requests to a local file.
Use console logging on Vercel.
*/

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

let fileLogger;

if (process.env.VERCEL) {
    // Vercel uses console logs
    fileLogger = morgan("combined");
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

    fileLogger = morgan("combined", {
        stream: logStream
    });
}

module.exports = fileLogger;