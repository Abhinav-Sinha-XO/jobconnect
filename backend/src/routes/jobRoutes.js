const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const {
    createJob,getAllJobs,getJobById, getMyJobs,updateJob,deleteJob
} = require("../controllers/jobController");




router.get(
    "/",
    getAllJobs
);


router.post(

    "/",

    authMiddleware,
    
    authorize("admin","recruiter"),
    
    createJob

);

router.get(

    "/my-jobs",

    authMiddleware,

    authorize("admin","recruiter"),

    getMyJobs

);



router.get(
    "/:id",
    getJobById
);





router.put(

    "/:id",

    authMiddleware,

    authorize("admin","recruiter"),

    updateJob

);

router.delete(

    "/:id",

    authMiddleware,

    authorize("admin","recruiter"),

    deleteJob

);



module.exports = router;