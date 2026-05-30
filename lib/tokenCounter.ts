/**
 * Simple token counter for Azure OpenAI
 * Rough estimate: ~1 token per 4 characters for English text
 * Azure charges: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
 */

export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function estimateCost(inputTokens: number, outputTokens: number): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  totalTokens: number;
} {
  const INPUT_COST_PER_1K = 0.0015; // Azure GPT-4 pricing
  const OUTPUT_COST_PER_1K = 0.002;

  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    totalTokens: inputTokens + outputTokens,
  };
}

export function logTokenUsage(
  label: string,
  prompt: string,
  response: string = ""
): void {
  const promptTokens = estimateTokens(prompt);
  const responseTokens = estimateTokens(response);
  const { totalCost } = estimateCost(promptTokens, responseTokens);

  console.log(`📊 [${label}]
  📥 Input: ${promptTokens} tokens
  📤 Output: ${responseTokens} tokens
  💰 Cost: $${totalCost.toFixed(6)}
  `);
}
