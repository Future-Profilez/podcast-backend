const { AddFile, AddPodcast, GetAllPodcasts, PodcastsDetail } = require("../controller/fileController");
const router = require("express").Router();
const { verifyToken } = require("../utils/tokenVerify");
const { upload } = require("../utils/FileUploader");

router.post("/podcast/add", verifyToken, upload.single('thumbnail'), AddPodcast);
router.get("/podcast/get", GetAllPodcasts);
router.get("/podcast/get/:id", PodcastsDetail);
router.post("/file/add", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), AddFile);
router.get("/file/get", AddFile);
router.get("/file/getbyId/:id", AddFile);

module.exports = router;