//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");

module.exports = {
  updateBookmark: (req, res) => {
    if (req.cookies.authToken == undefined)
      res.render("notFound.ejs", { message: "로그인이 필요합니다" });
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      const r_username = decoded.userId;
      if (r_username === null)
        res.render("notFound.ejs", { message: "로그인이 필요합니다" });
      else {
        let body = {
          r_username: r_username,
          raRegno: req.params.ra_regno,
          isBookmark: req.body.bookmarkData,
        };
        realtorModel.updateBookmark(r_username, body, (result, err) => {
          if (result === null) {
            console.log("error occured: ", err);
          } else {
            console.log(result);
            res.redirect(`/realtor/${req.params.ra_regno}`);
          }
        });
      }
    }
  }
};