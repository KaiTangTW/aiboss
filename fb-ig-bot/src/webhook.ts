/**
 * Meta Webhook 處理
 * 接收並解析來自 Facebook / Instagram 的 webhook 事件
 */

import { Router, Request, Response } from "express";
import { config } from "./config.js";
import {
  handleFBComment,
  handleMessengerMessage,
  handleIGComment,
  handleIGDirectMessage,
} from "./bot.js";

export const webhookRouter = Router();

/**
 * GET /webhook — Meta 驗證端點
 * Meta 會在你設定 webhook 時發送驗證請求
 */
webhookRouter.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("[Webhook] ✅ 驗證成功");
    res.status(200).send(challenge);
  } else {
    console.log("[Webhook] ❌ 驗證失敗", { mode, token });
    res.sendStatus(403);
  }
});

/**
 * POST /webhook — 接收 Meta 事件
 */
webhookRouter.post("/webhook", async (req: Request, res: Response) => {
  const body = req.body;

  // Meta 要求 webhook 在 20 秒內回應 200
  res.sendStatus(200);

  try {
    if (body.object === "page") {
      // Facebook Page 事件
      for (const entry of body.entry || []) {
        await processFBPageEntry(entry);
      }
    } else if (body.object === "instagram") {
      // Instagram 事件
      for (const entry of body.entry || []) {
        await processIGEntry(entry);
      }
    } else {
      console.log(`[Webhook] 未知的 object type: ${body.object}`);
    }
  } catch (error) {
    console.error("[Webhook] 處理事件時發生錯誤:", error);
  }
});

/** 處理 Facebook Page 事件 */
async function processFBPageEntry(entry: any) {
  // 處理 Messenger 訊息
  if (entry.messaging) {
    for (const event of entry.messaging) {
      if (event.message && !event.message.is_echo) {
        console.log(`[Webhook] 📩 收到 Messenger 訊息: "${event.message.text}"`);
        await handleMessengerMessage({
          senderId: event.sender.id,
          messageId: event.message.mid,
          message: event.message.text || "",
        });
      }
    }
  }

  // 處理貼文留言
  if (entry.changes) {
    for (const change of entry.changes) {
      if (change.field === "feed" && change.value?.item === "comment") {
        const val = change.value;

        // 跳過自己的留言（避免自我回覆）
        if (val.from?.id === entry.id) {
          console.log("[Webhook] 跳過自己的留言");
          continue;
        }

        console.log(`[Webhook] 💬 收到 FB 留言: "${val.message}"`);
        await handleFBComment({
          commentId: val.comment_id,
          message: val.message || "",
          senderId: val.from?.id || "",
          postId: val.post_id,
        });
      }
    }
  }
}

/** 處理 Instagram 事件 */
async function processIGEntry(entry: any) {
  // IG Messaging (DM)
  if (entry.messaging) {
    for (const event of entry.messaging) {
      if (event.message && !event.message.is_echo) {
        console.log(`[Webhook] 📩 收到 IG DM: "${event.message.text}"`);
        await handleIGDirectMessage({
          senderId: event.sender.id,
          messageId: event.message.mid,
          message: event.message.text || "",
        });
      }
    }
  }

  // IG 留言
  if (entry.changes) {
    for (const change of entry.changes) {
      if (change.field === "comments") {
        const val = change.value;
        console.log(`[Webhook] 💬 收到 IG 留言: "${val.text}"`);
        await handleIGComment({
          commentId: val.id,
          message: val.text || "",
          senderId: val.from?.id || "",
        });
      }
    }
  }
}
