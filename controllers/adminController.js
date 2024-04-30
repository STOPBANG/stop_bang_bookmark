//Models
const e = require("express");
const { httpRequest } = require('../utils/httpRequest.js');

module.exports = {
  //select * from report p left join review v on p.repo_rv_id = v.rv_id;
  getReports: async (req, res) => {
  
    // 모든 신고 데이터를 가져오기
    const reportPostOptions = {
        host: 'stop_bang_sub_DB',
        port: process.env.PORT,
        path: `/db/report/getAllReports`,
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        }
    };
    const allReports = await httpRequest(reportPostOptions);
    // 신고 데이터에서 리뷰 아이디들만 추출하여 저장
    const reviewIds = allReports.map(report => report.repo_rv_id);

    // 각 리뷰 아이디에 대한 작업 수행
    for (const reviewId of reviewIds) {
        // 리뷰 아이디를 이용하여 리뷰 데이터 가져오기
        const reviewPostOptions = {
            host: 'stop_bang_review_DB',
            port: process.env.PORT,
            path: `/db/review/findAllByReviewId/${reviewId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const reviewResult = await httpRequest(reviewPostOptions);

        // 리뷰와 해당하는 신고 데이터를 찾기
        const reportResult = allReports.find(report => report.repo_rv_id === reviewId);

        // 필요한 작업 수행 후 신고 데이터와 리뷰 데이터를 조합하여 배열에 추가
        const report = {
            reviewId: reviewId,
            resident_r_id: reviewResult.resident_r_id,
            agentList_ra_regno: reviewResult.agentList_ra_regno,
            rating: reviewResult.rating,
            content: reviewResult.content,
            tags: reviewResult.tags,
            created_time: reviewResult.created_time,
            updated_time: reviewResult.updated_time,
            reporter: reportResult.reporter,
            repo_rv_id: reportResult.repo_rv_id,
            reportee: reportResult.reportee,
            reason: reportResult.reason  
        };

        // 조합된 데이터를 배열에 추가
        reports.push(report);
    }

    // 최종적으로 조합된 데이터를 클라이언트에 반환
    res.json(reports);

  },

  // "/reports/confirm/:rvid/:reporter"
  // select * from report p left join review v 
  // on p.repo_rv_id = v.rv_id 
  // where p.repo_rv_id =? and p.reporter=?`;
  getOneReport: async (req, res) => {
    const rv_id = req.body.rvid;
    const reporter = req.body.reporter;

    // 신고 데이터 가져오기
    reportPostOptions = {
        host: 'stop_bang_sub_DB',
        port: process.env.PORT,
        path: `/db/report/findOne/${rv_id}/${reporter}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
    };
    const reportResult = await httpRequest(reviewPostOptions);

    // 리뷰 데이터 가져오기
    reviewPostOptions = {
        host: 'stop_bang_review_DB',
        port: process.env.PORT,
        path: `/db/review/findBy/${rv_id}/${reporter}`, // 이건 아직 리뷰 모델에 없음
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
    };
    const reviewResult = await httpRequest(reviewPostOptions);

    // 조합된 데이터를 담을 객체 생성
    const combinedData = {
        reporter: reporter,
        rv_id: rv_id,
        reportee: reportResult.reportee,
        reason: reportResult.reason,
        resident_r_id: reviewResult.resident_r_id,
        agentList_ra_regno: reviewResult.agentList_ra_regno,
        rating: reviewResult.rating,
        content: reviewResult.content,
        tags: reviewResult.tags,
        created_time: reviewResult.created_time,
        updated_time: reviewResult.updated_time
    };

    // 결과 반환
    res.json(combinedData);

  },

  // 신고 삭제
  deleteReport: async (req, res) => {
    const r_id = req.body.r_id;

    postOptions = {
        host: 'stop_bang_sub_DB',
        port: process.env.PORT,
        path: `/db/report/delete`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
    }

    let requestBody = {r_id: r_id};

    httpRequest(postOptions, requestBody)
    .then(result => {
      if (result === null) {
        console.log("error occured: ", err);
      } else {
        res.redirect(`/report`);
      }
    });
  },

  deleteComment: async (req, res) => {
    const rv_id = req.body.rvid;
    // rv_id 인 리뷰를 opened_review, review, report에서 삭제한다
    // 원래 트랜잭션인데.... 흠 어떻게 하지

    reportPostOptions = {
      host: 'stop_bang_sub_DB',
      port: process.env.PORT,
      path: `/db/report/delete`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    reviewPostOptions = {
      host: 'stop_bang_review_DB',
      port: process.env.PORT,
      path: `/db/review/delete`, // 이건 아직 리뷰 모델에 없음
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    openedReviewPostOptions = {
      host: 'stop_bang_review_DB',
      port: process.env.PORT,
      path: `/db/openedReview/delete`, // 이건 아직 리뷰 모델에 없음
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    let requestBody = {rv_id: rv_id};

    try {
      const reportResult = await httpRequest(reportPostOptions, requestBody);
      const reviewResult = await httpRequest(reviewPostOptions, requestBody);
      const openedReviewResult = await httpRequest(openedReviewPostOptions, requestBody);
      // 작업이 성공적으로 완료되면 리다이렉트 수행
      res.redirect("/admin/reports");
    } catch (error) {
      // 작업이 실패하면 콘솔에 에러 출력
      console.log(error);
    }
    
  }

    
};