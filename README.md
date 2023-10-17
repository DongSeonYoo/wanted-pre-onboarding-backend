# wanted-pre-onboarding-backend

# [api명세서는 이곳에!!](./routes/README.md)

# 요구사항 분석
    - 회사는 채용 공고를 등록하고 관리할 수 있음 (수정, 삭제).
    - 사용자는 회사가 올린 채용 공고를 확인할 수 있음.
    - 사용자는 채용 공고에 지원할 수 있음
    - 회사는 해당 공고의 지원 내역을 확인할 수 있음.

### 사용 기술
    Node & Express.js (api 라우팅)
    Json Web Token (로그인)
    DBMS (postgresql)

### 디렉토리 구조
```shell
.
├── README.md
├── bin
│   └── www.js
├── config
│   └── jwtSetting.js
├── database
│   └── postgresql.js
├── middleware
│   ├── errorHandling.js
│   └── loginAuth.js
├── modules
│   ├── bcrypt.js
│   ├── constraint.js
│   ├── customError.js
│   ├── global.js
│   ├── jwt.js
│   └── validator.js
├── package-lock.json
├── package.json
├── routes
│   ├── README.md
│   ├── apply.js
│   ├── auth.js
│   └── recruit-notice.js
└── server.js
```
# 📁middleware
- 로그인 인증(토큰 해석), express의 에러 처리기 같은 미들웨어들을 middleware 디렉토리에서 관리해줍니다.
# 📁modules
- api 내에서 사용되는 검증, 전역변수, 등 헬퍼 함수들을 관리해줍니다.

### NPM
    "bcrypt": "^5.1.1", (비밀번호 암호화 목적)
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2", (로그인 유지 목적)
    "nodemon": "^3.0.1", (개발용)
    "pg": "^8.11.3" (postgresql과 express를 연결해주는 목적)

### Commit convention
<img src="./commit convention.png" width="800" height="600"/>

# ERD 설계
- **tool: ERD editor (Visual Studio Code)**
<img src="./ERD.png" width="1200" height="800"/>


# 특이사항
## **1. [validatoe](./modules/validator.js) 라는 데이터 검증 함수를 직접 만들어 api 내부에서 method chaining 방식으로 데이터를 검증해줍니다.**<br>
### Example
```javascript
    validator(noticeId, "noticeId").checkInput().isNumber();
```
<br>

## 2. [CustomError](./modules/customError.js) 클래스를 미리 만들어 api 내에서 status코드와 message를 한줄로 명료하게 보내줍니다.<br>
### Example: 제약조건에 맞지 않는 값인 경우
```javascript
    if (error.constraint === CONSTRAINT.FK_COMPANY_TO_RECRUIT_TB) {
        return next(new BadRequestException("해당하는 회사가 존재하지 않습니다"));
    }
```
<br>

## 3. [constraint.js](./modules/constraint.js) 에서 데이터베이스 제약 조건 이름을 관리해줍니다.
### 이를 통해 데이터 INSERT시 제약조건에 따라 400 에러를 프론트엔드에게 보여줄 수 있습니다.
### Example: 제약조건에 맞지 않는 값인 경우
```javascript
    if (error.constraint === CONSTRAINT.FK_COMPANY_TO_RECRUIT_TB) {
        return next(new BadRequestException("해당하는 회사가 존재하지 않습니다"));
    }
```
<br>

## 4. 사용자가 채용 공고 지원 시 user의 pk를 사용하기 위해서 jwt 기능을 도입했습니다
#### - 토큰의 payload에 사용자의 pk를 넣어줬습니다. 이를 통해 런타임 시에 사용자의 pk를 이용해 값을 제어할수 있습니다.
## 로그인 시 응답 헤더에 'accessToken'이라는 이름으로 토큰을 담아 클라이언트에 보내줍니다.
```javascript
    const accessToken = await jwtUtil.userSign(userData);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
    });
```
![screensh](/jwt.png)
### api에 아래처럼 loginAuthCheck 미들웨어를 장착해주면 토큰 검증을 해주고 해당 api에 req.decoded에 로그인 한 유저의 pk를 가져올 수 있습니다.
```javascript
router.post("/recruit-notice", loginAuthCheck, async (req, res, next) => {
    const userId = req.decoded.id; // 사용자 pk 사용 가능!
});
```
<br>

## 5. [global.js](./modules/global.js)를 전역변수를 관리하는 모듈을 만들어줬습니다.
### 이를 통해 어플리케이션의 전역 변수를 중앙에서 관리할 수 있습니다.
<br>