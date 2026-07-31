const express = require("express");

const router = express.Router();

const { createCompany,getMyCompany,updateCompany,uploadCompanyLogo, deleteCompany} = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");


router.post(
    "/",
    authMiddleware,
    createCompany
);

router.get(
    "/me",
    authMiddleware,
    getMyCompany
);

router.put(
    "/:id",
    authMiddleware,
    updateCompany
);

router.put(
    "/:id/logo",
    authMiddleware,
    upload.single("logo"),
    uploadCompanyLogo
);

router.delete(
    "/:id",
    authMiddleware,
    deleteCompany
);

module.exports = router;