import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAiConsent } from "@/hooks/useAiConsent";

interface AiConsentGateProps {
  /** Student whose data the AI feature would process. Defaults to the logged-in user. */
  studentId?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Gates AI-powered features behind recorded parental/guardian consent (default-deny).
 * This is a defense-in-depth UI gate; the authoritative check is enforced
 * server-side in the AI edge functions via has_ai_consent().
 */
export function AiConsentGate({ studentId, children, fallback }: AiConsentGateProps) {
  const { user } = useAuth();
  const sid = studentId ?? user?.id ?? null;
  const { consented, loading } = useAiConsent(sid);

  if (loading) return null;
  if (!consented) {
    return (
      <>
        {fallback ?? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">AI-assisted features are turned off</p>
            <p className="mt-1">
              A parent or guardian needs to provide consent for AI processing of this
              student's results before AI guidance can be generated. Assessments and
              your report remain fully available without AI.
            </p>
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}

export default AiConsentGate;
