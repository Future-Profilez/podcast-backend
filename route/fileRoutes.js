const { AddFile, AddPodcast, GetAllPodcasts, PodcastsDetail, UploadCheck, UpdateFile, DeleteFile, GetAllPodcastswithFiles, UpdatePodcast, DeletePodcast } = require("../controller/fileController");
const router = require("express").Router();
const { verifyToken } = require("../utils/tokenVerify");
const { upload } = require("../utils/FileUploader");

router.post("/podcast/add", verifyToken, upload.single('thumbnail'), AddPodcast);
router.get("/podcast/get", GetAllPodcasts);
router.get("/podcast/get-detail/all", GetAllPodcastswithFiles);
router.get("/podcast/get/:id", PodcastsDetail);
router.post("/podcast/update/:id", verifyToken,  upload.single('thumbnail'), UpdatePodcast);
router.delete("/podcast/delete/:id", verifyToken, DeletePodcast);

router.post("/file/add", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), AddFile);
router.post("/file/update/:id", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), UpdateFile);
router.delete("/file/delete/:id", verifyToken, DeleteFile);


// Test Route for upload checking
router.post("/test/upload", upload.single('file'), UploadCheck);

module.exports = router;