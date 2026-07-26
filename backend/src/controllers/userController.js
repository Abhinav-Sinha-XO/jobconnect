const userService = require("../services/userService");

async function registerUser(req, res) {

    const result = await userService.registerUser(req.body);

    res.status(200).json(result);

}

module.exports = {
    registerUser,
};
