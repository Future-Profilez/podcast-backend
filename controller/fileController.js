const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { getAllPodcasts, getAllPodcastswithFiles, getPodcastDetail, updatefiles, deletefile } = require("../queries/fileQueries");
const { uploadFileToSpaces, deleteFileFromSpaces } = require("../utils/FileUploader");
const prisma = require("../prismaconfig");
const { error } = require("winston");

exports.AddPodcast = catchAsync(async (req, res) => {
  try {
    // console.log("req.body",req.body);
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

exports.UpdatePodcast = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, Author, Cast } = req.body;
    const dataToUpdate = {};

    // Populate update object
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (Author !== undefined) dataToUpdate.Author = Author;
    if (Cast) {
      // Cast is expected as a JSON string like '["Person1", "Person2"]'
      try {
        const parsedCast = JSON.parse(Cast);
        if (Array.isArray(parsedCast)) {
          dataToUpdate.Cast = parsedCast;
        }
      } catch (e) {
        return errorResponse(res, "Invalid format for Cast. Must be a JSON array.", 400);
      }
    }

    // Fetch existing podcast
    const existingPodcast = await prisma.podcast.findUnique({
      where: { uuid: id },
    });

    if (!existingPodcast) {
      return errorResponse(res, "Podcast not found", 404);
    }

    // Handle thumbnail update
    if (req.files?.thumbnail?.[0]) {
      const isDeleted = await deleteFileFromSpaces(existingPodcast.thumbnail);
      if (!isDeleted) {
        return errorResponse(res, "Unable to delete old thumbnail", 500);
      }

      const newThumbnailKey = await uploadFileToSpaces(req.files.thumbnail[0]);
      dataToUpdate.thumbnail = newThumbnailKey;
    }

    // Update in DB
    const updated = await prisma.podcast.update({
      where: { uuid: id },
      data: dataToUpdate,
    });

    successResponse(res, "Podcast updated successfully", 200, updated);
  } catch (error) {
    console.log("UpdatePodcast error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.DeletePodcast = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch podcast by UUID
    const podcast = await prisma.podcast.findUnique({
      where: { uuid: id },
      include: { files: true }, // Include related files (optional, useful if you want to delete them too)
    });

    if (!podcast) {
      return errorResponse(res, "Podcast not found", 404);
    }

    // Step 2: Delete thumbnail from cloud
    if (podcast.thumbnail) {
      const deleted = await deleteFileFromSpaces(podcast.thumbnail);
      if (!deleted) {
        return errorResponse(res, "Failed to delete thumbnail from storage", 500);
      }
    }

    // Optional: Step 3 - Delete associated files and their media from Spaces
    for (const file of podcast.files) {
      if (file.thumbnail) {
        await deleteFileFromSpaces(file.thumbnail);
      }
      if (file.link) {
        await deleteFileFromSpaces(file.link);
      }

      // Delete file record from DB
      await prisma.files.delete({
        where: { uuid: file.uuid },
      });
    }

    // Step 4: Delete podcast entry
    await prisma.podcast.delete({
      where: { uuid: id },
    });

    successResponse(res, "Podcast deleted successfully", 200);
  } catch (error) {
    console.log("DeletePodcast error:", error);
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

exports.UpdateFile = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = {};
    const { title, description } = req.body;

    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;

    const existingData = await prisma.files.findUnique({
      where: { uuid: id },
    });

    if (!existingData) {
      return errorResponse(res, "File not found", 404);
    }

    // Handle thumbnail update
    if (req.files?.thumbnail?.[0]) {
      const isDeleted = await deleteFileFromSpaces(existingData.thumbnail);
      if (!isDeleted) {
        return res.status(500).json({
          status: false,
          message: "Unable to delete old thumbnail",
        });
      }
      const fileKey = await uploadFileToSpaces(req.files.thumbnail[0]);
      dataToUpdate.thumbnail = fileKey;
    }

    // Handle video (link) update
    if (req.files?.video?.[0]) {
      const isDeleted = await deleteFileFromSpaces(existingData.link);
      if (!isDeleted) {
        return res.status(500).json({
          status: false,
          message: "Unable to delete old video",
        });
      }
      const fileKey = await uploadFileToSpaces(req.files.video[0]);
      dataToUpdate.link = fileKey;
    }

    const data = await updatefiles(id, dataToUpdate);

    if (!data) {
      return errorResponse(res, "File not found", 404);
    }

    successResponse(res, "File updated successfully", 200, data);
  } catch (error) {
    console.log("UpdateFiles error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.DeleteFile = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.files.findUnique({
      where: { uuid: id },
    });

    if (!file) {
      return errorResponse(res, "File not found", 404);
    }

    if (file.thumbnail) {
      const thumbnailDeleted = await deleteFileFromSpaces(file.thumbnail);
      if (!thumbnailDeleted) {
        return errorResponse(res, "Failed to delete thumbnail from storage", 500);
      }
    }

    if (file.link) {
      const videoDeleted = await deleteFileFromSpaces(file.link);
      if (!videoDeleted) {
        return errorResponse(res, "Failed to delete video from storage", 500);
      }
    }

    await deletefile(id);

    successResponse(res, "File deleted successfully", 200);
  } catch (error) {
    console.log("DeleteFile error:", error);
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