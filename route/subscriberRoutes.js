const { AddSubscriber, SubscriberGet } = require("../controller/subscriberController");
const router =  require("express").Router();

router.post("/subscriber/add" ,  AddSubscriber);
router.get("/Subscriber/get" ,  SubscriberGet);

module.exports = router ;
