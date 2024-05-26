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
    result = await httpRequest(postOptions, requestBody);
    const r_id = result.body[0].id;
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
       if(getBookmarkResult.length){ // 북마크가 있으면
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
        httpRequest(postOptions, bookmarkDeleteRequestBody)
        .then(result => {
          if (result === null) {
            console.log("error occured: ", err);
          } else {
            return res.redirect(`/realtor/${req.params.sys_regno}`);
          }
        });
        // [end] 북마크 삭제
      }
      else{ // 북마크가 없으면 추가
        // [start] 북마크 추가
        console.log(req.params.sys_regno);
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
            return res.redirect(`/realtor/${req.params.sys_regno}`);
          }
        });
        // [end] 북마크 추가
      }
    })
  }  
};