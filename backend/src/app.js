const express = require("express");
const notFound = require("./middleware/notFound");

 const errorMiddleware = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");


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


app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorMiddleware);




module.exports = app;