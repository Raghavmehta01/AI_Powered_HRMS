import { findLinkByToken } from "@/lib/dataStore";
import TokenInterviewWrapper from "@/components/TokenInterviewWrapper";
import { notFound } from "next/navigation";

interface TokenPageProps {
  params: { token: string };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { token } = params;

  const link = await findLinkByToken(token);

  if (!link) {
    notFound();
  }

  return (
    <TokenInterviewWrapper
      candidateName={link.candidateName}
      candidateEmail={link.candidateEmail}
      jobRole={link.jobRole}
      token={token}
    />
  );
}
