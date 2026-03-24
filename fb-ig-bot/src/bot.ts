/**
 * 機器人核心邏輯
 * FAQ 優先 → 找不到則用 AI 生成回覆
 */

import { faqStore } from "./faq.js";
import { generateAIReply } from "./ai.js";
import {
  replyToComment,
  sendMessengerMessage,
  replyToIGComment,
  sendIGMessage,
} from "./meta-api.js";

// 記錄已回覆的 ID，避免重複回覆
const repliedSet = new Set<string>();
const MAX_REPLIED_CACHE = 10000;

function markReplied(id: string) {
  repliedSet.add(id);
  // 防止記憶體無限增長
  if (repliedSet.size > MAX_REPLIED_CACHE) {
    const first = repliedSet.values().next().value;
    if (first) repliedSet.delete(first);
  }
}

function alreadyReplied(id: string): boolean {
  return repliedSet.has(id);
}

/** 生成回覆內容（FAQ 優先，AI fallback） */
async function getReply(
  message: string,
  context?: { isComment?: boolean; postContent?: string }
): Promise<string> {
  // 1. 先查 FAQ
  const faqMatch = faqStore.match(message);
  if (faqMatch) {
    console.log(`[Bot] FAQ 命中: ${faqMatch.id}`);
    return faqMatch.answer;
  }

  // 2. FAQ 沒命中 → 用 AI 生成
  console.log(`[Bot] FAQ 未命中，使用 AI 生成回覆`);
  return generateAIReply(message, context);
}

/** 處理 Facebook 貼文留言 */
export async function handleFBComment(event: {
  commentId: string;
  message: string;
  senderId: string;
  postId?: string;
}) {
  const { commentId, message, senderId } = event;

  if (alreadyReplied(commentId)) {
    console.log(`[Bot] 已回覆過留言 ${commentId}，跳過`);
    return;
  }

  // 過濾太短的留言（如純 emoji）
  if (message.trim().length < 2) {
    console.log(`[Bot] 留言太短，跳過: "${message}"`);
    return;
  }

  const reply = await getReply(message, { isComment: true });
  await replyToComment(commentId, reply);
  markReplied(commentId);

  console.log(`[Bot] ✅ 已回覆 FB 留言 ${commentId}`);
}

/** 處理 Facebook Messenger 私訊 */
export async function handleMessengerMessage(event: {
  senderId: string;
  messageId: string;
  message: string;
}) {
  const { senderId, messageId, message } = event;

  if (alreadyReplied(messageId)) {
    console.log(`[Bot] 已回覆過私訊 ${messageId}，跳過`);
    return;
  }

  const reply = await getReply(message, { isComment: false });
  await sendMessengerMessage(senderId, reply);
  markReplied(messageId);

  console.log(`[Bot] ✅ 已回覆 Messenger 私訊 ${messageId}`);
}

/** 處理 Instagram 留言 */
export async function handleIGComment(event: {
  commentId: string;
  message: string;
  senderId: string;
}) {
  const { commentId, message } = event;

  if (alreadyReplied(commentId)) {
    console.log(`[Bot] 已回覆過 IG 留言 ${commentId}，跳過`);
    return;
  }

  if (message.trim().length < 2) {
    console.log(`[Bot] IG 留言太短，跳過: "${message}"`);
    return;
  }

  const reply = await getReply(message, { isComment: true });
  await replyToIGComment(commentId, reply);
  markReplied(commentId);

  console.log(`[Bot] ✅ 已回覆 IG 留言 ${commentId}`);
}

/** 處理 Instagram DM */
export async function handleIGDirectMessage(event: {
  senderId: string;
  messageId: string;
  message: string;
}) {
  const { senderId, messageId, message } = event;

  if (alreadyReplied(messageId)) {
    console.log(`[Bot] 已回覆過 IG DM ${messageId}，跳過`);
    return;
  }

  const reply = await getReply(message, { isComment: false });
  await sendIGMessage(senderId, reply);
  markReplied(messageId);

  console.log(`[Bot] ✅ 已回覆 IG DM ${messageId}`);
}
