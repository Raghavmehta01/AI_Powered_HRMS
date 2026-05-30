"use client";

import { elevateTheme } from "@/lib/elevateTheme";

interface LandingPageElevateProps {
  onGetStarted: () => void;
}

export default function LandingPageElevate({ onGetStarted }: LandingPageElevateProps) {
  return (
    <div style={{ minHeight: "100vh", background: elevateTheme.colors.background }}>
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${elevateTheme.spacing.lg} ${elevateTheme.spacing.xl}`,
          borderBottom: `1px solid ${elevateTheme.colors.border}`,
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: elevateTheme.spacing.sm }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: elevateTheme.colors.primary,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            ✓
          </div>
          <div style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, margin: 0 }}>
            ELEVATE
          </div>
        </div>
        <button
          onClick={onGetStarted}
          style={{
            padding: `${elevateTheme.spacing.sm} ${elevateTheme.spacing.lg}`,
            background: elevateTheme.colors.primary,
            color: "white",
            border: "none",
            borderRadius: elevateTheme.borderRadius.md,
            ...elevateTheme.typography.body,
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
          Start Interview
        </button>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${elevateTheme.colors.primary} 0%, ${elevateTheme.colors.primaryLight} 100%)`,
          padding: `${elevateTheme.spacing.xxl} ${elevateTheme.spacing.xl}`,
          textAlign: "center",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ ...elevateTheme.typography.h1, color: "white", margin: 0, fontSize: "48px" }}>
            AI-Powered Interview Platform
          </h1>
          <p
            style={{
              ...elevateTheme.typography.body,
              color: "rgba(255,255,255,0.9)",
              marginTop: elevateTheme.spacing.lg,
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Experience professional technical interviews with real-time feedback, intelligent questions, and comprehensive scoring
          </p>

          <button
            onClick={onGetStarted}
            style={{
              marginTop: elevateTheme.spacing.xxl,
              padding: `${elevateTheme.spacing.md} ${elevateTheme.spacing.xl}`,
              background: "white",
              color: elevateTheme.colors.primary,
              border: "none",
              borderRadius: elevateTheme.borderRadius.md,
              ...elevateTheme.typography.h3,
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            Begin Your Interview
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: `${elevateTheme.spacing.xxl} ${elevateTheme.spacing.xl}`, maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            ...elevateTheme.typography.h2,
            textAlign: "center",
            marginBottom: elevateTheme.spacing.xxl,
            color: elevateTheme.colors.dark,
          }}
        >
          Powerful Features
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: elevateTheme.spacing.lg }}>
          {[
            {
              icon: "🎙️",
              title: "Real-Time Transcription",
              desc: "Instant speech-to-text with accurate transcription of your responses",
            },
            {
              icon: "🤖",
              title: "Intelligent Questions",
              desc: "AI-generated follow-up questions that adapt to your answers",
            },
            {
              icon: "⭐",
              title: "Instant Scoring",
              desc: "Get immediate evaluation scores for each response (0-10)",
            },
            {
              icon: "📊",
              title: "Detailed Reports",
              desc: "Comprehensive analysis with breakdown by category and strength areas",
            },
            {
              icon: "🎯",
              title: "Structured Format",
              desc: "6-question interview for consistent and fair evaluation",
            },
            {
              icon: "💾",
              title: "Export Results",
              desc: "Download your complete interview report as JSON",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                border: `1px solid ${elevateTheme.colors.border}`,
                borderRadius: elevateTheme.borderRadius.lg,
                padding: elevateTheme.spacing.lg,
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = elevateTheme.shadows.lg;
                el.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: elevateTheme.spacing.md }}>{feature.icon}</div>
              <h3 style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.dark, margin: `0 0 ${elevateTheme.spacing.sm} 0` }}>
                {feature.title}
              </h3>
              <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: "white", padding: `${elevateTheme.spacing.xxl} ${elevateTheme.spacing.xl}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2
            style={{
              ...elevateTheme.typography.h2,
              textAlign: "center",
              marginBottom: elevateTheme.spacing.xxl,
              color: elevateTheme.colors.dark,
            }}
          >
            How It Works
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: elevateTheme.spacing.lg }}>
            {[
              { num: "1", title: "Setup", desc: "Select your role and interview domain" },
              { num: "2", title: "Answer", desc: "Respond to 6 AI-generated questions" },
              { num: "3", title: "Evaluate", desc: "Receive instant scoring for each answer" },
              { num: "4", title: "Review", desc: "Get detailed feedback and download report" },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: elevateTheme.colors.lightGray,
                  borderRadius: elevateTheme.borderRadius.lg,
                  padding: elevateTheme.spacing.lg,
                  textAlign: "center",
                  border: `2px solid ${elevateTheme.colors.primary}`,
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: elevateTheme.colors.primary,
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...elevateTheme.typography.h2,
                    margin: `0 auto ${elevateTheme.spacing.md}`,
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ ...elevateTheme.typography.h3, color: elevateTheme.colors.dark, margin: `0 0 ${elevateTheme.spacing.sm} 0` }}>
                  {step.title}
                </h3>
                <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={{ background: elevateTheme.colors.background, padding: `${elevateTheme.spacing.xxl} ${elevateTheme.spacing.xl}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              ...elevateTheme.typography.h2,
              color: elevateTheme.colors.dark,
              marginBottom: elevateTheme.spacing.xl,
            }}
          >
            Why Choose ELEVATE?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: elevateTheme.spacing.lg }}>
            {[
              "✓ Professional environment without pressure from human interviewer",
              "✓ Get feedback on multiple dimensions: clarity, depth, and confidence",
              "✓ Practice unlimited times to improve your interview skills",
              "✓ Export detailed reports to track your progress over time",
            ].map((benefit, idx) => (
              <p key={idx} style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.dark, margin: 0 }}>
                {benefit}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: elevateTheme.colors.primary,
          color: "white",
          padding: `${elevateTheme.spacing.xxl} ${elevateTheme.spacing.xl}`,
          textAlign: "center",
        }}
      >
        <h2 style={{ ...elevateTheme.typography.h2, color: "white", margin: 0 }}>
          Ready to Elevate Your Interview Skills?
        </h2>
        <p style={{ ...elevateTheme.typography.body, color: "rgba(255,255,255,0.9)", marginTop: elevateTheme.spacing.lg }}>
          Start your free AI-powered interview today
        </p>
        <button
          onClick={onGetStarted}
          style={{
            marginTop: elevateTheme.spacing.lg,
            padding: `${elevateTheme.spacing.md} ${elevateTheme.spacing.xl}`,
            background: "white",
            color: elevateTheme.colors.primary,
            border: "none",
            borderRadius: elevateTheme.borderRadius.md,
            ...elevateTheme.typography.h3,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          Start Interview Now
        </button>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: elevateTheme.colors.dark,
          color: "white",
          padding: `${elevateTheme.spacing.lg} ${elevateTheme.spacing.xl}`,
          textAlign: "center",
          ...elevateTheme.typography.bodySmall,
        }}
      >
        <p style={{ margin: 0 }}>© 2024 ELEVATE AI Interviewer. All rights reserved.</p>
      </footer>
    </div>
  );
}
