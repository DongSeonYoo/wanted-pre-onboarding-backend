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
        if (error.constraint === CONSTRAINT.FK_COMPANY_TO_RECRUIT_TB) {
            return next(new BadRequestException("해당하는 회사가 존재하지 않습니다"));
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

// 채용 공고 삭제 api
router.delete("/", async (req, res, next) => {
    const { noticeId } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(noticeId, "noticeId").checkInput().isNumber();

        const deleteNoticeSql = `DELETE FROM
                                        recruit_notice_tb
                                    WHERE
                                        id = $1`;
        const deleteNoticeParam = [noticeId];
        const deleteNoticeResult = await pool.query(deleteNoticeSql, deleteNoticeParam);
        if (deleteNoticeResult.rowCount === 0) {
            throw new BadRequestException("해당하는 채용 공고가 존재하지 않습니다");
        }
        result.message = "삭제 완료";

    } catch (error) {
        return next(error);
    }
    res.send(result);
});

// 채용 공고 목록 가져오는 api + 검색 (company_name, position, skills) 기준
// 기본 페이지는 1, 한 페이지 당 10개의 게시글을 가져옴.
router.get("/list", async (req, res, next) => {
    const result = {
        message: "",
        data: {}
    };
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const offset = (page - 1) * RECRUIT_NOTICE.MAX_NOTICES_PER_PAGE;

    try {
        validator(page, "page").isNumber().isPositive();

        let selectNoticeAllSql = `SELECT
                                        recruit_notice_tb.id,
                                        recruit_notice_tb.company_id AS "companyId",
                                        company_tb.name AS "companyName",
                                        company_tb.country,
                                        company_tb.region,
                                        recruit_notice_tb.position,
                                        recruit_notice_tb.reward,
                                        recruit_notice_tb.skills
                                    FROM
                                        recruit_notice_tb
                                    JOIN
                                        company_tb
                                    ON
                                        recruit_notice_tb.company_id = company_tb.id 
                                    `;
        const selectNoticeAllParam = [offset, RECRUIT_NOTICE.MAX_NOTICES_PER_PAGE];
        // 검색어가 비어 있지 않으면 SQL에 검색어 조건을 추가
        if (search !== "") {
            selectNoticeAllSql += ` WHERE 
                                        recruit_notice_tb.position 
                                    LIKE 
                                        $3
                                    OR
                                        recruit_notice_tb.skills 
                                    LIKE 
                                        $3
                                    OR
                                        company_tb.name
                                    LIKE 
                                        $3 `;
            selectNoticeAllParam.push(`%${search}%`);
        }
        selectNoticeAllSql += `ORDER BY
                                    recruit_notice_tb.created_at DESC
                                OFFSET
                                    $1
                                LIMIT
                                    $2`;

        const selectNoticeAllResult = await pool.query(selectNoticeAllSql, selectNoticeAllParam);
        result.data = {
            notices: selectNoticeAllResult.rows
        }
    } catch (error) {
        return next(error);
    }
    res.send(result);
});

// 채용 공고 상세 페이지 api
router.get("/:noticeId", async (req, res, next) => {
    const { noticeId } = req.params;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(noticeId, "noticeId").checkInput().isNumber();

        const selectNoticeSql = `SELECT
                                        recruit_notice_tb.id,
                                        company_tb.name AS "companyName",
                                        company_tb.country,
                                        company_tb.region,
                                        recruit_notice_tb.position,
                                        recruit_notice_tb.reward,
                                        recruit_notice_tb.skills,
                                        recruit_notice_tb.content,
                                        ARRAY (
                                            SELECT
                                                recruit_notice_tb.id
                                            FROM
                                                recruit_notice_tb
                                            WHERE
                                                recruit_notice_tb.company_id = company_tb.id
                                            ORDER BY
                                                recruit_notice_tb.created_at DESC
                                            LIMIT
                                                $2
                                        ) AS "otherNotices"
                                    FROM
                                        recruit_notice_tb
                                    JOIN
                                        company_tb
                                    ON
                                        recruit_notice_tb.company_id = company_tb.id
                                    WHERE
                                        recruit_notice_tb.id = $1`;
        const selectNoticeParam = [noticeId, RECRUIT_NOTICE.MAX_OTHER_NOTICE_PER_PAGE];
        const selectNoticeResult = await pool.query(selectNoticeSql, selectNoticeParam);

        result.data = {
            notices: selectNoticeResult.rows[0]
        }
    } catch (error) {
        return next(error);
    }
    res.send(result);
});

// 지원 내역을 확인하는 api
// 권한: 회사 관리자
router.get("/:noticeId/apply-list", async (req, res, next) => {
    const { noticeId } = req.params;
    const page = req.query.page || 1;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(noticeId, "noticeId").checkInput().isNumber();
        validator(page, "page").isNumber().isPositive();

        const selectApplyListSql = `SELECT
                                        user_tb.id,
                                        user_tb.name,
                                        user_tb.email,
                                        CONCAT
                                        (SUBSTRING
                                            (
                                                recruit_notice_tb.content, 1, 20
                                            ), '...') AS "noticeContent",
                                        recruit_notice_tb.position,
                                        recruit_notice_tb.skills,
                                        TO_CHAR(recruit_notice_tb.created_at, 'YYYY.MM.DD') AS "createdAt"
                                    FROM
                                        apply_tb
                                    JOIN
                                    user_tb
                                    ON
                                        apply_tb.account_id = user_tb.id
                                    JOIN
                                        recruit_notice_tb
                                    ON
                                        apply_tb.recruit_notice_id = recruit_notice_tb.id
                                    WHERE
                                        apply_tb.recruit_notice_id = $1
                                    ORDER BY
                                        apply_tb.created_at`;
        const selectApplyListParam = [noticeId];
        const selectApplyResult = await pool.query(selectApplyListSql, selectApplyListParam);
        if (selectApplyResult.rowCount === 0) {
            result.message = "해당 공고에 지원자가 없습니다 ㅠㅠ";
        }
        result.data = {
            user: selectApplyResult.rows
        };
    } catch (error) {
        return next(error);
    }
    res.send(result);
});

module.exports = router;
