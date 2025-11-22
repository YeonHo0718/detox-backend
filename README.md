# 🧘‍♂️ Detox Backend (Digital Detox Coach)

> **"도파민 중독, AI 코칭으로 끊어내다."**

이 프로젝트는 사용자가 유튜브 쇼츠, 릴스 등 도파민 유발 앱을 실행했을 때, AI가 개입하여 사용자의 심리를 분석하고 **스스로 절제할 수 있도록 돕는 백엔드 서버**입니다. OpenAI의 `gpt-4o-mini` 모델을 활용하여 페르소나 기반의 코칭, 꼬리 질문, 맞춤형 행동 처방을 제공합니다.

## 🛠 Tech Stack

- **Language:** TypeScript
- **Framework:** Node.js, Express
- **AI Model:** OpenAI `gpt-4o-mini`
- **Library:** `openai`

## ✨ Key Features

1.  **첫 질문 생성 (First Question):** 차단된 앱 실행 시, 사용자의 비전과 앱 종류에 맞춰 거부감 없는 오프닝 질문을 생성합니다.
2.  **꼬리 질문 (Tail Questioning):** 사용자의 답변을 바탕으로 심층적인 심리 분석 질문을 이어갑니다.
3.  **맞춤형 조언 & 행동 처방 (Advice & Action):** 대화 맥락과 사용자의 목표(Vision)를 결합하여 최종적인 조언과 즉시 실천 가능한 대안 행동을 제시합니다.
4.  **JSON 포맷 강제:** 프론트엔드 연동 안정성을 위해 모든 AI 응답을 JSON 형태로 반환합니다.

## 🚀 Getting Started

### 1\. Installation

프로젝트를 클론하고 패키지를 설치합니다.

```bash
git clone <repository-url>
cd detox-backend
npm install
```

### 2\. Environment Setup (`.env`)

루트 디렉토리에 `.env` 파일을 생성하고 OpenAI API 키를 설정해야 합니다.

```env
# .env file
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

### 3\. Run Server

**개발 모드 실행 (TypeScript):**

```bash
npx tsc -w  # 컴파일 (Watch 모드)
# 새 터미널에서
npm run start
```

---

## 📡 API Documentation

### 1\. 첫 질문 받기 (First Question)

차단된 앱을 켰을 때 호출합니다. AI 문지기가 등장하여 첫 질문을 던집니다.

- **Endpoint:** `POST /api/chat/first-question`
- **Request Body:**
  ```json
  {
    "userId": "user_123",
    "appName": "YouTube",
    "userVision": "나는 부자가 될거야"
  }
  ```
- **Response:**
  ```json
  {
      "question": "짧은 설문이 끝나면 앱을 사용하게 해드릴게요. 지금 이 앱을 열게 된 이유가 무엇인가요?",
      "options": [
          "A: 나 너무 지루해.",
          "B: 스트레스가 많아서 잠깐 도피하고 싶었어.",
          "C: 새로운 동영상이 올라왔다는 소식을 듣고 궁금증이 생겼어."
      ],
      "history": [ ... ]
  }
  ```

### 2\. 꼬리 질문 받기 (Next Question)

사용자가 답변을 선택했을 때 호출합니다. 이전 대화 기록(`history`)을 기반으로 심층 질문을 생성합니다.

- **Endpoint:** `POST /api/chat/next-question`
- **Request Body:**

  ```json
  {
    "userId": "user_123",
    "appName": "YouTube",
    "currentQuestion": "지루함은 뇌가 휴식을 원한다는 신호일 수 있어요. 혹시 지금 하던 일이 잘 안 풀리나요?",
    "selectedAnswer": "B: 응, 코딩이 너무 안 돼서 도망치고 싶어.",
    "userVision": "나는 세상에 밝음을 주는 멋진 개발자가 될거야",
    "history": [
      {
        "role": "assistant",
        "content": "짧은 설문이 끝나면 앱을 사용하게 해드릴게요. 지금 이 앱을 열게 된 이유가 무엇인가요?"
      },
      {
        "role": "user",
        "content": "A: 나 너무 지루해"
      }
    ]
  }
  ```

- **Response:**
  ```json
  {
      "question": "코딩에서의 어려움이 당신에게 어떤 감정을 불러일으키고 있나요?",
      "options": [
          "A: 나는 단지 지루함을 피하고 싶을 뿐이야, 그게 다야.",
          "B: 내 능력에 대한 의심이 드는 것 같아, 그래서 도망치고 싶어.",
          "C: 이건 그냥 일상의 스트레스를 없애려는 방법일 뿐이라고 생각해."
      ],
      "history": [ ... ]
  }
  ```

### 3\. 최종 조언 받기 (Get Advice)

대화가 종료되거나 사용자가 조언을 요청했을 때 호출합니다.

- **Endpoint:** `POST /api/chat/advice`
- **Request Body:**
  ```json
  {
    "userId": "user_123",
    "appName": "YouTube Shorts",
    "userVision": "나는 세상에 밝음을 주는 멋진 개발자가 될거야",
    "history": [ ... ]
  }
  ```
- **Response:**
  ```json
  {
    "title": "습관의 고리를 끊을 기회입니다!",
    "message": "지루함을 느낄 때마다 쇼츠를 켜는 습관이 있네요. 하지만 세상에 빛을 밝혀주는 멋진 개발자의 꿈을 위해선 이 순간을 견디는 힘이 필요합니다.",
    "action": "물 한 잔 마시고 기지개 켜기"
  }
  ```

## 📂 Project Structure

```
detox-backend/
├── src/
│   ├── controllers/
│   │   └── chatController.ts  # AI 로직 및 API 핸들러
│   ├── public/
│   │   └── index.html
│   ├── routes/
│   │   └── apiList.ts         # API list 라우트
│   │   └── gpt.ts             # gpt API 라우트
│   ├── app.ts                 # Express 앱 진입점
│   ├── system_prompt.ts       # AI 페르소나 및 프롬프트 모음
├── .env                       # 환경변수
├── package.json
└── tsconfig.json
```

---

_This project was built for Easython._
