import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey } = await req.json();
    if (!prompt || !apiKey) {
      return Response.json({ error: "缺少 prompt 或 apiKey" }, { status: 400 });
    }

    const anthropic = createAnthropic({ apiKey });
    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      prompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
