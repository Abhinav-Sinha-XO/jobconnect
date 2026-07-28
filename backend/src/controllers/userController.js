
const asyncHandler = require("../utils/asyncHandler");
const {
  registerUser: registerUserService,
  loginUser: loginUserService,
  getUserProfile: getUserProfileService
} = require("../services/userService");


const registerUser = asyncHandler(async (req, res) => {

    const result = await registerUserService(req.body);

    res.status(201).json(result);

});

const loginUser = asyncHandler(async (req, res) => {

    const result = await loginUserService(req.body);

    res.status(200).json(result);

});

const getMyProfile = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const user = await getUserProfileService(userId);   

    res.status(200).json({
        success: true,
        user
    });

});

module.exports = {
    registerUser,
    loginUser,
    getMyProfile
};