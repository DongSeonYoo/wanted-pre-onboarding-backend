const router = require("express").Router();
const pool = require("../database/postgresql");
const validator = require("../modules/validator");
const CONSTRAINT = require("../modules/constraint");
const { RECRUIT_NOTICE } = require("../modules/global");
const { BadRequestException } = require("../modules/customError");

// 채용 공고 등록 api
router.post("/", async (req, res, next) => {
    const { companyId, position, reward, content, skills } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(companyId, "companyId").checkInput().isNumber();
        validator(position, "position").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_POSITION_LENGTH);
        validator(reward, "reward").checkInput().isNumber();
        validator(content, "content").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_CONTENT_LENGTH);
        validator(skills, "skills").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_SKILLS_LENGTH);

        const insertNoticeSql = `INSERT INTO
                                        recruit_notice_tb (company_id, position, reward, content, skills)
                                    VALUES
                                        ($1, $2, $3, $4, $5)
                                    RETURNING
                                        id`;
        const isnertNoticeParam = [
            companyId,
            position,
            reward,
            content,
            skills
        ];
        const insertNoticeResult = await pool.query(insertNoticeSql, isnertNoticeParam);
        const createdNoticeId = insertNoticeResult.rows[0].id;
        result.message = "채용 공고 등록 성공";
        result.data = {
            noticeId: createdNoticeId
        };

    } catch (error) {
        if (error.constriant === CONSTRAINT.FK_COMPANY_TO_RECRUIT_TB) {
            throw new BadRequestException("해당하는 회사가 존재하지 않습니다.");
        }
        return next(error);
    }
    res.send(result);
});

// 채용 공고 수정 api
router.put("/", async (req, res, next) => {
    const { noticeId, position, reward, content, skills } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(noticeId, "noticeId").checkInput().isNumber();
        validator(position, "position").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_POSITION_LENGTH);
        validator(reward, "reward").checkInput().isNumber();
        validator(content, "content").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_CONTENT_LENGTH);
        validator(skills, "skills").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_SKILLS_LENGTH);

        // 나중에 추가 될 권한 체크 후
        const modifyNoticeSql = `UPDATE 
                                        recruit_notice_tb
                                    SET
                                        position = $1,
                                        reward = $2,
                                        content = $3,
                                        skills = $4
                                    WHERE
                                        id = $5`;
        const modifyNoticeParam = [position, reward, content, skills, noticeId];
        const modifyNoticeResult = await pool.query(modifyNoticeSql, modifyNoticeParam);
        if (modifyNoticeResult.rowCount === 0) {
            throw new BadRequestException("해당하는 공고가 존재하지 않습니다.");
        }
        result.message = "채용 공고 수정 성공";

    } catch (error) {
        return next(error);
    }
    res.send(result);
});

// 채용 공고 목록 가져오는 api
router.get("/list", async (req, res, next) => {
    const result = {
        message: "",
        data: {}
    };
    const page = req.query.page || 1;
    const offset = (page - 1) * RECRUIT_NOTICE.MAX_NOTICES_PER_PAGE;

    try {
        validator(page, "page").isNumber().isPositive();

        const selectNoticeAllSql = `SELECT
                                        recruit_notice_tb.id,
                                        recruit_notice_tb.company_id AS "companyId",
                                        company_tb.name AS "companyName",
                                        company_tb.name AS "country",
                                        company_tb.region AS "region",
                                        recruit_notice_tb.position,
                                        recruit_notice_tb.reward,
                                        recruit_notice_tb.skills
                                    FROM
                                        recruit_notice_tb
                                    JOIN
                                        company_tb
                                    ON
                                        recruit_notice_tb.company_id = company_tb.id
                                    ORDER BY
                                        recruit_notice_tb.created_at DESC
                                    OFFSET
                                        $1
                                    LIMIT
                                        $2`;
        const selectNoticeAllParam = [offset, RECRUIT_NOTICE.MAX_NOTICES_PER_PAGE];
        const selectNoticeAllResult = await pool.query(selectNoticeAllSql, selectNoticeAllParam);
        result.data = {
            notices: selectNoticeAllResult.rows
        }
    } catch (error) {
        return next(error);
    }
    res.send(result);
});

module.exports = router;
