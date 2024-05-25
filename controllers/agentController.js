const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
    reporting: async (req, res) => {
        console.log("ms_Bookmark: reporting 함수 시작");
        // 쿠키로부터 로그인 계정 알아오기
        if (req.cookies.authToken == undefined) {
            return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
        } 
    
        let decoded;
        try {
            decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
        }
    
        let a_id = decoded.userId;
        if (a_id === null) return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
    
        const rv_id = req.body.rv_id;
        const a_username = decoded.userId;
        const reason = req.body.reason;
        // console.log("전달받은 rv_id: ", rv_id);
    
        // 리뷰 테이블에서 rv_id=?인 데이터 가져오기
        console.log("리뷰 테이블에서 rv_id=?인 데이터 가져오기");
        const reviewGetOptions = {
            host: 'stop_bang_review_DB',
            port: process.env.PORT,
            path: `/db/review/findAllByReviewId/${rv_id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        try {
            // 첫 번째 요청: 리뷰 데이터 가져오기
            const reviewResult = await httpRequest(reviewGetOptions);
            // console.log("Review 조회 결과:", reviewResult.body);
            console.log("Review(rv_id): ", reviewResult.body[0].id);
            const resident_r_id = reviewResult.body[0].resident_r_id;
            console.log("입주민 id: ", resident_r_id);
            const agentList_ra_regno = reviewResult.body[0].agentList_ra_regno;
            console.log("공인중개사 ra_regno: ", agentList_ra_regno);
    
            // 두 번째 요청: resident 테이블에서 데이터 가져오기
            console.log("resident 테이블에서 데이터 가져오기");
            const residentPostOptions = {
                host: 'stop_bang_auth_DB',
                port: process.env.PORT,
                path: `/db/resident/findByPk`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let residentRequestBody = { resident_r_id: resident_r_id };
    
            const residentResult = await httpRequest(residentPostOptions, residentRequestBody);
            // console.log("Resident: ", residentResult.body);
            const username = residentResult.body[0].r_username;
            console.log("후기 작성자: ", username);

            // 세 번째 요청: 신고 테이블에 데이터 삽입
            console.log("신고 테이블에 데이터 삽입");
            const reportPostOptions = {
                host: 'stop_bang_sub_DB',
                port: process.env.PORT,
                path: `/db/report/create`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let reportRequestBody = {
                repo_rv_id: rv_id,
                reporter: a_username,
                reportee: username,
                reason: reason,
                sys_regno: agentList_ra_regno
            };
    
            await httpRequest(reportPostOptions, reportRequestBody);
            console.log("신고완료");
            return res.json(agentList_ra_regno);
    
        } catch (err) {
            console.error(err);
            return res.render('error.ejs', { message: "처리 중 오류가 발생했습니다." });
        }
    }
    
};
