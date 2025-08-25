const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const { v4: uuidv4 } = require('uuid');
const catchAsync = require("../utils/catchAsync");
const { uploadFileToSpaces, deleteFileFromSpaces } = require("../utils/FileUploader");
const prisma = require("../prismaconfig");
const { error } = require("winston");
const { getMediaDurationFromBuffer } = require("../utils/mediaDuration");

exports.AddPodcast = catchAsync(async (req, res) => {
  try {
    const { name, author, cast, description, email, language } = req.body;

    if (!name || !description) {
      return errorResponse(res, "Name and description are required", 401);
    }

    if (!req.file) {
      return errorResponse(res, "Thumbnail is required", 401);
    }

    // Upload thumbnail file to Spaces or wherever
    const thumbnailKey = await uploadFileToSpaces(req.file);

    // Build podcast data object
    const podcastData = {
      uuid: uuidv4(),
      name,
      thumbnail: thumbnailKey,
      description,
      author: author || undefined,  // Optional; Prisma default will apply if undefined
      email: email || undefined,
      language: language ? (typeof language === "string" ? JSON.parse(language) : language) : undefined,
      cast: undefined, // will be set below if valid
    };

    if (cast) {
      try {
        const castArray = typeof cast === "string" ? JSON.parse(cast) : cast;
        if (!Array.isArray(castArray)) {
          return errorResponse(res, "Cast must be an array of strings", 400);
        }
        podcastData.cast = castArray;
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
    const data = await prisma.podcast.findMany()
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
        episodes: true,
      },
      orderBy: {
        createdAt: "asc",
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
        episodes: {
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

exports.UpdatePodcast = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, author, cast, email, language } = req.body;
    // console.log("language", language);
    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (author !== undefined) dataToUpdate.author = author;
    if (email !== undefined) dataToUpdate.email = email;
    if (language !== undefined) {
      try {
        dataToUpdate.language =
          typeof language === "string" ? JSON.parse(language) : language;
        if (!Array.isArray(dataToUpdate.language)) {
          return errorResponse(res, "language must be an array of strings", 400);
        }
      } catch {
        return errorResponse(res, "Invalid language format. Must be JSON array.", 400);
      }
    }

    if (cast !== undefined) {
      try {
        const castArray = typeof cast === "string" ? JSON.parse(cast) : cast;
        if (!Array.isArray(castArray)) {
          return errorResponse(res, "Cast must be an array of strings", 400);
        }
        dataToUpdate.cast = castArray;
      } catch {
        return errorResponse(res, "Invalid cast format. Must be JSON array.", 400);
      }
    }
    // console.log("datatoupdate", dataToUpdate);

    // Fetch existing podcast
    const existingPodcast = await prisma.podcast.findUnique({
      where: { uuid: id },
    });

    if (!existingPodcast) {
      return errorResponse(res, "Podcast not found", 404);
    }

    // Handle thumbnail update
    if (req.file) {
      const isDeleted = await deleteFileFromSpaces(existingPodcast.thumbnail);
      if (!isDeleted) {
        return errorResponse(res, "Unable to delete old thumbnail", 500);
      }
      const newThumbnailKey = await uploadFileToSpaces(req.file);
      dataToUpdate.thumbnail = newThumbnailKey;
    }

    // Update in DB
    const updated = await prisma.podcast.update({
      where: { uuid: id },
      data: dataToUpdate,
    });

    return successResponse(res, "Podcast updated successfully", 200, updated);
  } catch (error) {
    console.error("UpdatePodcast error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.DisablePodcast = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch podcast and its episodes
    const podcast = await prisma.podcast.findUnique({
      where: { uuid: id },
      include: { episodes: true },
    });

    if (!podcast) {
      return errorResponse(res, "Podcast not found", 404);
    }

    // Determine the new isDeleted state (toggle)
    const newIsDeletedState = !podcast.isDeleted;

    // Update episodes
    await prisma.episode.updateMany({
      where: { podcastId: podcast.id },
      data: { isDeleted: newIsDeletedState },
    });

    // Update podcast
    const updatedPodcast = await prisma.podcast.update({
      where: { uuid: id },
      data: { isDeleted: newIsDeletedState },
    });

    const action = newIsDeletedState ? "disabled" : "enabled";

    return successResponse(
      res,
      `Podcast and episodes ${action} successfully`,
      200,
      updatedPodcast
    );
  } catch (error) {
    console.error("DisablePodcast error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.AddEpisode = catchAsync(async (req, res) => {
  try {
    const { title, description, podcastId, durationInSec, mimefield, duration } = req.body;

    if (!title || !description || !podcastId) {
      return errorResponse(res, "Title, description, and podcastId are required", 401);
    }

    if (!req.files || !req.files.video) {
      return errorResponse(res, "Video/audio file is required", 401);
    }

    // Upload media file
    const link = await uploadFileToSpaces(req.files.video[0]);

    // Upload thumbnail if provided
    let thumbnail = "";
    if (req.files.thumbnail) {
      thumbnail = await uploadFileToSpaces(req.files.thumbnail[0]);
    }

    // const mediaduration = await getMediaDurationFromBuffer(req.files.video[0].buffer);
    // console.log("Media duration (seconds):", mediaduration);
   const mediaduration = await getMediaDurationFromBuffer(
      req.files.video[0].buffer,
      req.files.video[0].originalname
    );
    console.log("Duration (seconds):", mediaduration);


    const episodeData = {
      uuid: uuidv4(),
      title,
      description,
      duration:  mediaduration ? Number((mediaduration / 60).toFixed(2)) : 0,
      durationInSec: mediaduration ? Number(mediaduration.toFixed(2)) : 0,
      mimefield: mimefield || "",
      size: req.body.size ? Number(req.body.size) : null,
      thumbnail,
      link,
      podcastId: Number(podcastId),
    };

    const newEpisode = await prisma.episode.create({ data: episodeData });

    return successResponse(res, "Episode uploaded successfully", 201, newEpisode);
  } catch (error) {
    console.error("Error in AddEpisode:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.GetAllEpisodes = catchAsync(async (req, res) => {
  try {
    const data = await prisma.episode.findMany({
      include: {
        podcast: true,
      },
      orderBy: {
        createdAt: 'desc',
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

exports.GetEpisodeByUUID = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "UUID is required", 400);
    }
    const file = await prisma.episode.findUnique({
      where: { uuid: id },
      include: {
        podcast: true,
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

exports.UpdateEpisode = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = {};
    const { title, description, duration, durationInSec, mimefield, size } = req.body;

    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (duration !== undefined) dataToUpdate.duration = Number(duration);
    if (durationInSec !== undefined) dataToUpdate.durationInSec = Number(durationInSec);
    if (mimefield !== undefined) dataToUpdate.mimefield = mimefield;
    if (size !== undefined) dataToUpdate.size = Number(size);

    const existingData = await prisma.episode.findUnique({
      where: { uuid: id },
    });

    if (!existingData) {
      return errorResponse(res, "Episode not found", 404);
    }

    // Handle thumbnail update
    if (req.files?.thumbnail?.[0]) {
      const isDeleted = await deleteFileFromSpaces(existingData.thumbnail);
      if (!isDeleted) {
        return errorResponse(res, "Unable to delete old thumbnail", 500);
      }
      const fileKey = await uploadFileToSpaces(req.files.thumbnail[0]);
      dataToUpdate.thumbnail = fileKey;
    }

    // Handle video (link) update
    if (req.files?.video?.[0]) {
      const isDeleted = await deleteFileFromSpaces(existingData.link);
      if (!isDeleted) {
        return errorResponse(res, "Unable to delete old video", 500);
      }
      const fileKey = await uploadFileToSpaces(req.files.video[0]);
      dataToUpdate.link = fileKey;
    }

    const updatedEpisode = await prisma.episode.update({
      where: { uuid: id },
      data: dataToUpdate,
    });

    return successResponse(res, "Episode updated successfully", 200, updatedEpisode);
  } catch (error) {
    console.error("UpdateEpisode error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.DeleteEpisode = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await prisma.episode.findUnique({
      where: { uuid: id },
    });

    if (!episode) {
      return errorResponse(res, "Episode not found", 404);
    }

    const newIsDeletedState = !episode.isDeleted

    await prisma.episode.update({
      where: { uuid: id },
      data: { isDeleted: newIsDeletedState },
    });

    return successResponse(res, "Episode soft-deleted successfully", 200);
  } catch (error) {
    console.error("DeleteEpisode error:", error);
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