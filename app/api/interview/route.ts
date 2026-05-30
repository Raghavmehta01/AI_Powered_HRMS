import { streamAzure } from "@/lib/azure";
import { buildInterviewOpenerPrompt, buildInterviewerPrompt } from "@/lib/utils";
import { logTokenUsage, estimateTokens } from "@/lib/tokenCounter";
import { QAEntry } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { domain, history, latestAnswer, isOpener } = await req.json();

  if (!domain) {
    return new Response(JSON.stringify({ error: "domain is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = isOpener
    ? buildInterviewOpenerPrompt(domain)
    : buildInterviewerPrompt(domain, history, latestAnswer);

  // Log token usage for cost tracking
  const promptTokens = estimateTokens(prompt);
  console.log(`📊 Interview API: ${promptTokens} tokens in prompt`);

  try {
    console.log("Using Azure for interview question generation");
    const azureStream = await streamAzure(prompt);
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
              controller.enqueue(
                encoder.encode("Sorry, I could not generate a question at this time.")
              );
            }

            controller.close();
          } catch (error) {
            console.error("Azure streaming error:", error);
            try {
              controller.enqueue(
                encoder.encode(
                  `Error: ${error instanceof Error ? error.message : "Unknown streaming error"}`
                )
              );
              controller.close();
            } catch (controllerError) {
              console.error("Controller error:", controllerError);
            }
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
  } catch (error) {
    console.error("Interview API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate interview question",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
