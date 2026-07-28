const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(
            401,
            "Access denied. No token provided."
        );
    }

    if (!authHeader.startsWith("Bearer ")) {
        throw new ApiError(
            401,
            "Invalid token format."
        );
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        throw new ApiError(
            401,
            "Invalid or expired token."
        );

    }

};

module.exports = authMiddleware;