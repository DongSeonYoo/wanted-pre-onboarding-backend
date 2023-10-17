const router = require("express").Router();
const pool = require("../database/postgresql");
const validator = require("../modules/validator");
const loginAuthCheck = require("../middleware/loginAuth");
const CONSTRAINT = require("../modules/constraint");
const { BadRequestException } = require('../modules/customError');

// 채용 공고에 지원하는 api
router.post("/recruit-notice", loginAuthCheck, async (req, res, next) => {
    const userId = req.decoded.id;
    const { noticeId } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(noticeId, "noticeId").checkInput().isNumber();

        const insertApplySql = `INSERT INTO
                                        apply_tb (recruit_notice_id, account_id)
                                    VALUES
                                        ($1, $2)
                                    RETURNING
                                        id`;
        const insertApplyParam = [noticeId, userId];
        const insertApplyResult = await pool.query(insertApplySql, insertApplyParam);
        // 생성된 applyId를 result에 담아줌, insert 실패 시 catch에서 아래처럼 400에러 반환
        result.message = "지원이 완료되었습니다";
        result.data = {
            applyId: insertApplyResult.rows[0].id
        };

    } catch (error) {
        if (error.constrinat === CONSTRAINT.FK_USER_TO_APPLY_TB) {
            return next(new BadRequestException("해당하는 사용자가 존재하지 않습니다"));
        }
        if (error.constrinat === CONSTRAINT.FK_RECRUIT_NOTICE_TO_APPLY_TB) {
            return next(new BadRequestException("해당하는 채용 공고가 존재하지 않습니다"));
        }
        return next(error);
    }
    res.send(result);
});

module.exports = router;
