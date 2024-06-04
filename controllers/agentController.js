const e = require("express");
const jwt = require("jsonwebtoken");
const { httpRequest } = require('../utils/httpRequest.js');
const fs = require("fs");
const amqp = require('amqplib');

if (!process.env.RABBITMQ_HOST) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");
}

const RABBIT = process.env.RABBITMQ_HOST;

module.exports = {
    sendReportMessage: async (reportDetails, res) => {
        try {
            console.log("sendReportMessage started");
            console.log("Rabbitmq server: ", `${RABBIT}`);
            const connection = await amqp.connect({
                protocol: 'amqp',
                hostname: process.env.RABBITMQ_HOST,
                username: process.env.RABBITMQ_ID,
                password: process.env.RABBITMQ_PASSWORD,
                port: process.env.RABBITMQ_PORT,
            }); // 래빗엠큐 서버 URL
            const channel = await connection.createChannel();
    
            const queue = 'reportQueue';
            await channel.assertQueue(queue, {
                durable: true
            });
    
            const msg = JSON.stringify(reportDetails);
            console.log("msg: ", msg);
            channel.sendToQueue(queue, Buffer.from(msg), {
                persistent: true
            });
    
            console.log("신고 메시지가 래빗엠큐에 발행되었습니다.");
            await channel.close();
            await connection.close();

            return { success: true };

        } catch (error) {
            console.error('래빗엠큐 연결 또는 메시지 발행 중 오류 발생:', error);
        }
    },

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
            host: 'review-api',
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
            // console.log("Review(rv_id): ", reviewResult.body[0].id);
            const resident_r_id = reviewResult.body[0].resident_r_id;
            // console.log("입주민 id: ", resident_r_id);
            const agentList_ra_regno = reviewResult.body[0].agentList_ra_regno;
            // console.log("공인중개사 ra_regno: ", agentList_ra_regno);
    
            // 두 번째 요청: resident 테이블에서 데이터 가져오기
            console.log("resident 테이블에서 데이터 가져오기");
            const residentPostOptions = {
                host: 'auth-api',
                port: process.env.PORT,
                path: `/db/resident/findByPk`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            let residentRequestBody = { resident_r_id: resident_r_id };
    
            const residentResult = await httpRequest(residentPostOptions, residentRequestBody);
            const username = residentResult.body[0].r_username;
            // console.log("후기 작성자: ", username);

            // 세 번째 요청: 신고 테이블에 데이터 삽입
            console.log("[간접메시징요청] 신고 테이블에 데이터 삽입");
            // const reportPostOptions = {
            //     host: 'sub-api',
            //     port: process.env.PORT,
            //     path: `/db/report/create`,
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     }
            // };
            let reportRequestBody = {
                repo_rv_id: rv_id,
                reporter: a_username,
                reportee: username,
                reason: reason,
                sys_regno: agentList_ra_regno
            };
    
            // const reportResult = await httpRequest(reportPostOptions, reportRequestBody);
            const reportResult = await module.exports.sendReportMessage(reportRequestBody);
            console.log(reportResult);
            if (reportResult.success) {
                console.log("신고완료");
                return res.json(agentList_ra_regno);
            } else {
                console.error('신고 실패:', reportResult.error);
                return res.render('error.ejs', { message: "처리 중 오류가 발생했습니다." });
            }
    
        } catch (err) {
            console.error(err);
            return res.render('error.ejs', { message: "처리 중 오류가 발생했습니다." });
        }
    },

    // 후기별 공인중개사 신고 여부 확인
    // router.get('/isReported/:rv_id', agentController.isReported);
    isReported: async (req, res) => {
        console.log("ms_Bookmark: isReported 함수 시작");
        // // 쿠키로부터 로그인 계정 알아오기
        // console.log("login 계정 알아오는 단계");
        // if (req.cookies.authToken == undefined) {
        //     return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
        // } 
    
        // let decoded;
        // console.log("try문 시작");
        // try {
        //     decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET_KEY);
        //     console.log("jwt.verify완료");
        // } catch (err) {
        //     return res.render('notFound.ejs', { message: "로그인이 필요합니다" });
        // }
    
        // const a_username = decoded.userId; // 사용자 이름
        // console.log("agent name: ", a_username);
        // let a_id = decoded.userId;
        // if (a_id === null) return res.render('notFound.ejs', { message: "로그인이 필요합니다" });

        getReportOptions = {
            host: "sub-api",
            port: process.env.PORT,
            path: `/db/report/findAll/${req.params.a_username}`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          };

        const reportRes = await httpRequest(getReportOptions);
        console.log("신고 정보 가져옴");
        if (reportRes.body) {
            console.log("reportRes!!!!!: ", reportRes.body);
            let responseArray = []; // response 배열 선언
            reportRes.body.forEach(report => {
                // reporter와 repo_rv_id가 같은 객체인지 확인
                const existingReport = responseArray.find(item => 
                    item.reporter === report.reporter && item.repo_rv_id === report.repo_rv_id
                );
                // 해당 객체가 response 배열에 없으면 추가
                if (!existingReport) {
                    responseArray.push(report);
                }
            });
            console.log("reported reviews: ", responseArray);
            return res.json(responseArray); // 중복 제거된 배열 반환
        } else {
            console.log("신고 정보를 가져올 수 없음");
            return res.json({}); // 정보가 없는 경우 빈 배열 반환
        }
        
    }
    
};
