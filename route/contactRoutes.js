const { Addcontact, Getcontact } = require("../controller/contactController");

const router = require("express").Router();

router.post("/contact/add", Addcontact);

router.get("/contact", Getcontact)

module.exports = router;