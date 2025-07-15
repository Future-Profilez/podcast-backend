const { AddFile } = require("../controller/fileController");
const router = require("express").Router();

router.post("/file/add", AddFile);
router.get("/file/get", AddFile);
router.get("/file/getbyId/:id", AddFile);

module.exports = router;