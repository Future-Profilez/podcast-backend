const { AddSubscriber, SubscriberGet } = require("../controller/SubscriberController");
const router =  require("express").Router();

router.post("/subscriber/add" ,  AddSubscriber);
router.get("/Subscriber/get" ,  SubscriberGet);

module.exports = router ;
