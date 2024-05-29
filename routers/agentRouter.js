const express = require("express");
const router = express.Router();

//Controllers
const agentController = require("../controllers/agentController.js");

router.use((req, res, next) => {
  console.log("Router for agent was started");
  next();
});

// 후기 신고
router.post('/report', agentController.reporting);

// 후기별 공인중개사 신고 여부 확인
router.get('/isReported/:a_username', agentController.isReported);

module.exports = router;
