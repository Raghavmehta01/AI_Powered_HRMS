export interface ProctoringEvent {
  type: "tab-switch" | "multiple-faces" | "no-face" | "low-light" | "copy-paste" | "violation";
  timestamp: string;
  severity: "warning" | "critical";
  message: string;
}

export interface ProctoringStats {
  totalViolations: number;
  tabSwitches: number;
  copyPasteAttempts: number;
  faceDetectionFailures: number;
  events: ProctoringEvent[];
}

export class ProctoringMonitor {
  private stats: ProctoringStats = {
    totalViolations: 0,
    tabSwitches: 0,
    copyPasteAttempts: 0,
    faceDetectionFailures: 0,
    events: [],
  };

  private documentHidden = false;
  private lastFaceDetectionTime = Date.now();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    // Track tab visibility changes
    document.addEventListener("visibilitychange", () => {
      this.documentHidden = document.hidden;
      if (document.hidden) {
        this.recordEvent({
          type: "tab-switch",
          severity: "critical",
          message: "Candidate switched to another tab/window",
        });
        this.stats.tabSwitches++;
      }
    });

    // Track copy/paste attempts
    document.addEventListener("copy", () => {
      this.recordEvent({
        type: "copy-paste",
        severity: "warning",
        message: "Copy attempt detected",
      });
      this.stats.copyPasteAttempts++;
    });

    document.addEventListener("paste", () => {
      this.recordEvent({
        type: "copy-paste",
        severity: "warning",
        message: "Paste attempt detected",
      });
      this.stats.copyPasteAttempts++;
    });

    // Prevent right-click
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Prevent keyboard shortcuts for opening dev tools
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "Shift")
      ) {
        e.preventDefault();
      }
    });
  }

  recordEvent(event: Omit<ProctoringEvent, "timestamp">) {
    const proctoringEvent: ProctoringEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.stats.events.push(proctoringEvent);
    this.stats.totalViolations++;

    console.warn(`🚨 Proctoring Event: ${event.message}`);
  }

  recordFaceDetectionFailure() {
    this.recordEvent({
      type: "no-face",
      severity: "warning",
      message: "Face not detected in camera",
    });
    this.stats.faceDetectionFailures++;
    this.lastFaceDetectionTime = Date.now();
  }

  recordMultipleFaces() {
    this.recordEvent({
      type: "multiple-faces",
      severity: "critical",
      message: "Multiple faces detected in camera",
    });
  }

  recordLowLight() {
    this.recordEvent({
      type: "low-light",
      severity: "warning",
      message: "Low light detected - please ensure adequate lighting",
    });
  }

  getStats(): ProctoringStats {
    return this.stats;
  }

  isTabVisible(): boolean {
    return !this.documentHidden;
  }

  getViolationCount(): number {
    return this.stats.totalViolations;
  }

  getWarnings(): ProctoringEvent[] {
    return this.stats.events.filter((e) => e.severity === "warning");
  }

  getCriticalViolations(): ProctoringEvent[] {
    return this.stats.events.filter((e) => e.severity === "critical");
  }
}
