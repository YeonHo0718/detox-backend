import { Router, Request, Response } from "express";
import {
  getAdvice,
  getFirstQuestion,
  getNextQuestion,
} from "../controllers/chatController";

const router = Router();

router.post("/first-question", getFirstQuestion);
router.post("/next-question", getNextQuestion);
router.post("/advice", getAdvice);

export default router;
