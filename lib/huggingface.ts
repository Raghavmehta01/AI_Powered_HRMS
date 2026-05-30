const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY || "";
const HF_MODEL = "mistralai/Zephyr-7B-beta";

function validateHuggingFaceConfig(): void {
  if (!HF_API_KEY) {
    throw new Error(
      "HuggingFace LLM provider is misconfigured. Missing environment variable: HUGGING_FACE_API_KEY. " +
      "Please check your .env file and ensure HUGGING_FACE_API_KEY is set."
    );
  }
}

export async function streamHuggingFace(
  prompt: string
): Promise<ReadableStream<string>> {
  validateHuggingFaceConfig();
  console.log(`Calling Hugging Face model: ${HF_MODEL}`);

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
          do_sample: true,
        },
      }),
    }
  );

  console.log(`HF Response status: ${response.status}`);
  if (!response.ok) {
    const error = await response.text();
    console.error(`HF API error: ${response.status} - ${error}`);
    throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error("No response body from Hugging Face");
  }

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });

          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.generated_text) {
                  controller.enqueue(item.generated_text);
                }
              }
            } else if (parsed.generated_text) {
              controller.enqueue(parsed.generated_text);
            } else if (parsed.token && parsed.token.text) {
              controller.enqueue(parsed.token.text);
            }
          } catch (e) {
            if (text.trim()) {
              controller.enqueue(text);
            }
          }
        }

        controller.close();
      } catch (error) {
        console.error("Hugging Face streaming error:", error);
        controller.error(error);
      }
    },
  });
}
