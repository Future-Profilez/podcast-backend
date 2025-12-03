const { getpodcastLists } = require("../controller/rssController");
const { verifyToken } = require("../utils/tokenVerify");
const router = require("express").Router();

router.get("/rss/podcasts", getpodcastLists);

module.exports = router;