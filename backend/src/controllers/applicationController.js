const asyncHandler = require("../utils/asyncHandler");

const {
    applyJobService,getMyApplicationsService,getApplicationsForJobService,updateApplicationStatusService,withdrawApplicationService
} = require("../services/applicationService");

const applyJob = asyncHandler(async (req, res) => {

    const jobId = Number(req.params.jobId);

    const candidateId = req.user.id;

    const application = await applyJobService(
        jobId,
        candidateId
    );

    res.status(201).json({

        success: true,

        message: "Application submitted successfully.",

        data: application

    });

});


const getMyApplications = asyncHandler(async (req, res) => {

    const candidateId = req.user.id;

    const applications =
        await getMyApplicationsService(
            candidateId
        );

    res.status(200).json({

        success: true,

        count: applications.length,

        data: applications

    });

});


const getApplicationsForJob = asyncHandler(async (req, res) => {

    const jobId = Number(req.params.jobId);

    const recruiterId = req.user.id;

    const applications =
        await getApplicationsForJobService(
            jobId,
            recruiterId
        );

    res.status(200).json({

        success: true,

        count: applications.length,

        data: applications

    });

});



const updateApplicationStatus = asyncHandler(async (req, res) => {

    const applicationId = Number(req.params.applicationId);

    const recruiterId = req.user.id;

    const { status } = req.body;

    const application =
        await updateApplicationStatusService(
            applicationId,
            recruiterId,
            status
        );

    res.status(200).json({

        success: true,

        message: "Application status updated successfully.",

        data: application

    });

});



const withdrawApplication = asyncHandler(async (req, res) => {

    const applicationId = Number(req.params.applicationId);

    const candidateId = req.user.id;

    await withdrawApplicationService(
        applicationId,
        candidateId
    );

    res.status(200).json({

        success: true,

        message: "Application withdrawn successfully."

    });

});


module.exports = {
    applyJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    withdrawApplication
};


