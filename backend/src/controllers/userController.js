function registerUser(req, res) {
    res.status(200).json({
        success: true,
        message: "Controller is working!"
    });
}

module.exports = {
    registerUser,
};