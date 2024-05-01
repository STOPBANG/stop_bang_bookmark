//Models
const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
    reporting: async (req, res) => {
        //쿠키로부터 로그인 계정 알아오기
        if (req.cookies.authToken == undefined) 
            res.render('notFound.ejs', {message: "로그인이 필요합니다"});
        else {
            const decoded = jwt.verify(
                req.cookies.authToken,
                process.env.JWT_SECRET_KEY
            );
            let a_id = decoded.userId;
            if(a_id === null) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
            
            /*
            **
            ra_regno = await agentModel.reportProcess(req, a_id);
            **
            */
            const rv_id = req.body.rv_id;
            const a_username = req.body.a_username;
            // 1. 신고자 이름 알아오기
            // `SELECT r_username FROM review JOIN resident 
            // ON resident_r_id=r_id 
            // WHERE rv_id=?`

            // 리뷰 테이블에서 rv_id=?인 데이터 가져오기
            const reviewPostOptions = {
                host: 'stop_bang_review_DB',
                port: process.env.PORT,
                path: `/db/review/findAllByReviewId/${rv_id}`,
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                }
            };
            let requestBody = {id: rv_id};
            const reviewResult = await httpRequest(reviewPostOptions, requestBody);
            const resident_r_id = reviewResult.resident_r_id;

            // resident 테이블에서 r_id=resident_r_id인 데이터 가져오기
            const residentPostOptions = {
                host: 'stop_bang_auth_DB',
                port: process.env.PORT,
                path: `/db/review/findByPk`, 
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                }
            };
            let residentRequestBody = {id: resident_r_id};
            const residentResult = await httpRequest(residentPostOptions, residentRequestBody);
            const username = residentResult.r_username;

            // 2. agentList_ra_regno 알아오기
            // `SELECT agentList_ra_regno FROM review WHERE rv_id=?`
            const a_ra_regno_PostOptions = {
                host: 'stop_bang_review_DB',
                port: process.env.PORT,
                path: `/db/review/findAllByReviewId/${rv_id}`,
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                }
            };
            const ra_regno_Result = await httpRequest(a_ra_regno_PostOptions, requestBody);
            const agentList_ra_regno = ra_regno_Result.agentList_ra_regno;


            // 3. 신고 테이블에 삽입
            // `INSERT INTO report(reporter, repo_rv_id, reportee, reason) VALUES(?, ?, ?, ?)`
            reportPostOptions = {
                host: 'stop_bang_sub_DB',
                port: process.env.PORT,
                path: `/db/report/create`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              };
            let reportRequestBody = {
                rv_id: rv_id,
                reporter: a_username,
                reportee: username,
                reason: req.query.reason
            };

            const result = await httpRequest(reportPostOptions, reportRequestBody);

            console.log("신고완료");
            res.redirect(`${req.baseUrl}/${ra_regno[0][0].agentList_ra_regno}`);
        }
    }
};