//db정보받기
const db = require("../config/db.js");

module.exports = {
  updateBookmark: async (r_username, body, result) => {
    let getRIdRawQuery = `
    SELECT r_id
    FROM resident
    WHERE r_username=?`;
    let res;

    try {
      if (body.isBookmark !== "0") {
        rawQuery = `DELETE FROM bookmark WHERE bm_id=?`;
        res = await db.query(rawQuery, [body.isBookmark]);
      } else {
        insertRawQuery = `INSERT INTO bookmark (resident_r_id, agentList_ra_regno) values (?, ?)`;
        r_username = await db.query(getRIdRawQuery, [r_username]);
        res = await db.query(insertRawQuery, [r_username[0][0].r_id, body.raRegno]);
      }
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
};    