import { useEffect, useState } from "react";
import { getAiConsent, isConsentActive } from "@/services/consentService";

/**
 * Read AI-processing consent status for a student (default-deny on error/missing).
 * Pass the student's id; for a logged-in student this is their own id.
 */
export function useAiConsent(studentId: string | null | undefined) {
  const [consented, setConsented] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!studentId) {
      setConsented(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getAiConsent(studentId)
      .then((c) => {
        if (active) setConsented(isConsentActive(c));
      })
      .catch(() => {
        if (active) setConsented(false); // fail closed
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [studentId]);

  return { consented, loading };
}
