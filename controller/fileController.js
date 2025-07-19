const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { getFile, getAllFiles, getAllPodcasts, getAllPodcastswithFiles, getPodcastDetail } = require("../queries/fileQueries");
const { uploadFileToSpaces } = require("../utils/FileUploader");
const prisma = require("../prismaconfig");
const { error } = require("winston");

exports.AddPodcast = catchAsync(async (req, res) => {
  try {
    const { name, Author, Cast } = req.body;

    if (!name) {
      return errorResponse(res, "Name is required", 401);
    }

    if (!req.file) {
      return errorResponse(res, "Thumbnail is required", 401);
    }

    const thumbnailKey = await uploadFileToSpaces(req.file);
    const podcastData = {
      uuid: uuidv4(),
      name,
      thumbnail: thumbnailKey,
    };
    if (Author) podcastData.Author = Author;
    if (Cast) {
      try {
        const castArray = typeof Cast === "string" ? JSON.parse(Cast) : Cast;
        if (!Array.isArray(castArray)) {
          return errorResponse(res, "Cast must be an array of strings", 400);
        }
        podcastData.Cast = castArray;
      } catch {
        return errorResponse(res, "Invalid Cast format. Must be a JSON array.", 400);
      }
    }
    const newPodcast = await prisma.podcast.create({ data: podcastData });
    return successResponse(res, "Podcast created successfully!", 201, newPodcast);
  } catch (error) {
    console.error("Error in AddPodcast:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetAllPodcasts = catchAsync(async (req, res) => {
  try {
    const data = await getAllPodcasts();
    console.log("data" ,data)
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
    const data = await getAllPodcastswithFiles();
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
    const { uuid } = req.params;
    if(!uuid){
      return errorResponse(res, "UUID is required", 400);
    }
    const data = await getPodcastDetail(uuid);
    if (!data) {
      return errorResponse(res, "Podcasts not found", 404);
    }
    successResponse(res, "Podcasts Retrieved successfully", 200, data);
  } catch (error) {
    console.log("Podcast get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.AddFile = catchAsync(async (req, res) => {
  try {
    const { title, duration, size, podcastId } = req.body;
    if (!title || !duration || !podcastId) {
      return errorResponse(res, "Title, duration, and podcastId are required", 401);
    }
    if (!req.file) {
      return errorResponse(res, "Audio file is required", 401);
    }
    const link = await uploadFileToSpaces(req.file);
    const fileData = {
      uuid: uuidv4(),
      title,
      duration: Number(duration),
      size: size ? Number(size) : null,
      link,
      podcastId: Number(podcastId),
    };
    const newFile = await prisma.files.create({data: fileData});
    return successResponse(res, "File uploaded successfully", 201, newFile);
  } catch (error) {
    console.error("Error in AddFile:", error);
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