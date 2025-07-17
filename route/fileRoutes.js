const { AddFile, AddPodcast, GetAllPodcasts } = require("../controller/fileController");
const router = require("express").Router();
const { verifyToken } = require("../utils/tokenVerify");
const { upload } = require("../utils/FileUploader");

router.post("/podcast/add", verifyToken, upload.single('thumbnail'), AddPodcast);
router.get("/podcast/get", GetAllPodcasts);
router.post("/file/add", verifyToken, upload.single('file'), AddFile);
router.get("/file/get", AddFile);
router.get("/file/getbyId/:id", AddFile);

module.exports = router;