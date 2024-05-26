const express = require("express");
const router = express.Router();

//Controllers
const realtorController = require("../controllers/realtorController.js");

router.use((req, res, next) => {
  console.log("Router for bookmark was started");
  next();
});

/* 북마크 관련 */
router.post("/:sys_regno/bookmark", realtorController.updateBookmark);

module.exports = router;
