export function buildScoringPrompt(
  domain: string,
  question: string,
  answer: string
): string {
  return `You are an expert technical interviewer evaluating a candidate's response.

Domain: ${domain}
Question: "${question}"
Answer: "${answer}"

Evaluate this answer on a scale of 0-10 considering:
- Accuracy and correctness
- Completeness of response
- Clarity of explanation
- Depth of understanding
- Relevance to the question

Respond with ONLY a JSON object in this format:
{
  "score": <number 0-10>,
  "reason": "<brief explanation of the score>"
}

Example response:
{"score": 7, "reason": "Good understanding of core concepts with minor gaps in edge cases"}`;
}
