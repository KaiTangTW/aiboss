/**
 * Meta Graph API 操作模組
 * 負責與 Facebook / Instagram 的 API 互動
 */

import { config } from "./config.js";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

interface GraphApiResponse {
  success?: boolean;
  id?: string;
  error?: { message: string; type: string; code: number };
}

async function callGraphApi(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, string>
): Promise<GraphApiResponse> {
  const url = `${GRAPH_API_BASE}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (method === "POST" && body) {
    options.body = JSON.stringify({
      ...body,
      access_token: config.pageAccessToken,
    });
  }

  try {
    const fullUrl =
      method === "GET"
        ? `${url}${url.includes("?") ? "&" : "?"}access_token=${config.pageAccessToken}`
        : url;

    const res = await fetch(fullUrl, options);
    const data = (await res.json()) as GraphApiResponse;

    if (data.error) {
      console.error(`[Meta API] 錯誤:`, data.error);
    }

    return data;
  } catch (error) {
    console.error(`[Meta API] 請求失敗:`, error);
    return { error: { message: String(error), type: "NetworkError", code: -1 } };
  }
}

/** 回覆 Facebook 貼文留言 */
export async function replyToComment(commentId: string, message: string) {
  console.log(`[FB] 回覆留言 ${commentId}: ${message.substring(0, 50)}...`);
  return callGraphApi(`/${commentId}/comments`, "POST", { message });
}

/** 發送 Messenger 私訊 */
export async function sendMessage(recipientId: string, message: string) {
  console.log(`[Messenger] 發送私訊給 ${recipientId}: ${message.substring(0, 50)}...`);
  return callGraphApi("/me/messages", "POST", {
    recipient: JSON.stringify({ id: recipientId }),
    messaging_type: "RESPONSE",
    message: JSON.stringify({ text: message }),
  } as any);
}

/** 發送 Messenger 私訊（正確格式） */
export async function sendMessengerMessage(recipientId: string, message: string) {
  console.log(`[Messenger] 發送私訊給 ${recipientId}`);

  const url = `${GRAPH_API_BASE}/me/messages?access_token=${config.pageAccessToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text: message },
      }),
    });

    const data = (await res.json()) as GraphApiResponse;
    if (data.error) {
      console.error(`[Messenger] 發送失敗:`, data.error);
    }
    return data;
  } catch (error) {
    console.error(`[Messenger] 請求失敗:`, error);
    return { error: { message: String(error), type: "NetworkError", code: -1 } };
  }
}

/** 回覆 Instagram 留言 */
export async function replyToIGComment(commentId: string, message: string) {
  console.log(`[IG] 回覆留言 ${commentId}: ${message.substring(0, 50)}...`);
  return callGraphApi(`/${commentId}/replies`, "POST", { message });
}

/** 發送 Instagram DM */
export async function sendIGMessage(recipientId: string, message: string) {
  console.log(`[IG DM] 發送私訊給 ${recipientId}`);

  const url = `${GRAPH_API_BASE}/me/messages?access_token=${config.pageAccessToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text: message },
      }),
    });

    const data = (await res.json()) as GraphApiResponse;
    if (data.error) {
      console.error(`[IG DM] 發送失敗:`, data.error);
    }
    return data;
  } catch (error) {
    console.error(`[IG DM] 請求失敗:`, error);
    return { error: { message: String(error), type: "NetworkError", code: -1 } };
  }
}
