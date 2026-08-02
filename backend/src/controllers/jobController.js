const asyncHandler = require("../utils/asyncHandler");

const {
    createJobService,
    getAllJobsService,
    getJobByIdService,
    getMyJobsService,
    updateJobService,
    deleteJobService,
} = require("../services/jobService");

const createJob = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;

    const jobData = req.body;

    const job = await createJobService(ownerId, jobData);

    res.status(201).json({
        success: true,

        message: "Job created successfully.",

        data: job,
    });
});

const getAllJobs = asyncHandler(async (req, res) => {
    const filters = req.query;

    const result = await getAllJobsService(filters);

    res.status(200).json({
        success: true,

        count: result.jobs.length,

        totalJobs: result.totalJobs,

        currentPage: result.currentPage,

        limit: result.limit,

        totalPages: result.totalPages,

        data: result.jobs,
    });
});

const getJobById = asyncHandler(async (req, res) => {
    const jobId = Number(req.params.id);

    const job = await getJobByIdService(jobId);

    res.status(200).json({
        success: true,

        data: job,
    });
});

const getMyJobs = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;

    const jobs = await getMyJobsService(ownerId);

    res.status(200).json({
        success: true,

        count: jobs.length,

        data: jobs,
    });
});

const updateJob = asyncHandler(async (req, res) => {
    const jobId = Number(req.params.id);

    const ownerId = req.user.id;

    const updatedJob = await updateJobService(jobId, ownerId, req.body);

    res.status(200).json({
        success: true,

        message: "Job updated successfully.",

        data: updatedJob,
    });
});

const deleteJob = asyncHandler(async (req, res) => {
    const jobId = Number(req.params.id);

    const ownerId = req.user.id;

    await deleteJobService(jobId, ownerId);

    res.status(200).json({
        success: true,

        message: "Job deleted successfully.",
    });
});

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getMyJobs,
    updateJob,
    deleteJob,
};
