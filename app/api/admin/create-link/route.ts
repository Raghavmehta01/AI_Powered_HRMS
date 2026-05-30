import { readLinks, writeLinks } from "@/lib/dataStore";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authHeader = req.headers.get("x-admin-password");

    if (!adminPassword || authHeader !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { candidateName, candidateEmail, jobRole } = await req.json();

    if (!candidateName || !candidateEmail || !jobRole) {
      return new Response(
        JSON.stringify({
          error: "Missing candidateName, candidateEmail, or jobRole",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = uuidv4();
    const links = await readLinks();
    const newLink = {
      token,
      candidateName,
      candidateEmail,
      jobRole,
      createdAt: new Date().toISOString(),
      used: false,
    };
    links.push(newLink);
    await writeLinks(links);

    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/interview/${token}`;

    return new Response(
      JSON.stringify({ token, url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating link:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
