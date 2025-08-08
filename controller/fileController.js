const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { uploadFileToSpaces, deleteFileFromSpaces } = require("../utils/FileUploader");
const prisma = require("../prismaconfig");
const { error } = require("winston");

exports.GetAllPodcasts = catchAsync(async (req, res) => {
  try {
    const data = await prisma.podcast.findMany();
    // console.log("data", data)
    if (!data) {
      return errorResponse(res, "Podcasts not found", 404);
    }
    successResponse(res, "Podcasts Retrieved successfully", 200, data);
  } catch (error) {
    console.log("Podcast get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetAllPodcastswithFiles = catchAsync(async (req, res) => {
  try {
    const data = await prisma.podcast.findMany({
      include: {
        files: true, // Will include all associated files or empty array if none
      },
      orderBy: {
        createdAt: "asc", // Optional: latest first
      },
    });
    if (!data) {
      return errorResponse(res, "Podcasts not found", 404);
    }
    successResponse(res, "Podcasts Retrieved successfully", 200, data);
  } catch (error) {
    console.log("Podcast get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.PodcastsDetail = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "UUID is required", 400);
    }
    const data = await prisma.podcast.findUnique({
    where: {
      uuid: id,
    },
    include: {
      files: {
        orderBy: {
          createdAt: "asc", // Oldest first
        },
      },
    },
  });
    if (!data) {
      return errorResponse(res, "Podcasts not found", 404);
    }
    successResponse(res, "Podcasts Retrieved successfully", 200, data);
  } catch (error) {
    console.log("Podcast get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetAllFiles = catchAsync(async (req, res) => {
  try {
    const data = await prisma.files.findMany({
    include: {
      podcast: true, // Include related podcast info if needed
    },
    orderBy: {
      createdAt: 'desc', // Optional: sort newest first
    },
  });

    if (!data || data.length === 0) {
      return errorResponse(res, "Files not found", 404);
    }

    return successResponse(res, "Files retrieved successfully", 200, data);
  } catch (error) {
    console.error("File retrieval error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetFileByUUID = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "UUID is required", 400);
    }
    const file = await prisma.files.findUnique({
      where: { uuid:id },
      include: {
        podcast: true, // Include related podcast info if needed
      },
    });
    if (!file) {
      return errorResponse(res, "File not found", 404);
    }
    return successResponse(res, "File retrieved successfully", 200, file);
  } catch (error) {
    console.error("Get file error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.UploadCheck = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(500).json({ error: 'File toh bhej bhai' });
    }
    const fileKey = await uploadFileToSpaces(req.file);
    if (fileKey) {
      res.status(200).json({ fileKey });
    } else {
      res.status(500).json({ error: 'Upload failed' });
    }
  } catch (error) {
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});