const { AddFile, AddPodcast, GetAllPodcasts, PodcastsDetail, UpdateFile, DeleteFile, GetAllPodcastswithFiles, UpdatePodcast, DeletePodcast, GetAllFiles, GetFileByUUID } = require("../controller/adminController");
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
router.get("/file/getAll", GetAllFiles);
router.get("/file/get/:id", GetFileByUUID);
    
router.post("/file/update/:id", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), UpdateFile);
router.delete("/file/delete/:id", verifyToken, DeleteFile);

module.exports = router;