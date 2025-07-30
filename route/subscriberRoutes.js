const { AddSubscriber, SubscriberGet } = require("../controller/SubscriberController");
const Router =  require("express").Router();

Router.post("/subscriber/add" ,  AddSubscriber);
Router.get("/subscriber/get" ,  SubscriberGet);

module.exports = Router ;
