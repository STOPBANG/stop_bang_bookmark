//Models
const e = require("express");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  updateBookmark: async (req, res) => {
    const r_username = req.body.r_username;
    const sys_regno = req.params.sys_regno;

    // [start] 로그인 계정 r_id 가져오기
    postOptions = {
      host: 'stop_bang_auth_DB',
      port: process.env.PORT,
      path: `/db/resident/findById`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    let requestBody = {username: r_username};
    httpRequest(postOptions, requestBody)
    .then(getBookmarkResult => {
      const r_id = getBookmarkResult.body[0].id;
      // [end] 로그인 계정 정보 가져오기

      // [start] 북마크 조회
      const getBookmarkOptions = {
        host: 'stop_bang_sub_DB',
        port: process.env.PORT,
        path: `/db/bookmark/findALLByIdnRegno/${r_id}/${sys_regno}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
      httpRequest(getBookmarkOptions)
      .then(getBookmarkResult => {
        // [end] 북마크 조회
        if(getBookmarkResult.body[0] != undefined){
          // [start] 북마크 삭제
          postBookmarkDeleteOptions = {
            host: 'stop_bang_sub_DB',
            port: process.env.PORT,
            path: `/db/bookmark/delete`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          }
          bookmarkDeleteRequestBody = {
            r_id: r_id,
            sys_regno: req.params.sys_regno
          }
          httpRequest(postBookmarkDeleteOptions, bookmarkDeleteRequestBody)
          .then(result => {
            if (result === null) {
              console.log("error occured: ", err);
            } else {
              return res.json(result);
            }
          });
          // [end] 북마크 삭제
        }
        else{
          // [start] 북마크 추가
          postBookmarkCreateOptions = {
            host: 'stop_bang_sub_DB',
            port: process.env.PORT,
            path: `/db/bookmark/create`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          }
          bookmarkCreateRequestBody = {
            r_id: r_id,
            sys_regno: req.params.sys_regno
          }
      
          httpRequest(postBookmarkCreateOptions, bookmarkCreateRequestBody)
          .then(result => {
            if (result === null) {
              console.log("error occured: ", err);
            } else {
              return res.json(result);
            }
          });
          // [end] 북마크 추가
        }
      })
    })
  }  
};