import { Router, Request, Response } from "express";

const router = Router();

router.get("", (req: Request, res: Response) => {
  res.send(`
    <p> <a href = '/api/gpt/first-question'> /api/gpt/first-question </a> </p>
    <p> <a href = '/api/gpt/next-question'> /api/gpt/next-question </a> </p>
    <p> <a href = '/api/gpt/advice'> /api/gpt/advice </a> </p>

    <p> 근데 누구세요...? </p>`);
});

export default router;
