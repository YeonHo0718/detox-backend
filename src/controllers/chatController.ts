import {
  ADVICE_SYSTEM_PROMPT,
  FIRST_QUESTION_PROMPT,
  GPT_SYSTEM_PROMPT,
  TAIL_QUESTION_PROMPT,
} from "../system_prompt";
import { Router, Request, Response } from "express";
import OpenAI from "openai";
// 환경 변수 타입 처리
const KEY = process.env.OPENAI_API_KEY || "";
console.log("OPENAI_API_KEY:", KEY ? "Loaded" : "Not Found");
const client = new OpenAI({ apiKey: KEY });

interface ChatHistory {
  role: "user" | "assistant" | "system";
  content: string;
}

interface NextQuestionRequest {
  userId: string;
  appName: string;
  userVision: string;
  currentQuestion: string; // 직전 질문 (AI)
  selectedAnswer: string; // 사용자가 고른 답변 (User)
  history?: ChatHistory[]; // 이전 대화 목록 (선택사항)
}

interface NextQuestionResponse {
  question: string;
  options: string[];
  history?: ChatHistory[];
}

async function chatGPTBasic(prompt: string, msg: string) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: msg,
      },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content received from GPT");
  }
  return content;
}

async function chatGPTAdvanced(
  msg: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: msg,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content received from GPT");
  }
  return content;
}

export const getFirstQuestion = async (req: Request, res: Response) => {
  try {
    const { userId, appName, userVision } = req.body as {
      userId: string;
      appName: string;
      userVision: string;
    };
    console.log(req.body);

    // 1. GPT에게 보낼 메시지 구성
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: FIRST_QUESTION_PROMPT(appName, userVision) },
    ];

    // 2. OpenAI API 호출
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 해커톤용 (빠르고 저렴함) 또는 'gpt-3.5-turbo'
      messages: messages,
      response_format: { type: "json_object" }, // 중요: JSON 강제 모드
      temperature: 0.7, // 창의성 조절
    });
    // 3. 응답 파싱
    const aiContent = completion.choices[0].message.content;
    if (!aiContent) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    // JSON 문자열을 객체로 변환
    const parsedData: NextQuestionResponse = JSON.parse(aiContent);
    parsedData.history = [{ role: "assistant", content: parsedData.question }];
    // 4. 클라이언트에 응답 전송
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("GPT API Error:", error);
    res.status(500).json({});
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      appName,
      userVision,
      currentQuestion,
      selectedAnswer,
      history = [],
    } = req.body as NextQuestionRequest;
    console.log(req.body);

    // 1. GPT에게 보낼 메시지 구성
    // 시스템 프롬프트 + 이전 대화(History) + 이번 턴(User Answer)
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: TAIL_QUESTION_PROMPT(appName, userVision) },
      ...history, // 클라이언트가 준 이전 대화 내역 그대로 주입
      { role: "assistant", content: currentQuestion }, // 직전 AI 질문
      { role: "user", content: selectedAnswer }, // 이번 유저 답변
    ];

    // 2. OpenAI API 호출
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 해커톤용 (빠르고 저렴함) 또는 'gpt-3.5-turbo'
      messages: messages,
      response_format: { type: "json_object" }, // 중요: JSON 강제 모드
      temperature: 0.7, // 창의성 조절
    });

    // 3. 응답 파싱
    const aiContent = completion.choices[0].message.content;

    if (!aiContent) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    // JSON 문자열을 객체로 변환
    const parsedData: NextQuestionResponse = JSON.parse(aiContent);
    parsedData.history = [
      ...history, // 클라이언트가 준 이전 대화 내역 그대로 주입
      { role: "assistant", content: currentQuestion }, // 직전 AI 질문
      { role: "user", content: selectedAnswer },
    ];

    // 4. 클라이언트에 응답 전송
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("GPT API Error:", error);
    res.status(500).json({
      message: "AI 분석 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAdvice = async (req: Request, res: Response) => {
  try {
    const { userId, history, userVision, appName } = req.body;
    console.log(req.body);

    // 1. GPT에게 보낼 메시지 구성
    // [시스템 프롬프트] -> [지금까지의 대화 내역] -> [최종 지시: "이제 조언해줘"]
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: ADVICE_SYSTEM_PROMPT(appName, userVision) },
      ...history, // 클라이언트가 보내준 전체 대화 기록 (꼬리질문 포함)
      {
        role: "user",
        content:
          "대화가 끝났어. 나를 위한 최종 조언과 구체적인 행동 지침을 줘.",
      }, // Trigger Message
    ];

    // 2. GPT 호출
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiContent = completion.choices[0].message.content;
    if (!aiContent) throw new Error("AI 응답 오류");

    const adviceData = JSON.parse(aiContent);

    // 3. 응답 전송
    res.status(200).json(adviceData);
  } catch (error) {
    console.error("Advice Error:", error);
    res.status(500).json({ message: "조언 생성 실패", error });
  }
};
