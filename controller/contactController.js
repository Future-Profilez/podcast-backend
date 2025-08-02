const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../prismaconfig");

exports.Addcontact = catchAsync(async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return validationErrorResponse(res, "All fields are required", 401);
        }
        const records = await prisma.contact.create({data: { email ,name,message }},);

        return successResponse(res, "Contact Added successfully!", 201, records);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
})

exports.Getcontact = catchAsync(async (req, res) => {
    try {
        const records = await prisma.contact.findMany();
        return successResponse(res, "Contact Get successfully!", 201, records);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
})