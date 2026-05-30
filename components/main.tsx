"use client";

import { useEffect, useRef, useState } from "react";
import { Copilot } from "@/components/copilot";
import History from "@/components/History";
import LandingPageElevate from "@/components/LandingPageElevate";
import VideoInterviewElevate from "@/components/VideoInterviewElevate";
import SidebarLayout from "@/components/SidebarLayout";
import { HistoryData } from "@/lib/types";
import { elevateTheme } from "@/lib/elevateTheme";

export default function MainPage() {
  const isRendered = useRef(false);
  const [savedData, setSavedData] = useState<HistoryData[]>([]);
  const [currentPage, setCurrentPage] = useState<"home" | "interview" | "assessment" | "resume" | "insights" | "history">("home");

  const addInSavedData = (data: HistoryData) => {
    setSavedData((prevData) => [data, ...prevData]);
  };

  const deleteData = (createdAt: string) => {
    setSavedData((prevData) =>
      prevData.filter((data) => data.createdAt !== createdAt),
    );
  };

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;
    const savedData = localStorage.getItem("savedData");
    if (savedData) {
      setSavedData(JSON.parse(savedData) as HistoryData[]);
    }
  }, []);

  useEffect(() => {
    if (savedData) {
      localStorage.setItem("savedData", JSON.stringify(savedData));
    }
  }, [savedData]);

  // Landing page
  if (currentPage === "home") {
    return (
      <LandingPageElevate
        onGetStarted={() => setCurrentPage("interview")}
      />
    );
  }

  // App with sidebar
  return (
    <SidebarLayout
      currentPage={currentPage}
      onNavigate={(page: any) => setCurrentPage(page)}
      userRole="Candidate"
    >
      <div style={{ padding: elevateTheme.spacing.xl, maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        {currentPage === "interview" && <VideoInterviewElevate />}
        {currentPage === "assessment" && (
          <div style={{ background: "white", padding: elevateTheme.spacing.xl, borderRadius: elevateTheme.borderRadius.lg }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.dark }}>Assessment</h1>
            <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray }}>Coming soon...</p>
          </div>
        )}
        {currentPage === "resume" && (
          <div style={{ background: "white", padding: elevateTheme.spacing.xl, borderRadius: elevateTheme.borderRadius.lg }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.dark }}>Resume</h1>
            <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray }}>Coming soon...</p>
          </div>
        )}
        {currentPage === "insights" && (
          <div style={{ background: "white", padding: elevateTheme.spacing.xl, borderRadius: elevateTheme.borderRadius.lg }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.dark }}>Insights</h1>
            <p style={{ ...elevateTheme.typography.body, color: elevateTheme.colors.textGray }}>Coming soon...</p>
          </div>
        )}
        {currentPage === "history" && (
          <div style={{ background: "white", padding: elevateTheme.spacing.xl, borderRadius: elevateTheme.borderRadius.lg }}>
            <h1 style={{ ...elevateTheme.typography.h1, color: elevateTheme.colors.dark }}>Interview History</h1>
            <History data={savedData} deleteData={deleteData} />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
