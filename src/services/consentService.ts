import { supabase } from "@/integrations/supabase/client";

// AI processing consent (minors). The school is the data controller and the
// parent/guardian (or an admin via school attestation) records consent. Until a
// consent row exists with consent_given=true and no withdrawal, AI features are
// gated (default-deny). NOTE: cast to `any` until Supabase types are regenerated
// after the ai_processing_consent migration is applied.

export type ConsentMethod = "parent_portal" | "school_attestation";

export interface AiConsent {
  student_id: string;
  consent_given: boolean;
  consent_method: ConsentMethod | null;
  consented_at: string | null;
  withdrawn_at: string | null;
}

export async function getAiConsent(studentId: string): Promise<AiConsent | null> {
  const { data, error } = await (supabase.from("ai_processing_consent" as any) as any)
    .select("student_id, consent_given, consent_method, consented_at, withdrawn_at")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw error;
  return (data as AiConsent | null) ?? null;
}

/** True only when consent is given and not withdrawn. */
export function isConsentActive(c: AiConsent | null): boolean {
  return !!c && c.consent_given && !c.withdrawn_at;
}

/** Record or update consent for a student. Caller must be the linked parent or an admin (enforced by RLS). */
export async function recordAiConsent(
  studentId: string,
  given: boolean,
  method: ConsentMethod,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const row = {
    student_id: studentId,
    consent_given: given,
    consent_method: method,
    consented_by: auth.user?.id ?? null,
    consented_at: given ? new Date().toISOString() : null,
    withdrawn_at: given ? null : new Date().toISOString(),
  };
  const { error } = await (supabase.from("ai_processing_consent" as any) as any)
    .upsert(row, { onConflict: "student_id" });
  if (error) throw error;
}
