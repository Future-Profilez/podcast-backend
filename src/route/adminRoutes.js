const { AddFile, AddPodcast, GetAllPodcasts, PodcastsDetail, GetAllPodcastswithFiles, UpdatePodcast, DeletePodcast, AddEpisode, GetEpisodeByUUID, GetAllEpisodes, UpdateEpisode, DeleteEpisode, DisablePodcast, AddGuide, UpdateGuide, GetAllGuides } = require("../controller/adminController");
const router = require("express").Router();
const { verifyToken } = require("../utils/tokenVerify");
const { upload, deleteFileFromSpaces } = require("../utils/FileUploader");

router.post("/admin/podcast/add", verifyToken, upload.single('thumbnail'), AddPodcast);
router.get("/admin/podcast/get", GetAllPodcasts);
router.get("/admin/podcast/get-detail/all", GetAllPodcastswithFiles);
router.get("/admin/podcast/get/:id", PodcastsDetail);
router.post("/admin/podcast/update/:id", verifyToken,  upload.single('thumbnail'), UpdatePodcast);
router.delete("/admin/podcast/delete/:id", verifyToken, DisablePodcast);

router.post("/admin/file/add", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), AddEpisode);
     
router.get("/admin/file/getAll", GetAllEpisodes);
router.get("/admin/file/get/:id", GetEpisodeByUUID);
    
router.post("/admin/file/update/:id", verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), UpdateEpisode);
router.delete("/admin/file/delete/:id", verifyToken, DeleteEpisode);

router.post("/admin/guide/add", verifyToken, upload.fields([
    { name: 'guide', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), AddGuide);
router.post("/admin/file/update/:id", verifyToken, upload.fields([
    { name: 'guide', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    ]), UpdateGuide);
router.get("/admin/guide/get", GetAllGuides);

module.exports = router;