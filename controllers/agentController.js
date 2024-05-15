const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
    reporting: (req, res) => {
        //쿠키로부터 로그인 계정 알아오기
        if (req.cookies.authToken == undefined) {
            res.render('notFound.ejs', { message: "로그인이 필요합니다" });
        } else {
            let decoded;
            try {
                decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET_KEY);
            } catch (err) {
                return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
            }

            let a_id = decoded.userId;
            if (a_id === null) return res.render('notFound.ejs', { message: "로그인이 필요합니다" });

            const rv_id = req.body.rv_id;
            const a_username = req.body.a_username;

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
            let requestBody = { id: rv_id };

            httpRequest(reviewPostOptions, requestBody)
                .then(reviewResult => {
                    const resident_r_id = reviewResult.resident_r_id;

                    // resident 테이블에서 r_id=resident_r_id인 데이터 가져오기
                    const residentPostOptions = {
                        host: 'stop_bang_auth_DB',
                        port: process.env.PORT,
                        path: `/db/resident/findByPk`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    };
                    let residentRequestBody = { id: resident_r_id };

                    return httpRequest(residentPostOptions, residentRequestBody);
                })
                .then(residentResult => {
                    const username = residentResult.r_username;

                    // 2. agentList_ra_regno 알아오기
                    const a_ra_regno_PostOptions = {
                        host: 'stop_bang_review_DB',
                        port: process.env.PORT,
                        path: `/db/review/findAllByReviewId/${rv_id}`,
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    };
                    return httpRequest(a_ra_regno_PostOptions, requestBody)
                        .then(ra_regno_Result => {
                            const agentList_ra_regno = ra_regno_Result.agentList_ra_regno;

                            // 3. 신고 테이블에 삽입
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
                                rv_id: rv_id,
                                reporter: a_username,
                                reportee: username,
                                reason: req.query.reason,
                                sys_regno: agentList_ra_regno
                            };

                            return httpRequest(reportPostOptions, reportRequestBody)
                                .then(result => { console.log("신고완료");
                                    return res.json(agentList_ra_regno);
                                });
                        });
                })
                .catch(err => {
                    console.error(err);
                    res.render('error.ejs', { message: "처리 중 오류가 발생했습니다." });
                });
        }
    }
};
