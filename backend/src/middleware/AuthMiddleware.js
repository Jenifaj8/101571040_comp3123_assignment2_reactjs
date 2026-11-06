/*
Purpose:
Verify JWT tokens and authenticate users.
*/

const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const verifyToken = async (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({
                message: "Access denied. JWT token required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return response.status(401).json({
                message: "JWT token required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return response.status(401).json({
                message: "Invalid authentication"
            });
        }

        request.user = {
            id: user._id
        };

        next();

    } catch (error) {
        return response.status(401).json({
            message: "Invalid or expired JWT token"
        });
    }
};

module.exports = verifyToken;