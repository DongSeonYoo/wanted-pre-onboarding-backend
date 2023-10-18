# api 명세

## 먼저, api 실패시 status code를 명세합니다
### 현재 사용중인 status code는 
    1. 400 BadRequestException
    2. 401 UnauthorizedException
    3. 500 InternerServerException
    총 3개의 status code 사용중

# 400 status code 응답 예시
- 프론트엔드에서 잘못된 요청 값을 보내줬을 때 발생합니다
- API의 query string, path variable, body 같은 request의 값이 유효하지 않은 값으로 들어왔을 때 발생합니다 <br>
### Request
```json
{
    "companyId": "a", //정수를 보내지 않았을 경우
    "position": "백엔드 주니어 개발자",
    "reward": 1000000,
    "content": "원티드랩에서 백엔드 주니어 개발자를 '적극' 채용합니다. 자격요건은..",
    "skills": "Node.js"
}
```
### Response
```json
{
    "message": "companyId: 정수가 아닙니다"
}
```

# 401 status code 응답 예시
1. 로그인하지 않은 유저가 로그인이 필요한 api를 호출하였을 경우.
2. 토큰이 조작되었을 경우도 해당 에러가 발생합니다<br>

### Request
```json
{
    "noticeId": 2 // 채용 공고에 지원 시 로그인이 필요한데 로그인 하지 않고 api를 호출한경우
}
```
### Response
status code: 401
```json
{
    "message": "로그인 후 이용 가능합니다"
}
```
<br>

# 500 status code는 위 명세된것 이외의 상황에 (서버 오류)발생합니다, <br> 아래부턴 작성된 api입니다.
<br>


## 채용 공고를 등록하는 api<br>
### ENDPOINT: POST /recruit-notice

### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "companyId": 1,
    "position": "백엔드 주니어 개발자",
    "reward": 1000000,
    "content": "원티드랩에서 백엔드 주니어 개발자를 '적극' 채용합니다. 자격요건은..",
    "skills": "Node.js"
}
```

### Response
```json
{
    "message": "채용 공고 등록 성공",
    "data": {
        "noticeId": 17
    }
}
```

## 채용 공고를 수정하는 api<br>
### ENDPOINT: PUT /recruit-notice

### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "noticeId": 1,
    "position": "백엔드 주니어 개발짜",
    "reward": 100000,
    "content": "개발자채용해요..",
    "skills": "node.js"
}
```

### Response
```json
{
    "message": "채용 공고 수정 성공",
    "data": {}
}
```

## 전체 채용 공고 리스트를 조회하는 api<br>
### ENDPOINT: GET /recruit-notice/list
채용 공고 목록 가져오는 api + 검색 (company_name, position, skills) 기준<br>
기본 페이지는 1 한 페이지 당 10개의 게시글을 가져옴. (페이지네이션 적용)
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
	"query": {
        "company-name": string, // 회사 이름,
        "position": string, // 포지션 이름
        "skills": string // 기술 이름
	}
}
```

### Response
```json
{
    "message": "",
    "data": {
        "notices": [
            {
                "id": 17,
                "companyId": 1,
                "companyName": "원티드랩",
                "country": "한국",
                "region": "서울",
                "position": "백엔드 주니어 개발자",
                "reward": 1000000,
                "skills": "Node.js"
            },
            ... (더 많은 채용 공고)
        ]
    }
}
```

## 채용 공고 상세 페이지 조회 api<br>
#### Note
- 회사가 올린 다른 공고는 최대 5개 보내줍니다 (프론트엔드와 협의 사항)
- 회사가 올린 다른 공고가 없을 시 빈 배열로 보내줍니다
### ENDPOINT: GET /recruit-notice/{notice-id}
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "path": {
        "notice-id": number // 채용 공고 id
    }
}
```

### Response
```json
{
    "message": "",
    "data": {
        "notices": {
            "id": 1,
            "companyName": "원티드랩",
            "country": "한국",
            "region": "서울",
            "position": "백엔드 주니어 개발짜",
            "reward": 100000,
            "skills": "node.js",
            "content": "개발자채용해요..",
            "otherNotices": [
                17,
                13,
                12,
                11,
                10
            ]
        }
    }
}
```

## 채용 공고의 지원 내역 조회 api<br>
### ENDPOINT: GET /recruit-notice/{notice-id}/apply-list
### Note
- : timestamp 포맷 'yyyy.mm.dd'
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "path": {
        "notice-id": number // 채용 공고 id
    }
}
```

### Response
```json
{
    "message": "",
    "data": {
        "user": [
            {
                "id": 5,
                "name": "유동선",
                "email": "inko51366@naver.com",
                "noticeContent": "원티드랩에서 백엔드 주니어 개발자를 ...",
                "position": "백엔드 주니어 개발자",
                "skills": "Node.js",
                "createdAt": "2023.10.16"
            },
        ]
        .. 더 많은 지원 내역
    }
}
```

## 채용 공고 지원하는 api<br>
### ENDPOINT: POST /apply/recruit-notice
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "body": {
        "notice-id": number // 채용 공고 id
    }
}
```

### Response
```json
{
    "message": "지원이 완료되었습니다",
    "data": {
        "applyId": 28 // 생성된 지원 내역 id
    }
}
```
## 만약 기존에 지원한 내역이 있다면 400 error
# **[여기서 잡아줍니다](./apply.js)**
### Response
```json
status code: 400
{
    "message": "이미 해당 공고에 지원하였습니다",
}
```


# 그 외 추가적인 api
- 해당 api들은 추가적으로 개발의 편의를 위해 만든 api입니다.

## 회원가입 api<br>
### ENDPOINT: POST /auth/signup
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "body": {
        "email": string, // 이메일
        "password": number, // 비밀번호
        "name": string // 이름
    }
}
```

### Response
```json
{
    "message": "회원가입에 성공하였습니다!",
    "data": {
        "userId": 9 // 생성된 유저 pk
    }
}
```


## 로그인 api<br>
### ENDPOINT: POST /auth
#### Note: 로그인 성공 시 응답 본문에 "accessToken"이름의 jwt를 실어서 보내줍니다
### Request:
```json
{
    "headers": {
        "Content-Type": "application/json"
    },
    "body": {
        "email": string, // 이메일
        "password": string // 비밀번호
    }
}
```

### Response
```json
{
    "message": "로그인 성공",
    "data": {
        "userId": 3 // 유저의 pk 반환
    }
}
```