const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const { registerUser,loginUser,getMyProfile, updateProfile } = require("../controllers/userController");

const router = express.Router();


router.get(
    "/me",
    authMiddleware,
    (req, res) => {

        res.status(200).json({
            success: true,
            user: req.user
        });

    }
);


router.get(
    "/recruiter-dashboard",
    authMiddleware,
    authorize("recruiter"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome Recruiter!"
        });

    }
);

// router.get(
//     "/dashboard",
//     authMiddleware,
//     authorize(
//         "admin",
//         "recruiter"
//     ),
//     getMyProfile
// );

router.get(
    "/profile",
    authMiddleware,
    getMyProfile
);


router.patch(
    "/profile",
    authMiddleware,
    updateProfile
);

router.post("/register", registerUser);
router.post("/login",loginUser);

module.exports = router;