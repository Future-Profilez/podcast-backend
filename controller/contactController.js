const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../prismaconfig");

exports.Addcontact = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return validationErrorResponse(res, "All fields are required", 401);
  }

  const existing = await prisma.contact.findUnique({ where: { email } });
  if (existing) {
    return validationErrorResponse(res, "This email has already been used", 409);
  }

  const record = await prisma.contact.create({
    data: { email, name, subject, message },
  });

  return successResponse(res, "Contact Added successfully!", 201, record);
});

exports.Getcontact = catchAsync(async (req, res) => {
    try {
        const records = await prisma.contact.findMany();
        return successResponse(res, "Contact Get successfully!", 201, records);
    } catch (error) {
        return errorResponse(res, error.message || "Internal Server Error", 500);
    }
})