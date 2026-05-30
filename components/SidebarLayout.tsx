"use client";

import { elevateTheme } from "@/lib/elevateTheme";

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentPage: "home" | "interview" | "assessment" | "resume" | "insights" | "history";
  onNavigate: (page: string) => void;
  userName?: string;
  userRole?: string;
}

export default function SidebarLayout({
  children,
  currentPage,
  onNavigate,
  userName = "User",
  userRole = "Candidate",
}: SidebarLayoutProps) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "interview", label: "Interview", icon: "🎤" },
    { id: "assessment", label: "Assessment", icon: "📋" },
    { id: "resume", label: "Resume", icon: "📄" },
    { id: "insights", label: "Insights", icon: "📊" },
    { id: "history", label: "History", icon: "⏱️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: elevateTheme.colors.background }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "white",
          borderRight: `1px solid ${elevateTheme.colors.border}`,
          padding: `${elevateTheme.spacing.lg} 0`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ padding: `0 ${elevateTheme.spacing.lg}`, marginBottom: elevateTheme.spacing.xl }}>
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
            <div>
              <div style={{ ...elevateTheme.typography.h4, color: elevateTheme.colors.dark, margin: 0 }}>
                ELEVATE
              </div>
              <div
                style={{
                  ...elevateTheme.typography.bodySmall,
                  color: elevateTheme.colors.textGray,
                  margin: 0,
                }}
              >
                AI Interviewer
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingBottom: elevateTheme.spacing.lg }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: `${elevateTheme.spacing.md} ${elevateTheme.spacing.lg}`,
                background: currentPage === item.id ? `${elevateTheme.colors.primary}15` : "transparent",
                border: "none",
                borderLeft: currentPage === item.id ? `3px solid ${elevateTheme.colors.primary}` : "3px solid transparent",
                paddingLeft: `calc(${elevateTheme.spacing.lg} - 3px)`,
                display: "flex",
                alignItems: "center",
                gap: elevateTheme.spacing.md,
                cursor: "pointer",
                color: currentPage === item.id ? elevateTheme.colors.primary : elevateTheme.colors.textGray,
                ...elevateTheme.typography.body,
                fontWeight: currentPage === item.id ? 600 : 400,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Motivational Message */}
        <div
          style={{
            padding: elevateTheme.spacing.lg,
            margin: `0 ${elevateTheme.spacing.md} ${elevateTheme.spacing.lg}`,
            background: `${elevateTheme.colors.primary}10`,
            borderRadius: elevateTheme.borderRadius.md,
            textAlign: "center",
            borderLeft: `3px solid ${elevateTheme.colors.primary}`,
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: elevateTheme.spacing.sm }}>🌿</div>
          <p
            style={{
              ...elevateTheme.typography.bodySmall,
              color: elevateTheme.colors.textGray,
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Stay calm, take your time, and do your best.
          </p>
          <p style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.primary, margin: `${elevateTheme.spacing.sm} 0 0 0`, fontWeight: 600 }}>
            You&apos;ve got this!
          </p>
        </div>

        {/* User Profile */}
        <div
          style={{
            padding: elevateTheme.spacing.lg,
            borderTop: `1px solid ${elevateTheme.colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: elevateTheme.spacing.md,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: elevateTheme.colors.primary,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ ...elevateTheme.typography.body, fontWeight: 600, color: elevateTheme.colors.dark, margin: 0 }}>
              {userName}
            </div>
            <div style={{ ...elevateTheme.typography.bodySmall, color: elevateTheme.colors.textGray, margin: 0 }}>
              {userRole}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
    </div>
  );
}
