const { subscriberadd, subscriberget } = require("../queries/subscriberQueries");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse } = require("../utils/ErrorHandling");


exports.AddSubscriber = catchAsync(async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return validationErrorResponse(res, "All fields are required", 401);
        }
        const record = await subscriberadd(email);
        return successResponse(res, "Subscriber Added successfully!", 201, record);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }

})

exports.SubscriberGet = catchAsync(async (req, res) => {
    try {
        const record = await subscriberget();
        successResponse(res, "Subscriber Get successfully!", 201, record);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
})