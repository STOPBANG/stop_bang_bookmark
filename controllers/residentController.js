//Models
const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  // 자신이 열람한 후기 조회
    myReview: (req, res) => {
        /* msa */
        const user_id = req.headers.id;
        const getOptions = {
          host: 'stop_bang_sub_DB',
          port: process.env.MS_PORT,
          path: `/db/openedReview/findAllById/${user_id}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        };

        httpRequest(getOptions)
          .then(result => {
            console.log(result.body)
            if (result === null) {
              console.log("error occured: ", err);
            } else {
              res.json({
                openReviews: result.body,
                tagsData: tags,
                path: 'openreview'
              });
            }
          });
      },


};