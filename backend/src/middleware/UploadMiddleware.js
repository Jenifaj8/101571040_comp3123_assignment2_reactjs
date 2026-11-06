
/*
Purpose:
Handle employee profile picture uploads.
*/

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Upload directory
const uploadDirectory = path.join(__dirname, "../../uploads");

// Create uploads folder if it does not exist
fs.mkdirSync(uploadDirectory, { recursive: true });

// Allowed image types
const allowedTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

// Configure storage
const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (request, file, callback) => {
        const extension = allowedTypes[file.mimetype];
        const uniqueName =
            crypto.randomBytes(16).toString("hex") + extension;

        callback(null, uniqueName);
    }
});

// Validate image type
const fileFilter = (request, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
        return callback(
            new Error("Only JPEG, PNG and WebP images are allowed")
        );
    }

    callback(null, true);
};

// Configure Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    },
    fileFilter: fileFilter
});

// Validate actual image content
const hasValidSignature = (filePath, mimetype) => {
    const buffer = fs.readFileSync(filePath);

    if (mimetype === "image/jpeg") {
        return buffer[0] === 0xFF &&
            buffer[1] === 0xD8 &&
            buffer[2] === 0xFF;
    }

    if (mimetype === "image/png") {
        return buffer.subarray(0, 8).equals(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        );
    }

    if (mimetype === "image/webp") {
        return buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP";
    }

    return false;
};

// Handle uploads and errors
const uploadProfilePicture = (request, response, next) => {
    upload.single("profile_picture")(
        request,
        response,
        (error) => {
            if (error) {
                if (
                    error instanceof multer.MulterError &&
                    error.code === "LIMIT_FILE_SIZE"
                ) {
                    return response.status(413).json({
                        message: "Profile picture must not exceed 2 MB"
                    });
                }

                return response.status(400).json({
                    message: error.message
                });
            }

            if (request.file) {
                if (
                    !hasValidSignature(
                        request.file.path,
                        request.file.mimetype
                    )
                ) {
                    fs.unlinkSync(request.file.path);

                    return response.status(400).json({
                        message: "Invalid image file"
                    });
                }
            }

            next();
        }
    );
};

module.exports = uploadProfilePicture;
