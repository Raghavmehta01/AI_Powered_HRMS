import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildPrompt(bg: string | undefined, conversation: string) {
  return `You are an expert AI interview assistant helping with technical interview questions. Provide clear, concise, and helpful responses based on your knowledge.

${bg ? `Background Context: ${bg}` : ''}

Recent Interview Conversation:
${conversation}

Provide a helpful response:`;
}

export function buildKnowledgeCheckPrompt(conversation: string) {
  return `You are an AI assistant that needs to determine if you have sufficient knowledge to answer a question.

Conversation: ${conversation}

Analyze this conversation and determine:
1. Is there a clear question being asked?
2. Do you have sufficient knowledge to provide a comprehensive answer?
3. Or would you need external documents/context to give a complete response?

Respond with ONLY one of these formats:
- "KNOWN: [brief answer preview]" - if you can answer comprehensively
- "NEED_CONTEXT: [what specific information you need]" - if you need external sources

Examples:
- For "What is React?" → "KNOWN: React is a JavaScript library..."
- For "What's my GPA?" → "NEED_CONTEXT: Personal academic information"
- For "Company policy on remote work?" → "NEED_CONTEXT: Specific company policies"`;
}

export function buildRAGPrompt(bg: string | undefined, conversation: string, extractedQuestion: string, context: string) {
  return `You are an expert AI interview assistant. Use the provided context along with your knowledge to give the most comprehensive and accurate answer possible.

Context Information:
${context}

${bg ? `Background: ${bg}` : ''}

Question: ${extractedQuestion}

Provide a clear, comprehensive response using both the context and your expertise:`;
}

export function buildSummerizerPrompt(text: string) {
  return `You are a summerizer. You are summarizing the given text. Summarize the following text. Only write summary.
Content:
${text}
Summary:
`;
}

export function buildInterviewOpenerPrompt(domain: string) {
  return `You are an expert technical interviewer. Your job is to conduct a professional ${domain} interview.

Ask a single opening question to begin the interview. The question should:
- Be a strong, open-ended question appropriate for a ${domain} role
- Not be too easy or too hard — start at a mid-level to gauge the candidate
- Be specific enough to require a substantive answer (not "tell me about yourself")

Examples of good opening questions for context:
- For React developer: "Walk me through how you'd architect a React application that needs to share complex state across many components."
- For ML engineer: "Explain the difference between bias and variance and how you'd approach diagnosing which is causing poor model performance."

Respond with ONLY the question. No preamble, no "Sure!", no explanation.`;
}

export function buildInterviewerPrompt(domain: string, history: Array<{ question: string; answer: string }>, latestAnswer: string) {
  // COST OPTIMIZATION: Only include last 2 questions to reduce token usage
  const recentHistory = history.slice(-2);
  const historyText = recentHistory
    .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
    .join("\n\n");

  const questionNum = history.length + 1;
  let difficultyHint = "";
  if (questionNum >= 8) {
    difficultyHint = "\n- Focus on system design or architecture thinking";
  } else if (questionNum >= 5) {
    difficultyHint = "\n- Increase difficulty and probe deeper";
  }

  return `Expert ${domain} interviewer. Next question based on:
${historyText ? `Recent: ${historyText}\n` : ""}
Answer: "${latestAnswer}"

Generate Q${questionNum}. Single question only.${difficultyHint}

Respond with ONLY the question.`;
}

