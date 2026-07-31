const pool = require("../database/db");
const ApiError = require("../utils/ApiError");




const createCompanyService = async (
    ownerId,
    companyData
) => {

    const {
        name,
        description,
        website,
        location
    } = companyData;

    if (!name || !location) {
        throw new ApiError(
            400,
            "Company name and location are required."
        );
    }

    const existingCompany = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE owner_id = $1
        `,
        [ownerId]
    );

    if (existingCompany.rows.length > 0) {
        throw new ApiError(
            409,
            "You have already created a company."
        );
    }

    const companyResult = await pool.query(
        `
        INSERT INTO companies
        (
            owner_id,
            name,
            description,
            website,
            location
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )
        RETURNING *;
        `,
        [
            ownerId,
            name,
            description,
            website,
            location
        ]
    );

    return companyResult.rows[0];

};


const getMyCompanyService = async (ownerId) => {

    if (!ownerId) {
        throw new ApiError(
            400,
            "Owner ID is required."
        );
    }

    const companyResult = await pool.query(
        `
        SELECT *
        FROM companies
        WHERE owner_id = $1
        `,
        [ownerId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    return companyResult.rows[0];

};


const updateCompanyService = async (
    companyId,
    ownerId,
    companyData
) => {

    const {
        name,
        description,
        website,
        location
    } = companyData;

    const companyResult = await pool.query(
        `
        SELECT *
        FROM companies
        WHERE id = $1
        `,
        [companyId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const company = companyResult.rows[0];

    if (company.owner_id !== ownerId) {
        throw new ApiError(
            403,
            "You are not authorized to update this company."
        );
    }

    const updatedCompanyResult = await pool.query(
        `
        UPDATE companies
        SET
            name = $1,
            description = $2,
            website = $3,
            location = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
        `,
        [
            name,
            description,
            website,
            location,
            companyId
        ]
    );

    return updatedCompanyResult.rows[0];

};

const uploadCompanyLogoService = async (
    companyId,
    ownerId,
    logoPath
) => {

    const companyResult = await pool.query(
        `
        SELECT *
        FROM companies
        WHERE id = $1
        `,
        [companyId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const company = companyResult.rows[0];

    if (company.owner_id !== ownerId) {
        throw new ApiError(
            403,
            "You are not authorized to update this company."
        );
    }

    const updatedCompanyResult = await pool.query(
        `
        UPDATE companies
        SET
            logo = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
        `,
        [
            logoPath,
            companyId
        ]
    );

    return updatedCompanyResult.rows[0];

};

const deleteCompanyService = async (
    companyId,
    ownerId
) => {

    const companyResult = await pool.query(
        `
        SELECT *
        FROM companies
        WHERE id = $1;
        `,
        [companyId]
    );

    if (companyResult.rows.length === 0) {
        throw new ApiError(
            404,
            "Company not found."
        );
    }

    const company = companyResult.rows[0];

    if (company.owner_id !== ownerId) {
        throw new ApiError(
            403,
            "You are not authorized to delete this company."
        );
    }

    await pool.query(
        `
        DELETE FROM companies
        WHERE id = $1;
        `,
        [companyId]
    );

    return;
};

module.exports={ createCompanyService,
    getMyCompanyService,
    updateCompanyService,
    uploadCompanyLogoService,
    deleteCompanyService
};