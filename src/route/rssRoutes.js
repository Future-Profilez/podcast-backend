const { getpodcastLists } = require("../controller/rssController");
const { verifyToken } = require("../utils/tokenVerify");
const router = require("express").Router();
router.get("/rss/:type/podcasts/:podcastId", getpodcastLists);
module.exports = router;