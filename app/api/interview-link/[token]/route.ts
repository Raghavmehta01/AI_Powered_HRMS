import { findLinkByToken } from "@/lib/dataStore";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const link = await findLinkByToken(token);

    if (!link) {
      return new Response(
        JSON.stringify({ error: "Link not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        candidateName: link.candidateName,
        candidateEmail: link.candidateEmail,
        jobRole: link.jobRole,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching link:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
