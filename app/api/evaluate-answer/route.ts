import { buildScoringPrompt } from "@/lib/scoringPrompt";
import { streamAzure } from "@/lib/azure";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { domain, question, answer } = await req.json();

    if (!domain || !question || !answer) {
      return new Response(
        JSON.stringify({ error: "Missing domain, question, or answer" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const scoringPrompt = buildScoringPrompt(domain, question, answer);
    console.log("🎯 Evaluating answer...");

    let stream: ReadableStream<string>;
    try {
      stream = await streamAzure(scoringPrompt);
    } catch (error) {
      console.error("Failed to initialize evaluation stream:", error);
      throw new Error(`Stream initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    let fullResponse = "";
    try {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += value;
      }
    } catch (error) {
      console.error("Error reading response stream:", error);
      throw new Error(`Failed to read evaluation response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log("📊 Raw response:", fullResponse);

    // Extract JSON from response
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in response:", fullResponse);
      throw new Error("Evaluation response was not in expected JSON format");
    }

    let scoreData;
    try {
      scoreData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Failed to parse JSON:", jsonMatch[0], error);
      throw new Error(`Invalid JSON in evaluation response: ${error instanceof Error ? error.message : 'Parse error'}`);
    }

    return new Response(
      JSON.stringify({
        score: Math.min(Math.max(scoreData.score, 0), 10), // Clamp 0-10
        reason: scoreData.reason || "",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Evaluation API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Evaluation failed",
        score: 5, // Default middle score on error
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
