"use client";

import { useState, useEffect } from "react";
import { elevateTheme } from "@/lib/elevateTheme";

interface InterviewSession {
  sessionId: string;
  token: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  startedAt: string;
  completedAt: string;
  totalScore: number;
  averageScore: number;
  questions: Array<{
    question: string;
    answer: string;
    score: number;
    scoreReason: string;
    timestamp: string;
  }>;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authPassword, setAuthPassword] = useState<string>("");

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch("/api/admin/sessions", {
        headers: { "x-admin-password": authPassword },
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
      alert("Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      alert("Please enter admin password");
      return;
    }

    // Validate password against server-side ADMIN_PASSWORD by calling API.
    setIsLoadingSessions(true);
    try {
      const response = await fetch("/api/admin/sessions", {
        headers: { "x-admin-password": password },
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      const data = await response.json();
      setAuthPassword(password);
      setIsAuthenticated(true);
      setSessions(data);
    } catch (error) {
      console.error("Admin login failed:", error);
      alert("Invalid password");
      setPassword("");
      setAuthPassword("");
      setIsAuthenticated(false);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const generateLink = async () => {
    if (!candidateName || !candidateEmail || !jobRole) {
      alert("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authPassword,
        },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          jobRole,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate link");

      const data = await response.json();
      setGeneratedUrl(data.url);
      setGeneratedToken(data.token);

      // Reset form
      setCandidateName("");
      setCandidateEmail("");
      setJobRole("");
    } catch (error) {
      console.error("Error generating link:", error);
      alert("Failed to generate link");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: elevateTheme.colors.background,
          padding: elevateTheme.spacing.xl,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: elevateTheme.borderRadius.lg,
            padding: elevateTheme.spacing.xl,
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              ...elevateTheme.typography.h2,
              color: elevateTheme.colors.dark,
              textAlign: "center",
              marginBottom: elevateTheme.spacing.lg,
            }}
          >
            Admin Access
          </h1>

          <div style={{ marginBottom: elevateTheme.spacing.lg }}>
            <label
              style={{
                ...elevateTheme.typography.body,
                fontWeight: 600,
                color: elevateTheme.colors.dark,
                display: "block",
                marginBottom: elevateTheme.spacing.sm,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter admin password"
              style={{
                width: "100%",
                padding: elevateTheme.spacing.md,
                borderRadius: elevateTheme.borderRadius.md,
                border: `1px solid ${elevateTheme.colors.border}`,
                ...elevateTheme.typography.body,
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: elevateTheme.spacing.md,
              background: elevateTheme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: elevateTheme.borderRadius.md,
              ...elevateTheme.typography.body,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: elevateTheme.colors.background,
        padding: elevateTheme.spacing.xl,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: elevateTheme.spacing.xl,
          }}
        >
          <h1
            style={{
              ...elevateTheme.typography.h1,
              color: elevateTheme.colors.dark,
              margin: 0,
            }}
          >
            Admin Dashboard
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: `${elevateTheme.spacing.sm} ${elevateTheme.spacing.lg}`,
              background: elevateTheme.colors.error,
              color: "white",
              border: "none",
              borderRadius: elevateTheme.borderRadius.md,
              ...elevateTheme.typography.body,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: elevateTheme.spacing.xl,
          }}
        >
          {/* Link Generator */}
          <div
            style={{
              background: "white",
              borderRadius: elevateTheme.borderRadius.lg,
              padding: elevateTheme.spacing.xl,
              border: `1px solid ${elevateTheme.colors.border}`,
            }}
          >
            <h2
              style={{
                ...elevateTheme.typography.h2,
                color: elevateTheme.colors.dark,
                marginTop: 0,
                marginBottom: elevateTheme.spacing.lg,
              }}
            >
              Generate Interview Link
            </h2>

            <div style={{ marginBottom: elevateTheme.spacing.lg }}>
              <label
                style={{
                  ...elevateTheme.typography.body,
                  fontWeight: 600,
                  color: elevateTheme.colors.dark,
                  display: "block",
                  marginBottom: elevateTheme.spacing.sm,
                }}
              >
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="John Smith"
                style={{
                  width: "100%",
                  padding: elevateTheme.spacing.md,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  ...elevateTheme.typography.body,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: elevateTheme.spacing.lg }}>
              <label
                style={{
                  ...elevateTheme.typography.body,
                  fontWeight: 600,
                  color: elevateTheme.colors.dark,
                  display: "block",
                  marginBottom: elevateTheme.spacing.sm,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: elevateTheme.spacing.md,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  ...elevateTheme.typography.body,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: elevateTheme.spacing.lg }}>
              <label
                style={{
                  ...elevateTheme.typography.body,
                  fontWeight: 600,
                  color: elevateTheme.colors.dark,
                  display: "block",
                  marginBottom: elevateTheme.spacing.sm,
                }}
              >
                Job Role / Domain
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Frontend Developer"
                style={{
                  width: "100%",
                  padding: elevateTheme.spacing.md,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  ...elevateTheme.typography.body,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={generateLink}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.body,
                fontWeight: 600,
                cursor: isGenerating ? "wait" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                marginBottom: elevateTheme.spacing.lg,
              }}
            >
              {isGenerating ? "Generating..." : "Generate Link"}
            </button>

            {generatedUrl && (
              <div
                style={{
                  background: elevateTheme.colors.lightGray,
                  padding: elevateTheme.spacing.lg,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.accentGreen}`,
                }}
              >
                <p
                  style={{
                    ...elevateTheme.typography.bodySmall,
                    color: elevateTheme.colors.textGray,
                    margin: 0,
                    marginBottom: elevateTheme.spacing.sm,
                  }}
                >
                  Interview Link
                </p>
                <div
                  style={{
                    background: "white",
                    padding: elevateTheme.spacing.md,
                    borderRadius: elevateTheme.borderRadius.md,
                    marginBottom: elevateTheme.spacing.md,
                    wordBreak: "break-all",
                    ...elevateTheme.typography.bodySmall,
                  }}
                >
                  {generatedUrl}
                </div>
                <button
                  onClick={() => copyToClipboard(generatedUrl)}
                  style={{
                    width: "100%",
                    padding: elevateTheme.spacing.sm,
                    background: elevateTheme.colors.accentGreen,
                    color: "white",
                    border: "none",
                    borderRadius: elevateTheme.borderRadius.md,
                    ...elevateTheme.typography.body,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📋 Copy Link
                </button>
              </div>
            )}
          </div>

          {/* Sessions Dashboard */}
          <div
            style={{
              background: "white",
              borderRadius: elevateTheme.borderRadius.lg,
              padding: elevateTheme.spacing.xl,
              border: `1px solid ${elevateTheme.colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: elevateTheme.spacing.lg,
              }}
            >
              <h2
                style={{
                  ...elevateTheme.typography.h2,
                  color: elevateTheme.colors.dark,
                  margin: 0,
                }}
              >
                Interview Results
              </h2>
              <button
                onClick={loadSessions}
                disabled={isLoadingSessions}
                style={{
                  padding: `${elevateTheme.spacing.sm} ${elevateTheme.spacing.md}`,
                  background: elevateTheme.colors.border,
                  color: elevateTheme.colors.primary,
                  border: `1px solid ${elevateTheme.colors.primary}`,
                  borderRadius: elevateTheme.borderRadius.md,
                  ...elevateTheme.typography.bodySmall,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isLoadingSessions ? "Loading..." : "Refresh"}
              </button>
            </div>

            {sessions.length === 0 ? (
              <p
                style={{
                  ...elevateTheme.typography.body,
                  color: elevateTheme.colors.textGray,
                  textAlign: "center",
                  padding: elevateTheme.spacing.xl,
                }}
              >
                No completed interviews yet
              </p>
            ) : (
              <div style={{ overflowY: "auto", maxHeight: "600px" }}>
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    style={{
                      background: elevateTheme.colors.lightGray,
                      borderRadius: elevateTheme.borderRadius.md,
                      padding: elevateTheme.spacing.lg,
                      marginBottom: elevateTheme.spacing.md,
                      cursor: "pointer",
                      border: `1px solid ${elevateTheme.colors.border}`,
                    }}
                    onClick={() =>
                      setExpandedSessionId(
                        expandedSessionId === session.sessionId
                          ? null
                          : session.sessionId
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            ...elevateTheme.typography.body,
                            fontWeight: 600,
                            color: elevateTheme.colors.dark,
                            margin: 0,
                          }}
                        >
                          {session.candidateName}
                        </p>
                        <p
                          style={{
                            ...elevateTheme.typography.bodySmall,
                            color: elevateTheme.colors.textGray,
                            margin: `${elevateTheme.spacing.xs} 0 0 0`,
                          }}
                        >
                          {session.jobRole} • {session.candidateEmail}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            ...elevateTheme.typography.h3,
                            color: elevateTheme.colors.primary,
                            margin: 0,
                          }}
                        >
                          {session.averageScore.toFixed(1)}/10
                        </div>
                        <p
                          style={{
                            ...elevateTheme.typography.bodySmall,
                            color: elevateTheme.colors.textGray,
                            margin: `${elevateTheme.spacing.xs} 0 0 0`,
                          }}
                        >
                          {new Date(session.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {expandedSessionId === session.sessionId && (
                      <div
                        style={{
                          marginTop: elevateTheme.spacing.lg,
                          paddingTop: elevateTheme.spacing.lg,
                          borderTop: `1px solid ${elevateTheme.colors.border}`,
                        }}
                      >
                        <p
                          style={{
                            ...elevateTheme.typography.bodySmall,
                            fontWeight: 600,
                            color: elevateTheme.colors.dark,
                            margin: 0,
                            marginBottom: elevateTheme.spacing.md,
                          }}
                        >
                          Total Score: {session.totalScore}/60
                        </p>
                        {session.questions.map((qa, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "white",
                              padding: elevateTheme.spacing.md,
                              borderRadius: elevateTheme.borderRadius.sm,
                              marginBottom: elevateTheme.spacing.md,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                                marginBottom: elevateTheme.spacing.sm,
                              }}
                            >
                              <p
                                style={{
                                  ...elevateTheme.typography.bodySmall,
                                  fontWeight: 600,
                                  color: elevateTheme.colors.dark,
                                  margin: 0,
                                }}
                              >
                                Q{idx + 1}: {qa.question.substring(0, 50)}
                                {qa.question.length > 50 ? "..." : ""}
                              </p>
                              <span
                                style={{
                                  background: elevateTheme.colors.primary,
                                  color: "white",
                                  padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.sm}`,
                                  borderRadius: elevateTheme.borderRadius.sm,
                                  ...elevateTheme.typography.bodySmall,
                                  fontWeight: 600,
                                }}
                              >
                                {qa.score}/10
                              </span>
                            </div>
                            <p
                              style={{
                                ...elevateTheme.typography.bodySmall,
                                color: elevateTheme.colors.textGray,
                                margin: 0,
                              }}
                            >
                              <strong>Answer:</strong> {qa.answer.substring(0, 80)}
                              {qa.answer.length > 80 ? "..." : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
