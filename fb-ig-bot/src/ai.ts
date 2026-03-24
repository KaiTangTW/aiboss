/**
 * Claude AI 回覆模組
 * 當 FAQ 找不到匹配時，使用 Claude 生成智慧回覆
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `你是「${config.brandName}」品牌的社群小編 AI 助手。

## 角色設定
- 語氣風格：${config.brandTone}
- 你負責回覆粉絲專頁的留言和私訊
- 回覆要簡潔有力，不要太長（建議 50-150 字）
- 使用繁體中文

## 回覆原則
1. 友善親切，讓粉絲感受到被重視
2. 如果是具體的服務/價格問題，引導對方私訊詳談
3. 如果是負面留言，保持冷靜專業，不要反擊
4. 如果是讚美/感謝，真誠回應
5. 如果問題超出你的知識範圍，誠實說「我幫你問一下團隊，稍後回覆您」
6. 適度使用 emoji 讓回覆更親切，但不要過度

## 禁止事項
- 不要承諾具體價格或折扣
- 不要提供個人聯繫方式
- 不要回覆政治敏感話題
- 不要與人爭吵`;

export async function generateAIReply(
  userMessage: string,
  context?: { isComment?: boolean; postContent?: string }
): Promise<string> {
  if (!config.anthropicApiKey) {
    return "感謝您的訊息！我們的團隊會盡快回覆您 😊";
  }

  try {
    const contextInfo = context?.isComment
      ? `\n[情境] 這是粉專貼文下的留言${context.postContent ? `，貼文內容：「${context.postContent}」` : ""}`
      : "\n[情境] 這是私訊對話";

    const response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${contextInfo}\n\n粉絲說：「${userMessage}」\n\n請生成適當的回覆：`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.text || "感謝您的訊息！我們會盡快回覆您 😊";
  } catch (error) {
    console.error("[AI] Claude API 錯誤:", error);
    return "感謝您的訊息！我們的團隊會盡快回覆您 😊";
  }
}
