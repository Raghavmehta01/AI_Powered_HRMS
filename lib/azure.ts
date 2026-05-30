const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT || "";
const AZURE_API_KEY = process.env.AZURE_API_KEY || "";
const AZURE_MODEL = process.env.AZURE_MODEL || "gpt-4";
const AZURE_API_VERSION = process.env.AZURE_API_VERSION || "2025-01-01-preview";

function validateAzureConfig(): void {
  const missing: string[] = [];
  if (!AZURE_ENDPOINT) missing.push("AZURE_ENDPOINT");
  if (!AZURE_API_KEY) missing.push("AZURE_API_KEY");
  if (!AZURE_MODEL) missing.push("AZURE_MODEL");

  if (missing.length > 0) {
    throw new Error(
      `Azure LLM provider is misconfigured. Missing environment variables: ${missing.join(", ")}. ` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }
}

export async function streamAzure(prompt: string): Promise<ReadableStream<string>> {
  validateAzureConfig();
  console.log(`Calling Azure model: ${AZURE_MODEL}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  const response = await fetch(
    `${AZURE_ENDPOINT}/openai/deployments/${AZURE_MODEL}/chat/completions?api-version=${AZURE_API_VERSION}`,
    {
      headers: {
        "api-key": AZURE_API_KEY,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    }
  );

  clearTimeout(timeoutId);

  console.log(`Azure Response status: ${response.status}`);
  if (!response.ok) {
    const error = await response.text();
    console.error(`Azure API error: ${response.status} - ${error}`);
    throw new Error(`Azure API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error("No response body from Azure");
  }

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line || line === "[DONE]") continue;

            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.substring(6);
                const data = JSON.parse(jsonStr);

                if (
                  data.choices &&
                  data.choices[0] &&
                  data.choices[0].delta &&
                  data.choices[0].delta.content
                ) {
                  controller.enqueue(data.choices[0].delta.content);
                }
              } catch (e) {
                // Skip parsing errors
              }
            }
          }
        }

        controller.close();
      } catch (error) {
        console.error("Azure streaming error:", error);
        controller.error(error);
      }
    },
  });
}
