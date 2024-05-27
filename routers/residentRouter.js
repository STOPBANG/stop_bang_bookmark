const express = require("express");
const router = express.Router();

//Controllers
const residentController = require("../controllers/residentController.js");

router.use((req, res, next) => {
  console.log("Router for resident was started");
  next();
});

/* 열람 후기 관련 */
router.get("/openReview", residentController.myReview);

module.exports = router;
