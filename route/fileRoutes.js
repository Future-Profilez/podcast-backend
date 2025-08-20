const { GetAllPodcasts, PodcastsDetail, UploadCheck, GetAllPodcastswithFiles, GetAllFiles, GetFileByUUID } = require("../controller/fileController");
const router = require("express").Router();
const { upload } = require("../utils/FileUploader");

router.get("/podcast/get", GetAllPodcasts);
router.get("/podcast/get-detail/all", GetAllPodcastswithFiles);
router.get("/podcast/get/:id", PodcastsDetail);

router.get("/file/getAll", GetAllFiles);
router.get("/file/get/:id", GetFileByUUID);

// Test Route for upload checking
router.post("/test/upload", upload.single('file'), UploadCheck);




module.exports = router;