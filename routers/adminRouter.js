const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../controllers/adminController.js");

router.use((req, res, next) => {
  console.log("Router for admin was started");
  next();
});

/* 신고 관련 */
router.get("/allReports", adminController.getReports);
router.get("/reports/confirm/:rvid/:reporter", adminController.getOneReport);
router.post("/report/reject", adminController.deleteReport);
router.post("/reports/deleted", adminController.deleteComment);

module.exports = router;
