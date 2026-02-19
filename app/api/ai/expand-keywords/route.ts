import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

// ─── Prompt templates ─────────────────────────────────────────

const SEARCH_SYSTEM = `Bạn là trợ lý tìm kiếm phim chuyên nghiệp. Nhiệm vụ: phân tích câu tìm kiếm và trả về TÊN PHIM CỤ THỂ để tìm trên API phim.

Quy tắc QUAN TRỌNG:
- Trả về JSON: { "keywords": ["tên phim 1", "tên phim 2", ...], "suggestions": ["gợi ý 1", "gợi ý 2"] }
- keywords phải là TÊN PHIM cụ thể, KHÔNG phải tên diễn viên hay tên thể loại
- Nếu input là TÊN DIỄN VIÊN (ví dụ: "lư dục hiểu", "Scarlett Johansson", "Trường Hân"): trả về 5-10 tên phim nổi tiếng nhất của diễn viên đó
- Nếu input là TÊN PHIM cụ thể: giữ nguyên
- Nếu input mô tả thể loại (ví dụ: "phim kinh dị Hàn"): trả về tên phim nổi tiếng của thể loại đó
- suggestions: 2-3 gợi ý tìm kiếm liên quan
- Ưu tiên tên phim tiếng Việt nếu có, hoặc tên gốc

Ví dụ:
- Input "lư dục hiểu" → keywords: ["Vỡ tổ", "Trên nam dưới nữ", "Mỹ nhân tâm kế", "Phong vân", "Tam quốc"]
- Input "phim hay 2024" → keywords: ["Lật mặt 7", "Mai", "Đào phở và piano", "Godzilla x Kong"]
- CHỈ trả JSON, KHÔNG có text khác`;

const ACTOR_SYSTEM = `Bạn là chuyên gia điện ảnh. Nhiệm vụ: cho tên diễn viên, liệt kê phim nổi tiếng nhất mà diễn viên đó tham gia.

Quy tắc:
- Trả về JSON: { "keywords": ["tên phim 1", "tên phim 2", ...] }
- Liệt kê 5-10 phim nổi tiếng nhất
- Ưu tiên tên tiếng Việt nếu phim đã phát hành tại VN, nếu không dùng tên gốc
- CHỈ trả JSON, KHÔNG có text khác`;

// ─── Helper: call Gemini REST API ─────────────────────────────

async function callGemini(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 128,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // With thinking mode, response has multiple parts:
  // parts with thought=true are thinking, the last non-thought part is the actual output
  const parts = data.candidates?.[0]?.content?.parts || [];
  const outputPart = parts
    .filter((p: { thought?: boolean }) => !p.thought)
    .pop();
  return (
    outputPart?.text?.trim() || parts[parts.length - 1]?.text?.trim() || ""
  );
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, context } = (await req.json()) as {
      query: string;
      context: "search" | "actor";
    };

    if (!query || !context) {
      return NextResponse.json(
        { error: "Missing query or context" },
        { status: 400 },
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        keywords: [query],
        suggestions: [],
        fallback: true,
      });
    }

    const systemPrompt = context === "actor" ? ACTOR_SYSTEM : SEARCH_SYSTEM;
    const userMessage =
      context === "actor"
        ? `Diễn viên: "${query}"`
        : `Câu tìm kiếm: "${query}"`;

    const text = await callGemini(systemPrompt, userMessage);
    console.log("[AI] Raw response:", text);

    // Parse JSON response
    let parsed: { keywords: string[]; suggestions?: string[] };
    try {
      const jsonStr = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(jsonStr);
      console.log("[AI] Parsed:", JSON.stringify(parsed));
    } catch (parseErr) {
      console.error("[AI] JSON parse failed:", parseErr, "text was:", text);
      return NextResponse.json({
        keywords: [query],
        suggestions: [],
        fallback: true,
      });
    }

    return NextResponse.json({
      keywords: parsed.keywords || [query],
      suggestions: parsed.suggestions || [],
      fallback: false,
    });
  } catch (error) {
    console.error("[AI Expand Keywords]", error);
    return NextResponse.json({
      keywords: [],
      suggestions: [],
      fallback: true,
      error: "AI service unavailable",
    });
  }
}
