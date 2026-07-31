const asyncHandler = require("../utils/asyncHandler");
const { createCompanyService,getMyCompanyService,updateCompanyService, uploadCompanyLogoService,deleteCompanyService} = require("../services/companyService");

const createCompany = asyncHandler(async (req, res) => {

    const ownerId = req.user.id;

    const companyData = req.body;

    const company = await createCompanyService(
        ownerId,
        companyData
    );

    res.status(201).json({
        success: true,
        message: "Company created successfully.",
        data: company
    });

});


const getMyCompany = asyncHandler(async (req, res) => {

    const ownerId = req.user.id;

    const company = await getMyCompanyService(ownerId);

    res.status(200).json({
        success: true,
        message: "Company fetched successfully.",
        data: company
    });

});


const updateCompany = asyncHandler(async (req, res) => {

    const companyId = Number(req.params.id);

    const ownerId = req.user.id;

    const updatedCompany = await updateCompanyService(
        companyId,
        ownerId,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Company updated successfully.",
        data: updatedCompany
    });

});




const uploadCompanyLogo = asyncHandler(async (req, res) => {

    const companyId = Number(req.params.id);

    const ownerId = req.user.id;

    if (!req.file) {
        throw new ApiError(
            400,
            "Logo file is required."
        );
    }

    const updatedCompany =
        await uploadCompanyLogoService(
            companyId,
            ownerId,
            req.file.path
        );

    res.status(200).json({
        success: true,
        message: "Company logo uploaded successfully.",
        data: updatedCompany
    });

});


const deleteCompany = asyncHandler(async (req, res) => {

    const companyId = Number(req.params.id);

    const ownerId = req.user.id;

    await deleteCompanyService(
        companyId,
        ownerId
    );

    res.status(200).json({
        success: true,
        message: "Company deleted successfully."
    });

});

module.exports = {
    createCompany,getMyCompany,updateCompany,uploadCompanyLogo,deleteCompany
};