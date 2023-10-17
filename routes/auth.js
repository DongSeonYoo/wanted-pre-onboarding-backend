const router = require("express").Router();
const pool = require("../database/postgresql");
const validator = require("../modules/validator");
const { AUTH, REGEX } = require("../modules/global");
const CONSTRAINT = require("../modules/constraint");
const { BadRequestException } = require('../modules/customError');
const bcryptUtil = require("../modules/bcrypt");
const jwtUtil = require("../modules/jwt");

// 로그인 api
router.post("/", async (req, res, next) => {
    const { email, password } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(email, "email").checkInput().checkLength(1, AUTH.MAX_EMAIL_LENGTH);
        validator(password, "password").checkInput().checkLength(1, AUTH.MAX_PASSWORD_LENGTH);

        const selectAccountSql = `SELECT
                                        id, 
                                        password 
                                    FROM 
                                        user_tb 
                                    WHERE 
                                        email = $1`;
        const selectAccountParam = [email];
        const selectAccountResult = await pool.query(selectAccountSql, selectAccountParam);
        if (selectAccountResult.rowCount === 0) {
            throw new BadRequestException("아이디 또는 비밀번호가 올바르지 않습니다");
        }
        // 해당하는 이메일이 존재한다면?
        const userData = selectAccountResult.rows[0];
        // 입력받은 pw와 암호화된 pw가 일치할경우 accessToken 발급
        const passwordMatch = bcryptUtil.compare(password, userData.password);
        if (!passwordMatch) {
            throw new BadRequestException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        const accessToken = await jwtUtil.userSign(userData);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
        });
        result.data = {
            userId: userData.id
        }
    } catch (error) {
        return next(error);
    }
    res.send(result);
});

// 회원가입 api
router.post("/signup", async (req, res, next) => {
    const { email, password, name } = req.body;
    const result = {
        message: "",
        data: {}
    }

    try {
        validator(email, "email").checkInput().checkRegex(REGEX.EMAIL);
        validator(password, "password").checkInput().checkRegex(REGEX.PASSWORD);
        validator(name, "name").checkInput().checkRegex(REGEX.NAME);
        // 비밀번호 암호화
        const hashedPassword = await bcryptUtil.hashing(password);

        const signUpSql = `INSERT INTO
                                    user_tb (email, password, name)
                                VALUES
                                    ($1, $2, $3)
                                RETURNING
                                    id`;
        const signupParam = [email, hashedPassword, name];
        const signUpResult = await pool.query(signUpSql, signupParam);
        result.message = "회원가입에 성공하였습니다!";
        result.data = {
            userId: signUpResult.rows[0].id
        };

    } catch (error) {
        if (error.constraint === CONSTRAINT.UNIQUE_EMAIL_TO_USER_TB) {
            return next(new BadRequestException("해당하는 이메일이 이미 존재합니다."));
        }
        return next(error);
    }
    res.send(result);
});

module.exports = router;
