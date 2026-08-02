const pool = require("../database/db");
const ApiError = require("../utils/ApiError");

const createJobService = async (
    ownerId,
    jobData
) => {

    const {
        title,
        description,
        requirements,
        location,
        salary,
        experience,
        job_type,
        vacancies
    } = jobData;

    if (
        !title ||
        !description ||
        !requirements ||
        !location ||
        salary === undefined ||
        experience === undefined ||
        !job_type
    ) {
        throw new ApiError(
            400,
            "All required fields must be provided."
        );
    }

    const companyResult = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE owner_id = $1
        `,
        [ownerId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Please create a company before posting jobs."
        );
    }

    const companyId =
        companyResult.rows[0].id;

    const jobResult = await pool.query(
        `
        INSERT INTO jobs
        (
            company_id,
            title,
            description,
            requirements,
            location,
            salary,
            experience,
            job_type,
            vacancies
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
        )
        RETURNING *;
        `,
        [
            companyId,
            title,
            description,
            requirements,
            location,
            salary,
            experience,
            job_type,
            vacancies ?? 1
        ]
    );

    return jobResult.rows[0];

};



const getAllJobsService = async (filters) => {

    const {
        q,
        location,
        job_type,
        experience,
        status,
        sort,
        page = 1,
        limit = 10
    } = filters;

    let query = `
        SELECT
            j.id,
            j.title,
            j.description,
            j.requirements,
            j.location,
            j.salary,
            j.experience,
            j.job_type,
            j.vacancies,
            j.status,
            j.created_at,
            c.id AS company_id,
            c.name AS company_name,
            c.logo AS company_logo
        FROM jobs j
        JOIN companies c
            ON j.company_id = c.id
    `;

    let countQuery = `
        SELECT COUNT(*) AS total
        FROM jobs j
        JOIN companies c
            ON j.company_id = c.id
    `;

    const conditions = [];
    const values = [];

    // Search by title
    if (q) {

        conditions.push(
            `j.title ILIKE $${values.length + 1}`
        );

        values.push(`%${q}%`);

    }

    // Filter by location
    if (location) {

        conditions.push(
            `j.location ILIKE $${values.length + 1}`
        );

        values.push(`%${location}%`);

    }

    // Filter by job type
    if (job_type) {

        conditions.push(
            `j.job_type ILIKE $${values.length + 1}`
        );

        values.push(job_type);

    }

    // Filter by experience
    if (experience) {

        conditions.push(
            `j.experience = $${values.length + 1}`
        );

        values.push(Number(experience));

    }

    // Filter by status
    if (status) {

        conditions.push(
            `j.status ILIKE $${values.length + 1}`
        );

        values.push(status);

    }

    // Add WHERE clause
    if (conditions.length > 0) {

        const whereClause = `
            WHERE
            ${conditions.join(" AND ")}
        `;

        query += whereClause;

        countQuery += whereClause;

    }

    // Execute COUNT query BEFORE pagination
    const countResult = await pool.query(
        countQuery,
        values
    );

    const totalJobs = Number(
        countResult.rows[0].total
    );

    // Sorting
    if (sort === "salary_asc") {

        query += `
            ORDER BY j.salary ASC
        `;

    }
    else if (sort === "salary_desc") {

        query += `
            ORDER BY j.salary DESC
        `;

    }
    else if (sort === "oldest") {

        query += `
            ORDER BY j.created_at ASC
        `;

    }
    else {

        query += `
            ORDER BY j.created_at DESC
        `;

    }

    // Pagination
    const offset =
        (Number(page) - 1) * Number(limit);

    query += `
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
    `;

    values.push(Number(limit));

    values.push(offset);

    // Execute main query
    const result = await pool.query(
        query,
        values
    );

    const totalPages = Math.ceil(
        totalJobs / Number(limit)
    );

    return {

        jobs: result.rows,

        totalJobs,

        currentPage: Number(page),

        limit: Number(limit),

        totalPages

    };

};

// Get job by ID service
const getJobByIdService = async (jobId) => {

    const result = await pool.query(
        `
        SELECT
            j.id,
            j.title,
            j.description,
            j.requirements,
            j.location,
            j.salary,
            j.experience,
            j.job_type,
            j.vacancies,
            j.status,
            j.created_at,
            j.updated_at,
            c.id AS company_id,
            c.name AS company_name,
            c.description AS company_description,
            c.website,
            c.location AS company_location,
            c.logo AS company_logo
        FROM jobs j
        JOIN companies c
            ON j.company_id = c.id
        WHERE j.id = $1;
        `,
        [jobId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(
            404,
            "Job not found."
        );
    }

    return result.rows[0];

};



// Get jobs posted by the authenticated user's company,Recruiter dashboard
const getMyJobsService = async (ownerId) => {

    const companyResult = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE owner_id = $1;
        `,
        [ownerId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const companyId = companyResult.rows[0].id;

    const jobsResult = await pool.query(
        `
        SELECT
            id,
            title,
            location,
            salary,
            experience,
            job_type,
            vacancies,
            status,
            created_at
        FROM jobs
        WHERE company_id = $1
        ORDER BY created_at DESC;
        `,
        [companyId]
    );

    return jobsResult.rows;

};

const updateJobService = async (
    jobId,
    ownerId,
    jobData
) => {

    const companyResult = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE owner_id = $1;
        `,
        [ownerId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const companyId = companyResult.rows[0].id;

    const jobResult = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1;
        `,
        [jobId]
    );

    if (jobResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Job not found."
        );
    }

    const job = jobResult.rows[0];

    if (job.company_id !== companyId) {
        throw new ApiError(
            403,
            "You are not authorized to update this job."
        );
    }

    const {
        title,
        description,
        requirements,
        location,
        salary,
        experience,
        job_type,
        vacancies,
        status
    } = jobData;

    const updatedJob = await pool.query(
        `
        UPDATE jobs
        SET
            title = $1,
            description = $2,
            requirements = $3,
            location = $4,
            salary = $5,
            experience = $6,
            job_type = $7,
            vacancies = $8,
            status = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
        `,
        [
            title,
            description,
            requirements,
            location,
            salary,
            experience,
            job_type,
            vacancies,
            status,
            jobId
        ]
    );

    return updatedJob.rows[0];

};

const deleteJobService = async (
    jobId,
    ownerId
) => {

    const companyResult = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE owner_id = $1;
        `,
        [ownerId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const companyId = companyResult.rows[0].id;

    const jobResult = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1;
        `,
        [jobId]
    );

    if (jobResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Job not found."
        );
    }

    const job = jobResult.rows[0];

    if (job.company_id !== companyId) {
        throw new ApiError(
            403,
            "You are not authorized to delete this job."
        );
    }

    await pool.query(
        `
        DELETE FROM jobs
        WHERE id = $1;
        `,
        [jobId]
    );

    return;

};

module.exports = {
    createJobService, getAllJobsService, getJobByIdService, getMyJobsService, updateJobService, deleteJobService
};
