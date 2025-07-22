const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { getFile, getAllFiles, getAllPodcasts, getAllPodcastswithFiles, getPodcastDetail, updatefiles, deletefiles } = require("../queries/fileQueries");
const { uploadFileToSpaces } = require("../utils/FileUploader");
const prisma = require("../prismaconfig");
const { error } = require("winston");

exports.AddPodcast = catchAsync(async (req, res) => {
  try {
    console.log("req.body",req.body);
    const { name, Author, Cast, description } = req.body;

    if (!name || !Author || !description) {
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
      description,
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
    console.log("data", data)
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
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "UUID is required", 400);
    }
    const data = await getPodcastDetail(id);
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
    const { title, description, podcastId } = req.body;
    if (!title || !description || !podcastId) {
      return errorResponse(res, "Title, description, and podcastId are required", 401);
    }
    // console.log("req.file",req.files);
    if (!req.files) {
      return errorResponse(res, "Video/audio file is required", 401);
    }
    const link = await uploadFileToSpaces(req.files.video[0]);
    let thumbnail = "";
    if (req.files?.thumbnail) {
      thumbnail = await uploadFileToSpaces(req.files.thumbnail[0]);
    }
    const fileData = {
      uuid: uuidv4(),
      title,
      description,
      duration: 6, 
      size: Number(req.body.size),
      thumbnail,
      link,
      podcastId: Number(podcastId),
    };

    const newFile = await prisma.files.create({ data: fileData });

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
    const { id } = req.params;
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


exports.UpdateFiles = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate ={};
    const { title, description } = req.body;
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (req.files?.thumbnail) {
      dataToUpdate.thumbnail = await uploadFileToSpaces(req.files.thumbnail[0]);
    }
    if (req.files?.video) {
      dataToUpdate.video = await uploadFileToSpaces(req.files.video[0]);
    }
    const data = await updatefiles(id, );
    if (!data) {
      return errorResponse(res, "File not found", 404);
    }
    successResponse(res, "File update successfully", 200, data);
  } catch (error) {
    console.log("All files get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});


exports.DeleteFiles = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deletefiles(id);
    if (!data) {
      return errorResponse(res, "File not found", 404);
    }
    successResponse(res, "File Delete successfully", 200);
  } catch (error) {
    console.log("All files get error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});