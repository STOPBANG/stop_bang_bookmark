//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  updateBookmark: async (req, res) => {
    const r_id = req.body.r_id;

    // [start] 북마크 저장하기
    postOptions = {
      host: 'stop_bang_sub_feature_DB',
      port: process.env.PORT,
      path: `/db/bookmark/create`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    requestBody = {
      r_id: r_id,
      ra_regno: req.params.ra_regno
    }

    httpRequest(postOptions, requestBody)
    .then(result => {
      if (result === null) {
        console.log("error occured: ", err);
      } else {
        res.redirect(`/realtor/${req.params.ra_regno}`);
      }
    });
    // [end] 북마크 저장하기
  }
};