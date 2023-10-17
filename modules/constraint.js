module.exports = {
    // unique 이메일 제약조건
    UNIQUE_EMAIL_TO_USER_TB: "unique_email_to_user_tb",

    // 채용 공고 등록 시 fk 제약조건
    FK_COMPANY_TO_RECRUIT_TB: "fk_company_tb_to_recruit_notice_tb",

    // 지원 요청 시 fk 제약조건
    FK_RECRUIT_NOTICE_TO_APPLY_TB: "fk_recruit_notice_tb_to_apply_tb",
    FK_USER_TO_APPLY_TB: "fk_user_tb_to_apply_tb"
}