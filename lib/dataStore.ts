import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LINKS_FILE = path.join(DATA_DIR, "interview-links.json");
const SESSIONS_FILE = path.join(DATA_DIR, "interview-sessions.json");

export interface InterviewLink {
  token: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  createdAt: string;
  used: boolean;
}

export interface QAEntry {
  question: string;
  answer: string;
  score: number;
  scoreReason: string;
  timestamp: string;
}

export interface InterviewSession {
  sessionId: string;
  token: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  startedAt: string;
  completedAt: string;
  totalScore: number;
  averageScore: number;
  questions: QAEntry[];
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore if already exists
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await ensureDataDir();
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  const payload = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, payload, "utf-8");
  await fs.rename(tmpPath, filePath);
}

export async function readLinks(): Promise<InterviewLink[]> {
  try {
    const content = await fs.readFile(LINKS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function writeLinks(links: InterviewLink[]): Promise<void> {
  await writeJsonAtomic(LINKS_FILE, links);
}

export async function readSessions(): Promise<InterviewSession[]> {
  try {
    const content = await fs.readFile(SESSIONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function writeSession(session: InterviewSession): Promise<void> {
  const sessions = await readSessions();
  sessions.push(session);
  await writeJsonAtomic(SESSIONS_FILE, sessions);
}

export async function findLinkByToken(
  token: string
): Promise<InterviewLink | null> {
  const links = await readLinks();
  return links.find((link) => link.token === token) || null;
}

export async function markLinkAsUsed(token: string): Promise<void> {
  const links = await readLinks();
  const link = links.find((l) => l.token === token);
  if (link) {
    link.used = true;
    await writeLinks(links);
  }
}
