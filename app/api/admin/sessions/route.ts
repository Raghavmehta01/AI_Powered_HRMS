import { readSessions } from "@/lib/dataStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authHeader = req.headers.get("x-admin-password");

    if (!adminPassword || authHeader !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessions = await readSessions();

    return new Response(
      JSON.stringify(sessions),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error reading sessions:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
