const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../prismaconfig");

exports.AddSubscriber = catchAsync(async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return validationErrorResponse(res, "Email is required", 401);
        }
        const existing = await prisma.subscriber.findUnique({
            where: { email },
        });
        if (existing) {
            return validationErrorResponse(res, "You are already subscribed!", 409);
        }
        const record = await prisma.subscriber.create({
            data: { email },
        });
        return successResponse(res, "Subscriber added successfully!", 201, record);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
});

exports.SubscriberGet = catchAsync(async (req, res) => {
    try {
        const record = await prisma.subscriber.findMany();
        successResponse(res, "Subscriber Get successfully!", 201, record);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
})