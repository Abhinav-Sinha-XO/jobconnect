const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const {
    applyJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    withdrawApplication} = require("../controllers/applicationController");



router.post(
    "/:jobId",
    authMiddleware,
    authorize("job-seeker"),
    applyJob
)



router.get(
    "/my-applications",
    authMiddleware,
    authorize("job-seeker"),
    getMyApplications
);




router.get(
    "/job/:jobId",
    authMiddleware,
    authorize("recruiter"),
    getApplicationsForJob
);



router.put(
    "/:applicationId",
    authMiddleware,
    authorize("recruiter"),
    updateApplicationStatus
);


router.delete(
    "/:applicationId",
    authMiddleware,
    authorize("job-seeker"),
    withdrawApplication
);



module.exports = router;