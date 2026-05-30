"use client";

import { useEffect, useRef, useState } from "react";
import { elevateTheme } from "@/lib/elevateTheme";
import { ProctoringMonitor } from "@/lib/proctoring";

interface CameraCaptureProps {
  onCameraReady?: (hasCamera: boolean) => void;
  proctoringMonitor?: ProctoringMonitor;
}

export default function CameraCapture({
  onCameraReady,
  proctoringMonitor,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [lowLight, setLowLight] = useState(false);
  const [brightness, setBrightness] = useState(100);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError("");
        onCameraReady?.(true);

        // Start analyzing brightness
        analyzeBrightness();
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to access camera";
      setCameraError(errorMsg);
      setCameraActive(false);
      onCameraReady?.(false);
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const analyzeBrightness = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }

    const averageBrightness = totalBrightness / (data.length / 4);
    const brightnessPercent = (averageBrightness / 255) * 100;

    setBrightness(Math.round(brightnessPercent));

    // Check for low light
    if (brightnessPercent < 30) {
      setLowLight(true);
      proctoringMonitor?.recordLowLight();
    } else {
      setLowLight(false);
    }

    // Continue analyzing
    requestAnimationFrame(analyzeBrightness);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: elevateTheme.borderRadius.lg,
        padding: elevateTheme.spacing.lg,
        border: `1px solid ${elevateTheme.colors.border}`,
        minHeight: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cameraError ? (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              ...elevateTheme.typography.body,
              color: elevateTheme.colors.error,
              marginBottom: elevateTheme.spacing.md,
            }}
          >
            📷 Camera Access Required
          </p>
          <p
            style={{
              ...elevateTheme.typography.bodySmall,
              color: elevateTheme.colors.textGray,
              marginBottom: elevateTheme.spacing.lg,
            }}
          >
            {cameraError}
          </p>
          <button
            onClick={startCamera}
            style={{
              padding: `${elevateTheme.spacing.sm} ${elevateTheme.spacing.lg}`,
              background: elevateTheme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: elevateTheme.borderRadius.md,
              ...elevateTheme.typography.body,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry Camera
          </button>
        </div>
      ) : cameraActive ? (
        <div style={{ width: "100%", position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              borderRadius: elevateTheme.borderRadius.md,
              backgroundColor: "black",
              aspectRatio: "16 / 9",
              objectFit: "cover",
            }}
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            style={{ display: "none" }}
          />

          {/* Camera Status Indicators */}
          <div
            style={{
              position: "absolute",
              top: elevateTheme.spacing.md,
              right: elevateTheme.spacing.md,
              display: "flex",
              gap: elevateTheme.spacing.sm,
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {/* Camera Active */}
            <div
              style={{
                background: elevateTheme.colors.accentGreen,
                color: "white",
                padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.md}`,
                borderRadius: elevateTheme.borderRadius.sm,
                ...elevateTheme.typography.bodySmall,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: elevateTheme.spacing.xs,
              }}
            >
              <span style={{ fontSize: "12px" }}>🎥</span> Camera On
            </div>

            {/* Brightness Indicator */}
            <div
              style={{
                background:
                  brightness < 30
                    ? elevateTheme.colors.error
                    : brightness < 60
                      ? elevateTheme.colors.accentOrange
                      : elevateTheme.colors.accentGreen,
                color: "white",
                padding: `${elevateTheme.spacing.xs} ${elevateTheme.spacing.md}`,
                borderRadius: elevateTheme.borderRadius.sm,
                ...elevateTheme.typography.bodySmall,
                fontWeight: 600,
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              {lowLight ? "🌙 Low Light" : "☀️ Light OK"} ({brightness}%)
            </div>
          </div>

          {/* Low Light Warning */}
          {lowLight && (
            <div
              style={{
                position: "absolute",
                bottom: elevateTheme.spacing.md,
                left: elevateTheme.spacing.md,
                right: elevateTheme.spacing.md,
                background: "rgba(197, 83, 74, 0.95)",
                color: "white",
                padding: elevateTheme.spacing.md,
                borderRadius: elevateTheme.borderRadius.md,
                ...elevateTheme.typography.bodySmall,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              ⚠️ Lighting is too dark. Please move to a brighter area.
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              ...elevateTheme.typography.body,
              color: elevateTheme.colors.textGray,
              marginBottom: elevateTheme.spacing.lg,
            }}
          >
            Initializing camera...
          </p>
        </div>
      )}
    </div>
  );
}
