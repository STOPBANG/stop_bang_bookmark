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

module.exports = router;