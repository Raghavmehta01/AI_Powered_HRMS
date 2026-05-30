import { FLAGS } from "@/lib/types";
import { buildPrompt, buildSummerizerPrompt } from "@/lib/utils";
import { streamAzure } from "@/lib/azure";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { bg, flag, prompt: transcribe } = await req.json();

  let prompt: string | null = null;
  if (flag === FLAGS.COPILOT) {
    prompt = buildPrompt(bg, transcribe);
  } else if (flag === FLAGS.SUMMERIZER) {
    prompt = buildSummerizerPrompt(transcribe);
  }

  if (prompt) {
    let azureStream: ReadableStream<string>;
    try {
      azureStream = await streamAzure(prompt);
    } catch (error) {
      console.error("Azure API error:", error);
      return new Response(
        JSON.stringify({
          error: "AI service is currently unavailable. Please try again in a moment.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const reader = azureStream.getReader();
            let hasContent = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                hasContent = true;
                controller.enqueue(encoder.encode(value));
              }
            }

            if (!hasContent) {
              controller.enqueue(encoder.encode(""));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      }
    );
  }

  // Fallback response
  return new Response(JSON.stringify({ error: 'Invalid request flag' }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
