/**
 * 管理後台 API
 * 用於管理 FAQ、查看機器人狀態
 */

import { Router, Request, Response } from "express";
import { faqStore } from "./faq.js";

export const adminRouter = Router();

/** 取得所有 FAQ */
adminRouter.get("/api/faq", (_req: Request, res: Response) => {
  res.json({ success: true, data: faqStore.getAll() });
});

/** 新增 FAQ */
adminRouter.post("/api/faq", (req: Request, res: Response) => {
  const { keywords, answer, category, priority } = req.body;

  if (!keywords || !answer) {
    res.status(400).json({ success: false, error: "keywords 和 answer 為必填" });
    return;
  }

  const entry = faqStore.add({
    keywords: Array.isArray(keywords) ? keywords : [keywords],
    answer,
    category,
    priority: priority ?? 0,
  });

  res.json({ success: true, data: entry });
});

/** 更新 FAQ */
adminRouter.put("/api/faq/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = faqStore.update(id, updates);
  if (!updated) {
    res.status(404).json({ success: false, error: "找不到該 FAQ" });
    return;
  }

  res.json({ success: true, data: updated });
});

/** 刪除 FAQ */
adminRouter.delete("/api/faq/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = faqStore.delete(id);

  if (!deleted) {
    res.status(404).json({ success: false, error: "找不到該 FAQ" });
    return;
  }

  res.json({ success: true });
});

/** 測試回覆（不實際發送，只回傳 bot 會怎麼回） */
adminRouter.post("/api/test-reply", async (req: Request, res: Response) => {
  const { message, isComment } = req.body;

  if (!message) {
    res.status(400).json({ success: false, error: "message 為必填" });
    return;
  }

  // 先查 FAQ
  const faqMatch = faqStore.match(message);
  if (faqMatch) {
    res.json({
      success: true,
      source: "faq",
      faqId: faqMatch.id,
      reply: faqMatch.answer,
    });
    return;
  }

  // AI fallback
  const { generateAIReply } = await import("./ai.js");
  const aiReply = await generateAIReply(message, { isComment: !!isComment });
  res.json({
    success: true,
    source: "ai",
    reply: aiReply,
  });
});

/** 機器人狀態 */
adminRouter.get("/api/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "running",
    faqCount: faqStore.getAll().length,
    uptime: process.uptime(),
  });
});
