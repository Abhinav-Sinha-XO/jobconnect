const userService = require("../services/userService");

async function registerUser(req, res) {

    const result = await userService.registerUser(req.body);

    if (!result.success) {
        return res.status(409).json(result);
    }

    return res.status(201).json(result);
}

module.exports = {
    registerUser,
};