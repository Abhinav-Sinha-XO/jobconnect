const pool = require("../database/db");

const ApiError = require("../utils/ApiError");

const applyJobService = async (
    jobId,
    candidateId
) => {

    const jobResult = await pool.query(
        `
        SELECT id
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

    const existingApplication =
        await pool.query(
            `
            SELECT id
            FROM applications
            WHERE
                candidate_id = $1
            AND
                job_id = $2;
            `,
            [
                candidateId,
                jobId
            ]
        );

    if (
        existingApplication.rows.length > 0
    ) {

        throw new ApiError(
            400,
            "You have already applied for this job."
        );

    }

    const result = await pool.query(
        `
        INSERT INTO applications
        (
            candidate_id,
            job_id
        )
        VALUES
        (
            $1,
            $2
        )
        RETURNING *;
        `,
        [
            candidateId,
            jobId
        ]
    );

    return result.rows[0];

};

const getMyApplicationsService = async (
    candidateId
) => {

    const result = await pool.query(
        `
        SELECT

            a.id AS application_id,

            a.status,

            a.applied_at,

            j.id AS job_id,

            j.title,

            j.location,

            j.salary,

            j.job_type,

            c.id AS company_id,

            c.name AS company_name,

            c.logo AS company_logo

        FROM applications a

        JOIN jobs j

            ON a.job_id = j.id

        JOIN companies c

            ON j.company_id = c.id

        WHERE

            a.candidate_id = $1

        ORDER BY

            a.applied_at DESC;
        `,
        [
            candidateId
        ]
    );

    return result.rows;

};

const getApplicationsForJobService = async (
    jobId,
    recruiterId
) => {

    const jobResult = await pool.query(
    `
    SELECT
        j.id
    FROM jobs j

    JOIN companies c
        ON j.company_id = c.id

    WHERE
        j.id = $1
    AND
        c.owner_id = $2;
    `,
    [
        jobId,
        recruiterId
    ]
);

    if (jobResult.rows.length === 0) {

        throw new ApiError(
            404,
            "Job not found or you are not authorized to view its applications."
        );

    }

    const result = await pool.query(
    `
    SELECT

        a.id AS application_id,

        a.status,

        a.applied_at,

        u.id AS candidate_id,

        u.name AS candidate_name,

        u.email,

        j.id AS job_id,

        j.title

    FROM applications a

    JOIN users u
        ON a.candidate_id = u.id

    JOIN jobs j
        ON a.job_id = j.id

    WHERE
        a.job_id = $1

    ORDER BY
        a.applied_at DESC;
    `,
    [jobId]
);

    return result.rows;

};




const updateApplicationStatusService = async (
    applicationId,
    recruiterId,
    status
) => {

    const allowedStatuses = [
    "pending",
    "shortlisted",
    "accepted",
    "rejected"
];

    const normalizedStatus =
    status.trim().toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {

        throw new ApiError(
            400,
            "Invalid application status."
        );

    }

    const applicationResult = await pool.query(
        `
        SELECT

            a.id

        FROM applications a

        JOIN jobs j
            ON a.job_id = j.id

        JOIN companies c
            ON j.company_id = c.id

        WHERE

            a.id = $1

        AND

            c.owner_id = $2;
        `,
        [
            applicationId,
            recruiterId
        ]
    );

    if (applicationResult.rows.length === 0) {

        throw new ApiError(
            404,
            "Application not found or you are not authorized to update it."
        );

    }

    const result = await pool.query(
        `
        UPDATE applications

        SET

            status = $1,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            id = $2

        RETURNING *;
        `,
        [
            status,
            applicationId
        ]
    );

    return result.rows[0];

};


const withdrawApplicationService = async (
    applicationId,
    candidateId
) => {

    const applicationResult = await pool.query(
        `
        SELECT
            id
        FROM applications
        WHERE
            id = $1
        AND
            candidate_id = $2;
        `,
        [
            applicationId,
            candidateId
        ]
    );

    if (applicationResult.rows.length === 0) {

        throw new ApiError(
            404,
            "Application not found or you are not authorized to withdraw it."
        );

    }

    await pool.query(
        `
        DELETE FROM applications
        WHERE id = $1;
        `,
        [
            applicationId
        ]
    );

};



module.exports = {
     applyJobService,
     getMyApplicationsService,
     getApplicationsForJobService,  
     updateApplicationStatusService,
     withdrawApplicationService
};