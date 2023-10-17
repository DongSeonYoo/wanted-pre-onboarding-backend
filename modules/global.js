module.exports = {
    AUTH: {
        MAX_EMAIL_LENGTH: 256,
        MAX_PASSWORD_LENGTH: 32
    },

    RECRUIT_NOTICE: {
        MAX_POSITION_LENGTH: 100,
        MAX_CONTENT_LENGTH: 600, // 협의 후 변경 가능
        MAX_SKILLS_LENGTH: 100,
        MAX_NOTICES_PER_PAGE: 10, // 한 페이지 당 10개의 공고를 보여줌
        MAX_OTHER_NOTICE_PER_PAGE: 5 // 회사가 올린 다른 채용공고를 5개씩 보여줌
    },

    REGEX: {
        PASSWORD: /^(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!.]).{8,}$/, // 최소 8자 특수문자 포함
        NAME: /^[가-힣a-zA-Z ]{2,16}$/, // 한글 + 영어 2 ~ 16자
        EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // 이메일 정규식
    }
}
