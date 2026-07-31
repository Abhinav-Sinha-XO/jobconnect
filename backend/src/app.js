const express = require("express");
const notFound = require("./middleware/notFound");

const errorMiddleware = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const path=require("path");
const app = express();

// Middleware
app.use(express.json());
require("./database/db");








// Default Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 JobConnect API is Running..."
    });
});

app.use("/api/users/companies", companyRoutes);

app.use("/api/users", userRoutes);
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use(notFound);
app.use(errorMiddleware);




module.exports = app;