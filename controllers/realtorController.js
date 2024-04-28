//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  updateBookmark: (req, res) => {
    const r_username = req.body.userId;
    // [start] 북마크 저장하기
    postOptions = {
      host: 'stop_bang_sub_feature_DB',
      port: process.env.PORT,
      path: `/db/bookmark/update`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const requestBody = {
      r_username: r_username,
      raRegno: req.params.ra_regno
    }

    httpRequest(postOptions, requestBody)
    .then(result => {
      if (result === null) {
        console.log("error occured: ", err);
      } else {
        res.redirect(`/realtor/${req.params.ra_regno}`);
      }
    });
  }
};