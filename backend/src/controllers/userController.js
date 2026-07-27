const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");


const registerUser = asyncHandler(async (req, res) => {

    const result = await userService.registerUser(req.body);

    res.status(201).json(result);

});

const loginUser = asyncHandler(async (req, res) => {

    const result = await userService.loginUser(req.body);

    res.status(200).json(result);

});

module.exports = {
    registerUser,loginUser
};