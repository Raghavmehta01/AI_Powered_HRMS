"use client";

import VideoInterviewElevate from "./VideoInterviewElevate";

interface TokenInterviewWrapperProps {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  token: string;
}

export default function TokenInterviewWrapper({
  candidateName,
  candidateEmail,
  jobRole,
  token,
}: TokenInterviewWrapperProps) {
  return (
    <VideoInterviewElevate
      candidateName={candidateName}
      candidateEmail={candidateEmail}
      initialDomain={jobRole}
      token={token}
    />
  );
}
