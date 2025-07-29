const { signup, login, GetUser, Dashboard } = require("../controller/userController");
const { verifyToken } = require("../utils/tokenVerify");

const router = require("express").Router();

router.post("/user/register", signup);
router.post("/user/login", login);
router.get("/user/profile", verifyToken, GetUser);
router.get("/user/dashboard", verifyToken, Dashboard);

module.exports = router;