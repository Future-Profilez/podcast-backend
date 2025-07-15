const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { createFile, getFile, getAllFiles } = require("../queries/fileQueries");

exports.AddFile = catchAsync(async (req, res) => {
  try {
    const { name } = req.body;
    if ( !name ) {
      return errorResponse(res, "All fields are required", 401);
    }
    req.body.uuid=uuidv4();
    const data = await createFile(req.body);
    if (!data || !data.length) {
    return errorResponse(res, "Unable to create file", 500);
    }
    successResponse(res, "Teacher created successfully!", 201, data[0]);
  } catch (error) {
    console.log("error in add files", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetAllFiles = catchAsync(async (req, res) => {
  try {
    const data = await getAllFiles();
    if (!data) {
      return errorResponse(res, "Files not found", 404);
    }
    successResponse(res, "Files Retrieved successfully", 200, data);
  } catch (error) {
    console.log("All files get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetFile = catchAsync(async (req, res) => {
  try {
    const {id}= req.params;
    const data = await getFile(id);
    if (!data) {
      return errorResponse(res, "File not found", 404);
    }
    successResponse(res, "File Retrieved successfully", 200, data);
  } catch (error) {
    console.log("All files get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});