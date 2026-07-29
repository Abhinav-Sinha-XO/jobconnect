
const asyncHandler = require("../utils/asyncHandler");
const {
  registerUser: registerUserService,
  loginUser: loginUserService,
  getUserProfile: getUserProfileService,
  updateUserProfile: updateUserProfileService,
  changePasswordService

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


const updateProfile = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const updateData = req.body;

    const updatedUser = await updateUserProfileService(
        userId,
        updateData
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: updatedUser
    });

});


const changePassword = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    await changePasswordService(
        userId,
        currentPassword,
        newPassword
    );

    res.status(200).json({
        success: true,
        message: "Password changed successfully."
    });

});



module.exports = {
    registerUser,
    loginUser,
    getMyProfile,
    updateProfile,
    changePassword
};
