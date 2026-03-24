/**
 * FAQ 資料庫 — 關鍵字比對自動回覆
 * 可透過 API 動態新增/編輯/刪除
 */

export interface FaqEntry {
  id: string;
  keywords: string[];      // 觸發關鍵字（任一命中即回覆）
  answer: string;           // 回覆內容
  category?: string;        // 分類（選填）
  priority?: number;        // 優先級，數字越大越優先（預設 0）
}

// 預設 FAQ（可依品牌需求修改）
const defaultFaqs: FaqEntry[] = [
  {
    id: "faq_price",
    keywords: ["價格", "多少錢", "費用", "收費", "報價", "價位"],
    answer: "感謝您的詢問！關於價格方面，因為每個案子的需求不同，麻煩您私訊我們，我們會盡快為您提供詳細報價 😊",
    category: "價格",
    priority: 10,
  },
  {
    id: "faq_contact",
    keywords: ["聯絡", "電話", "信箱", "email", "怎麼聯繫", "聯繫方式"],
    answer: "您可以透過以下方式聯繫我們：\n📩 私訊本粉專\n📧 Email: service@kaitang.tw\n我們會盡快回覆您！",
    category: "聯絡",
    priority: 5,
  },
  {
    id: "faq_service",
    keywords: ["服務", "項目", "做什麼", "業務", "提供什麼"],
    answer: "我們提供品牌策略、整合行銷、社群經營、活動企劃等服務。想了解更多細節，歡迎私訊我們聊聊您的需求！",
    category: "服務",
    priority: 5,
  },
  {
    id: "faq_collab",
    keywords: ["合作", "業配", "邀約", "代言", "聯名"],
    answer: "感謝您的合作邀約！請將合作提案寄到我們的信箱，或直接私訊說明合作內容，我們會儘速回覆 🙏",
    category: "合作",
    priority: 5,
  },
  {
    id: "faq_thanks",
    keywords: ["謝謝", "感謝", "感恩", "thx", "thanks"],
    answer: "不客氣！有任何問題隨時都可以問我們 😊",
    category: "回應",
    priority: 1,
  },
];

class FaqStore {
  private faqs: FaqEntry[] = [...defaultFaqs];

  /** 根據訊息內容比對 FAQ，回傳最佳匹配 */
  match(message: string): FaqEntry | null {
    const normalized = message.toLowerCase().trim();
    const matches: FaqEntry[] = [];

    for (const faq of this.faqs) {
      const hit = faq.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
      if (hit) {
        matches.push(faq);
      }
    }

    if (matches.length === 0) return null;

    // 依 priority 排序，回傳最高優先級
    matches.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return matches[0];
  }

  /** 取得所有 FAQ */
  getAll(): FaqEntry[] {
    return [...this.faqs];
  }

  /** 新增 FAQ */
  add(entry: Omit<FaqEntry, "id">): FaqEntry {
    const id = `faq_${Date.now()}`;
    const newEntry: FaqEntry = { id, ...entry };
    this.faqs.push(newEntry);
    return newEntry;
  }

  /** 更新 FAQ */
  update(id: string, updates: Partial<Omit<FaqEntry, "id">>): FaqEntry | null {
    const idx = this.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.faqs[idx] = { ...this.faqs[idx], ...updates };
    return this.faqs[idx];
  }

  /** 刪除 FAQ */
  delete(id: string): boolean {
    const idx = this.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.faqs.splice(idx, 1);
    return true;
  }
}

export const faqStore = new FaqStore();
