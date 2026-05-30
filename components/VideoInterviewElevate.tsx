"use client";

import { useEffect, useRef, useState } from "react";
import { elevateTheme } from "@/lib/elevateTheme";
import { WebSpeechRecognizer } from "@/lib/webSpeechAPI";
import { ProctoringMonitor } from "@/lib/proctoring";
import CameraCapture from "./CameraCapture";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

interface QAEntry {
  question: string;
  answer: string;
  score: number;
  scoreReason: string;
  timestamp: string;
}

interface InterviewSession {
  domain: string;
  startedAt: string;
  history: QAEntry[];
}

interface VideoInterviewElevateProps {
  candidateName?: string;
  candidateEmail?: string;
  initialDomain?: string;
  token?: string;
}

const TOTAL_QUESTIONS = 6;
const CATEGORIES = {
  Technical: { target: 5, current: 0 },
  Behavioral: { target: 2, current: 0 },
  Scenario: { target: 1, current: 0 },
};

export default function VideoInterviewElevate({
  candidateName = "Candidate",
  candidateEmail = "",
  initialDomain = "",
  token = "",
}: VideoInterviewElevateProps) {
  const [phase, setPhase] = useState<"setup" | "interview" | "report">(
    initialDomain ? "interview" : "setup"
  );
  const [domain, setDomain] = useState(initialDomain);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sessionId] = useState(uuidv4());
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<QAEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState("");
  const [liveInsights, setLiveInsights] = useState({
    clarity: 0,
    depth: 0,
    confidence: 0,
  });
  const [proctoringViolations, setProctoringViolations] = useState(0);
  const [showProctoringWarning, setShowProctoringWarning] = useState(false);
  const [proctoringMessage, setProctoringMessage] = useState("");
  const [proctoringEnabled] = useState(
    process.env.NEXT_PUBLIC_ENABLE_PROCTORING === "true"
  );

  const recognizerRef = useRef<WebSpeechRecognizer | null>(null);
  const proctoringRef = useRef<ProctoringMonitor | null>(null);
  const sessionRef = useRef<InterviewSession>({
    domain: "",
    startedAt: new Date().toISOString(),
    history: [],
  });

  useEffect(() => {
    // Initialize proctoring only if enabled
    if (proctoringEnabled && !proctoringRef.current) {
      proctoringRef.current = new ProctoringMonitor();
      console.log("✅ Proctoring enabled");
    } else if (!proctoringEnabled) {
      console.log("⊘ Proctoring disabled");
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [proctoringEnabled]);

  // Auto-start interview if initialDomain is provided
  useEffect(() => {
    if (initialDomain && phase === "interview" && questionNumber === 0) {
      startInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDomain]);

  // Save session when report phase is reached
  useEffect(() => {
    if (phase === "report" && sessionHistory.length > 0) {
      saveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Monitor proctoring violations - Only if proctoring is enabled
  useEffect(() => {
    if (!proctoringEnabled) return;

    const interval = setInterval(() => {
      if (proctoringRef.current && phase === "interview") {
        const stats = proctoringRef.current.getStats();
        setProctoringViolations(stats.totalViolations);

        if (stats.totalViolations > 0) {
          const recentEvents = stats.events.slice(-1);
          if (recentEvents.length > 0) {
            setProctoringMessage(recentEvents[0].message);
            setShowProctoringWarning(true);
            setTimeout(() => setShowProctoringWarning(false), 5000);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, proctoringEnabled]);

  const startInterview = async () => {
    if (!domain.trim()) {
      alert("Please select a role/domain");
      return;
    }

    sessionRef.current = {
      domain,
      startedAt: new Date().toISOString(),
      history: [],
    };

    setPhase("interview");
    setQuestionNumber(1);
    setIsRecording(true);
    setTranscript("");
    setInterimTranscript("");

    // Initialize recognizer
    try {
      if (!recognizerRef.current) {
        recognizerRef.current = new WebSpeechRecognizer();
      }

      // Set callbacks BEFORE starting
      recognizerRef.current.onFinal = (finalText) => {
        console.log("🎙️ Final text received:", finalText);
        setTranscript((prev) => (prev + " " + finalText).trim());
        setIsSpeaking(false);
      };

      recognizerRef.current.onInterim = (interimText) => {
        console.log("🎙️ Interim text:", interimText);
        setInterimTranscript(interimText);
        setIsSpeaking(interimText.length > 0);
      };

      recognizerRef.current.onError = (error) => {
        console.error("❌ Speech recognition error:", error);
        if (error !== "aborted" && error !== "network") {
          alert(`Microphone error: ${error}\n\nPlease grant microphone permission and try again.`);
        }
      };

      // Start listening
      recognizerRef.current.start();
      console.log("✅ Speech recognition started");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      alert("Failed to start microphone. Please check permissions.");
    }

    // Generate first question
    await generateQuestion(true);
  };

  const generateQuestion = async (isOpener = false) => {
    setIsGeneratingQuestion(true);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          history: sessionHistory,
          latestAnswer: transcript,
          isOpener,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate question");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let fullQuestion = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullQuestion += new TextDecoder().decode(value);
      }

      setCurrentQuestion(fullQuestion.trim());
    } catch (error) {
      console.error("Error generating question:", error);
      alert("Failed to generate question. Please try again.");
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const getAnswerText = () =>
    `${transcript}${interimTranscript ? ` ${interimTranscript}` : ""}`.trim();

  const submitAnswer = async () => {
    const answerText = getAnswerText();
    if (!answerText) {
      alert("Please provide an answer before submitting");
      return;
    }

    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          question: currentQuestion,
          answer: answerText,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate answer");

      const data = await response.json();
      const qaEntry: QAEntry = {
        question: currentQuestion,
        answer: answerText,
        score: data.score || 0,
        scoreReason: data.reason || "",
        timestamp: new Date().toISOString(),
      };

      const newHistory = [...sessionHistory, qaEntry];
      setSessionHistory(newHistory);
      sessionRef.current.history = newHistory;

      // Calculate live insights from evaluation score and response quality
      const scoreNormalized = Math.min(10, (data.score || 0) * 2);
      const clarityScore = Math.min(10, answerText.length / 50);
      const depthScore = Math.min(10, answerText.split(" ").length / 20);
      setLiveInsights({
        clarity: Math.round(clarityScore),
        depth: Math.round(depthScore),
        confidence: Math.round(scoreNormalized),
      });

      // Check if interview is complete
      if (questionNumber >= TOTAL_QUESTIONS) {
        setPhase("report");
        if (recognizerRef.current) {
          recognizerRef.current.stop();
        }
      } else {
        // Reset for next question
        setQuestionNumber(questionNumber + 1);
        setTranscript("");
        setInterimTranscript("");
        await generateQuestion(false);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveSession = async () => {
    const totalScore = sessionHistory.reduce((sum, qa) => sum + qa.score, 0);
    const averageScore =
      sessionHistory.length > 0
        ? parseFloat((totalScore / sessionHistory.length).toFixed(2))
        : 0;

    const proctoringStats = proctoringRef.current?.getStats();

    const session = {
      sessionId,
      token,
      candidateName,
      candidateEmail,
      jobRole: domain,
      startedAt: sessionRef.current.startedAt,
      completedAt: new Date().toISOString(),
      totalScore,
      averageScore,
      questions: sessionHistory,
      proctoring: proctoringStats && {
        totalViolations: proctoringStats.totalViolations,
        tabSwitches: proctoringStats.tabSwitches,
        copyPasteAttempts: proctoringStats.copyPasteAttempts,
        faceDetectionFailures: proctoringStats.faceDetectionFailures,
      },
    };

    try {
      const response = await fetch("/api/sessions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        console.error("Failed to save session");
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const downloadReport = () => {
    const report = {
      domain: sessionRef.current.domain,
      startedAt: sessionRef.current.startedAt,
      completedAt: new Date().toISOString(),
      totalQuestions: TOTAL_QUESTIONS,
      totalScore: sessionHistory.reduce((sum, qa) => sum + qa.score, 0),
      averageScore: (sessionHistory.reduce((sum, qa) => sum + qa.score, 0) / sessionHistory.length).toFixed(2),
      questions: sessionHistory,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = Math.round((sessionHistory.length / TOTAL_QUESTIONS) * 100);
  const totalScore = sessionHistory.reduce((sum, qa) => sum + qa.score, 0);
  const averageScore = sessionHistory.length > 0 ? (totalScore / sessionHistory.length).toFixed(1) : "0";

  // Setup Phase
  if (phase === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: elevateTheme.colors.background, padding: elevateTheme.spacing.xl }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: elevateTheme.spacing.xl }}>
          <div style={{ background: "white", borderRadius: elevateTheme.borderRadius.lg, padding: elevateTheme.spacing.xl }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.dark, textAlign: "center", marginBottom: elevateTheme.spacing.lg }}>
              Start Your Interview
            </h1>

            <div style={{ marginBottom: elevateTheme.spacing.lg }}>
              <label style={{ ...elevateTheme.typography.body, fontWeight: 600, color: elevateTheme.colors.dark, display: "block", marginBottom: elevateTheme.spacing.sm }}>
                Select Your Role/Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., Frontend Developer, Full Stack Engineer, Data Scientist"
                style={{
                  width: "100%",
                  padding: elevateTheme.spacing.md,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  ...elevateTheme.typography.body,
                  boxSizing: "border-box",
                }}
              />
              <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, marginTop: elevateTheme.spacing.sm }}>
                Choose the position or technical domain for your interview
              </p>
            </div>

            <div style={{ background: elevateTheme.colors.lightGray, padding: elevateTheme.spacing.lg, borderRadius: elevateTheme.borderRadius.md, marginBottom: elevateTheme.spacing.lg }}>
              <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, margin: 0 }}>
                📋 <strong>Interview Format:</strong> You will be asked {TOTAL_QUESTIONS} questions. Each answer will be evaluated on a 0-10 scale.
              </p>
            </div>

            <button
              onClick={startInterview}
              style={{
                width: "100%",
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.h3,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.background = elevateTheme.colors.primaryDark;
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.background = elevateTheme.colors.primary;
              }}
            >
              Begin Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview Phase
  if (phase === "interview") {
    return (
      <div style={{ minHeight: "100vh", background: elevateTheme.colors.background }}>
        {/* Header */}
        <div
          style={{
            background: "white",
            borderBottom: `1px solid ${elevateTheme.colors.border}`,
            padding: `${elevateTheme.spacing.md} ${elevateTheme.spacing.xl}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ ...elevateTheme.typography.h2, color: elevateTheme.colors.dark, margin: 0 }}>AI Interview</h1>
            <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: `${elevateTheme.spacing.xs} 0 0 0` }}>
              {candidateName && candidateName !== "Candidate"
                ? `Candidate: ${candidateName} | Role: ${domain}`
                : `Role: ${domain}`}
            </p>
          </div>
          <button
            onClick={() => {
              if (recognizerRef.current) recognizerRef.current.stop();
              setPhase("report");
            }}
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
            End Interview
          </button>
        </div>

        <div style={{ padding: elevateTheme.spacing.xl, maxWidth: "1400px", margin: "0 auto" }}>
          {/* Proctoring Warning - Only show if enabled */}
          {proctoringEnabled && showProctoringWarning && (
            <div
              style={{
                background: "rgba(197, 83, 74, 0.95)",
                color: "white",
                padding: elevateTheme.spacing.lg,
                borderRadius: elevateTheme.borderRadius.lg,
                marginBottom: elevateTheme.spacing.lg,
                display: "flex",
                alignItems: "center",
                gap: elevateTheme.spacing.md,
              }}
            >
              <span style={{ fontSize: "24px" }}>⚠️</span>
              <div>
                <strong>Proctoring Alert</strong>
                <p style={{ margin: `${elevateTheme.spacing.xs} 0 0 0` }}>
                  {proctoringMessage}
                </p>
              </div>
            </div>
          )}

          {/* Camera Feed at Top - Only show if proctoring enabled */}
          {proctoringEnabled && (
            <div style={{ marginBottom: elevateTheme.spacing.xl }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: elevateTheme.spacing.md,
                  marginBottom: elevateTheme.spacing.md,
                }}
              >
                <h3
                  style={{
                    ...elevateTheme.typography.h3,
                    color: elevateTheme.colors.dark,
                    margin: 0,
                  }}
                >
                  📷 Your Camera
                </h3>
                {proctoringViolations > 0 && (
                  <span
                    style={{
                      background: elevateTheme.colors.error,
                      color: "white",
                      padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.md}`,
                      borderRadius: elevateTheme.borderRadius.sm,
                      ...elevateTheme.typography.bodySmall,
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {proctoringViolations} violation{proctoringViolations !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <CameraCapture proctoringMonitor={proctoringRef.current || undefined} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: elevateTheme.spacing.lg, marginBottom: elevateTheme.spacing.xl }}>
            {/* Left Column - Progress & Categories */}
            <div>
              {/* Progress Circle */}
              <div
                style={{
                  background: "white",
                  borderRadius: elevateTheme.borderRadius.lg,
                  padding: elevateTheme.spacing.lg,
                  marginBottom: elevateTheme.spacing.lg,
                  textAlign: "center",
                  border: `1px solid ${elevateTheme.colors.border}`,
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: `conic-gradient(${elevateTheme.colors.primary} 0deg ${progressPercentage * 3.6}deg, ${elevateTheme.colors.border} ${progressPercentage * 3.6}deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      background: "white",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.primary, margin: 0 }}>{progressPercentage}%</div>
                    <div style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                      {sessionHistory.length}/{TOTAL_QUESTIONS}
                    </div>
                  </div>
                </div>
                <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, marginTop: elevateTheme.spacing.md, margin: 0 }}>
                  Questions Completed
                </p>
              </div>

              {/* Categories */}
              <div
                style={{
                  background: "white",
                  borderRadius: elevateTheme.borderRadius.lg,
                  padding: elevateTheme.spacing.lg,
                  border: `1px solid ${elevateTheme.colors.border}`,
                }}
              >
                <h3 style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, marginBottom: elevateTheme.spacing.md, margin: 0 }}>
                  Category Breakdown
                </h3>
                {Object.entries(CATEGORIES).map(([category, data]) => (
                  <div key={category} style={{ marginBottom: elevateTheme.spacing.md }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: elevateTheme.spacing.xs }}>
                      <span style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.dark, fontWeight: 600 }}>{category}</span>
                      <span style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.primary }}>
                        {data.current}/{data.target}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: elevateTheme.colors.border,
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(data.current / data.target) * 100}%`,
                          background: elevateTheme.colors.accentGreen,
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Question & Transcript */}
            <div>
              {/* Current Question */}
              <div
                style={{
                  background: "white",
                  borderRadius: elevateTheme.borderRadius.lg,
                  padding: elevateTheme.spacing.lg,
                  marginBottom: elevateTheme.spacing.lg,
                  border: `2px solid ${elevateTheme.colors.primary}`,
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.primary, fontWeight: 600, marginBottom: elevateTheme.spacing.sm }}>
                  Question {questionNumber}/{TOTAL_QUESTIONS}
                </div>

                {isGeneratingQuestion ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", marginBottom: elevateTheme.spacing.md }}>⏳</div>
                    <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, margin: 0 }}>
                      Generating your question...
                    </p>
                  </div>
                ) : (
                  <div style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.dark, margin: 0 }}>
                    <ReactMarkdown>{currentQuestion || "Loading question..."}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Transcript Display */}
              <div
                style={{
                  background: "white",
                  borderRadius: elevateTheme.borderRadius.lg,
                  padding: elevateTheme.spacing.lg,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  minHeight: "120px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: elevateTheme.spacing.sm }}>
                  <h4 style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, margin: 0 }}>
                    Your Answer
                  </h4>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: elevateTheme.spacing.xs,
                    padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.md}`,
                    background: isRecording ? elevateTheme.colors.accentGreen : elevateTheme.colors.error,
                    color: "white",
                    borderRadius: elevateTheme.borderRadius.sm,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "white",
                      animation: isRecording ? "blink 1s infinite" : "none",
                    }} />
                    {isRecording ? "🎤 Recording" : "⚠️ Not Recording"}
                  </div>
                </div>
                <div style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.dark, lineHeight: "1.6", minHeight: "60px" }}>
                  {transcript || <span style={{ color: elevateTheme.colors.textGray }}>🎤 Listening for your voice...</span>}
                  {interimTranscript && (
                    <span style={{ color: elevateTheme.colors.primary, fontStyle: "italic" }}>
                      {" "}
                      {interimTranscript}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: elevateTheme.spacing.lg }}>
            {/* Notes */}
            <div
              style={{
                background: "white",
                borderRadius: elevateTheme.borderRadius.lg,
                padding: elevateTheme.spacing.lg,
                border: `1px solid ${elevateTheme.colors.border}`,
              }}
            >
              <h4 style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, marginBottom: elevateTheme.spacing.sm, margin: 0 }}>
                My Notes
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down anything you'd like to remember about this interview..."
                style={{
                  width: "100%",
                  height: "100px",
                  padding: elevateTheme.spacing.sm,
                  borderRadius: elevateTheme.borderRadius.md,
                  border: `1px solid ${elevateTheme.colors.border}`,
                  ...elevateTheme.typography.body,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "none",
                }}
              />
            </div>

            {/* Live Insights */}
            <div
              style={{
                background: "white",
                borderRadius: elevateTheme.borderRadius.lg,
                padding: elevateTheme.spacing.lg,
                border: `1px solid ${elevateTheme.colors.border}`,
              }}
            >
              <h4 style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, marginBottom: elevateTheme.spacing.md, margin: 0 }}>
                Live Insights
              </h4>
              {["Clarity", "Depth", "Confidence"].map((metric) => (
                <div key={metric} style={{ marginBottom: elevateTheme.spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: elevateTheme.spacing.xs }}>
                    <span style={{ ...elevateTheme.typography.bodySmall, fontWeight: 600, color: elevateTheme.colors.dark }}>{metric}</span>
                    <span style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.primary }}>
                      {liveInsights[metric.toLowerCase() as keyof typeof liveInsights]}/10
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: elevateTheme.colors.border, borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(liveInsights[metric.toLowerCase() as keyof typeof liveInsights] / 10) * 100}%`,
                        background: elevateTheme.colors.accentOrange,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: elevateTheme.spacing.lg, marginTop: elevateTheme.spacing.xl }}>
            <button
              onClick={() => {
                setQuestionNumber(questionNumber + 1);
                setTranscript("");
                setInterimTranscript("");
                generateQuestion();
              }}
              style={{
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.border,
                color: elevateTheme.colors.textGray,
                border: "none",
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.body,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ⏭️ Skip Question
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.border,
                color: elevateTheme.colors.textGray,
                border: "none",
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.body,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>

            <button
              onClick={() => alert("💡 Take a moment to think. There are no perfect answers. Focus on clear explanations and relevant examples.")}
              style={{
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.border,
                color: elevateTheme.colors.textGray,
                border: "none",
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.body,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              💡 Get a Hint
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitAnswer}
            disabled={isEvaluating || isGeneratingQuestion}
            style={{
              width: "100%",
              marginTop: elevateTheme.spacing.xl,
              padding: elevateTheme.spacing.md,
              background: elevateTheme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: elevateTheme.borderRadius.md,
              ...elevateTheme.typography.h3,
              fontWeight: 600,
              cursor: isEvaluating ? "wait" : "pointer",
              opacity: isEvaluating ? 0.7 : 1,
            }}
          >
            {isEvaluating ? "Evaluating Answer..." : "Submit Answer & Continue"}
          </button>
        </div>
      </div>
    );
  }

  // Report Phase
  return (
    <div style={{ minHeight: "100vh", background: elevateTheme.colors.background, padding: elevateTheme.spacing.xl }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: elevateTheme.borderRadius.lg,
            padding: elevateTheme.spacing.xl,
            border: `1px solid ${elevateTheme.colors.border}`,
          }}
        >
          {/* Report Header */}
          <div style={{ textAlign: "center", marginBottom: elevateTheme.spacing.xl }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.primary, margin: 0 }}>
              Interview Complete! 🎉
            </h1>
            <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, marginTop: elevateTheme.spacing.sm }}>
              Here&apos;s your comprehensive interview report
            </p>
          </div>

          {/* Proctoring Summary - Only show if enabled and has violations */}
          {proctoringEnabled && proctoringRef.current && proctoringViolations > 0 && (
            <div
              style={{
                background: "rgba(255, 183, 77, 0.1)",
                borderLeft: `4px solid ${elevateTheme.colors.accentOrange}`,
                borderRadius: elevateTheme.borderRadius.lg,
                padding: elevateTheme.spacing.lg,
                marginBottom: elevateTheme.spacing.xl,
              }}
            >
              <h3
                style={{
                  ...elevateTheme.typography.h4,
                  color: elevateTheme.colors.accentOrange,
                  margin: `0 0 ${elevateTheme.spacing.md} 0`,
                }}
              >
                Proctoring Summary
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: elevateTheme.spacing.lg,
                }}
              >
                <div>
                  <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                    Total Violations
                  </p>
                  <p style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.accentOrange, margin: `${elevateTheme.spacing.sm} 0 0 0` }}>
                    {proctoringViolations}
                  </p>
                </div>
                <div>
                  <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                    Tab Switches
                  </p>
                  <p style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.primary, margin: `${elevateTheme.spacing.sm} 0 0 0` }}>
                    {proctoringRef.current?.getStats().tabSwitches || 0}
                  </p>
                </div>
                <div>
                  <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                    Copy/Paste Attempts
                  </p>
                  <p style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.primary, margin: `${elevateTheme.spacing.sm} 0 0 0` }}>
                    {proctoringRef.current?.getStats().copyPasteAttempts || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score Summary */}
          <div
            style={{
              background: elevateTheme.colors.lightGray,
              borderRadius: elevateTheme.borderRadius.lg,
              padding: elevateTheme.spacing.lg,
              marginBottom: elevateTheme.spacing.xl,
              textAlign: "center",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: elevateTheme.spacing.lg }}>
              <div>
                <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                  Total Score
                </p>
                <p style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.primary, margin: `${elevateTheme.spacing.sm} 0 0 0` }}>
                  {totalScore}/60
                </p>
              </div>
              <div>
                <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
                  Average Score
                </p>
                <p style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.primary, margin: `${elevateTheme.spacing.sm} 0 0 0` }}>
                  {averageScore}/10
                </p>
              </div>
            </div>
          </div>

          {/* Q&A Breakdown */}
          <div style={{ marginBottom: elevateTheme.spacing.xl }}>
            <h2 style={{ ...elevateTheme.typography.h2, color: elevateTheme.colors.dark, marginBottom: elevateTheme.spacing.lg }}>
              Your Answers
            </h2>

            {sessionHistory.map((qa, idx) => (
              <div
                key={idx}
                style={{
                  background: elevateTheme.colors.lightGray,
                  borderRadius: elevateTheme.borderRadius.md,
                  padding: elevateTheme.spacing.lg,
                  marginBottom: elevateTheme.spacing.lg,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: elevateTheme.spacing.md }}>
                  <h3 style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, margin: 0 }}>
                    Question {idx + 1}
                  </h3>
                  <div
                    style={{
                      background: elevateTheme.colors.primary,
                      color: "white",
                      padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.md}`,
                      borderRadius: elevateTheme.borderRadius.sm,
                      ...elevateTheme.typography.body,
                      fontWeight: 600,
                    }}
                  >
                    {qa.score}/10
                  </div>
                </div>

                <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.dark, fontWeight: 600, marginBottom: elevateTheme.spacing.sm }}>
                  <ReactMarkdown>{qa.question}</ReactMarkdown>
                </p>

                <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, marginBottom: elevateTheme.spacing.md }}>
                  <strong>Your Answer:</strong> {qa.answer}
                </p>

                <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.dark, background: "white", padding: elevateTheme.spacing.sm, borderRadius: elevateTheme.borderRadius.sm }}>
                  <strong>Feedback:</strong> {qa.scoreReason}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: elevateTheme.spacing.lg }}>
            <button
              onClick={downloadReport}
              style={{
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
              📥 Download Report
            </button>

            <button
              onClick={() => {
                setPhase("setup");
                setQuestionNumber(0);
                setDomain("");
                setSessionHistory([]);
                setTranscript("");
                setInterimTranscript("");
                setNotes("");
              }}
              style={{
                padding: elevateTheme.spacing.md,
                background: elevateTheme.colors.border,
                color: elevateTheme.colors.primary,
                border: `2px solid ${elevateTheme.colors.primary}`,
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.body,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Take Another Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
