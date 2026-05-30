import { writeSession, markLinkAsUsed } from "@/lib/dataStore";
import type { InterviewSession } from "@/lib/dataStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session: InterviewSession = await req.json();

    if (!session.sessionId || !session.candidateName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await writeSession(session);

    // Mark link as used if it has a token
    if (session.token) {
      await markLinkAsUsed(session.token);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
