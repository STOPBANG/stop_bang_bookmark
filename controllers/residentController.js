//Models
const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
    myReview: (req, res) => {
        /* msa */
        const getOptions = {
          host: 'stop_bang_resident_mypage',
          port: process.env.MS_PORT,
          path: '/myReview',
          method: 'GET',
          headers: {
            ...
            req.headers,
            auth: res.locals.auth
          }
        }
        const forwardRequest = http.request(
          getOptions,
          forwardResponse => {
            let data = '';
            forwardResponse.on('data', chunk => {
              data += chunk;
            });
            forwardResponse.on('end', () => {
              return res.render("resident/myReview", JSON.parse(data));
            });
          }
        );
        forwardRequest.on('close', () => {
          console.log('Sent [myReview] message to resident_mypage microservice.');
        });
        forwardRequest.on('error', (err) => {
          console.log('Failed to send [myReview] message');
          console.log(err && err.stack || err);
        });
        req.pipe(forwardRequest);
      },
      openReview: (req, res) => {
        /* msa */
        const getOptions = {
          host: 'stop_bang_resident_mypage',
          port: process.env.MS_PORT,
          path: '/openreview',
          method: 'GET',
          headers: {
            ...
            req.headers,
            auth: res.locals.auth
          }
        }
        const forwardRequest = http.request(
          getOptions,
          forwardResponse => {
            let data = '';
            forwardResponse.on('data', chunk => {
              data += chunk;
            });
            forwardResponse.on('end', () => {
              return res.render("resident/openReview", JSON.parse(data));
            });
          }
        );
        forwardRequest.on('close', () => {
          console.log('Sent [openreview] message to resident_mypage microservice.');
        });
        forwardRequest.on('error', (err) => {
          console.log('Failed to send [openreview] message');
          console.log(err && err.stack || err);
        });
        req.pipe(forwardRequest);
      },


};