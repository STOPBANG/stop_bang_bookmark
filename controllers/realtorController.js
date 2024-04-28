//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  updateBookmark: async (req, res) => {
    const r_username = req.body.userId;
        
    // [start] 로그인 계정 r_id 가져오기
    getOptions = {
      host: 'stop_bang_auth_DB',
      port: process.env.PORT,
      path: `/db/resident/findById`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    let requestBody = {username: r_username};
    result = await httpRequest(getOptions, requestBody);
    const r_id = result.body[0].r_id;
    console.log(r_id);
    // [end] 로그인 계정 정보 가져오기

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