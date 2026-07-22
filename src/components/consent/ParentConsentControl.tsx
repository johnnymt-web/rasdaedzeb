import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAiConsent, isConsentActive, recordAiConsent } from "@/services/consentService";

interface ParentConsentControlProps {
  studentId: string;
  studentName?: string;
}

/**
 * Parent/guardian control to GRANT or WITHDRAW AI-processing consent for their
 * child. Writes are authorized by RLS (linked parent or admin only). Until
 * consent is granted, AI features are disabled (default-deny) across the app.
 */
export function ParentConsentControl({ studentId, studentName }: ParentConsentControlProps) {
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let on = true;
    getAiConsent(studentId)
      .then((c) => { if (on) setActive(isConsentActive(c)); })
      .catch(() => { if (on) setActive(false); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [studentId]);

  const update = async (given: boolean) => {
    setSaving(true);
    try {
      await recordAiConsent(studentId, given, "parent_portal");
      setActive(given);
      toast.success(given ? "AI guidance consent granted" : "AI guidance consent withdrawn");
    } catch (e: any) {
      toast.error(e?.message || "Could not update consent");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h3 className="font-medium text-foreground">
        AI guidance consent{studentName ? ` — ${studentName}` : ""}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Allow Pathfinder to use third-party AI (Anthropic, OpenAI) to generate career-guidance
        insights from your child's assessment results. Assessments and reports work without this,
        and you can withdraw consent at any time.
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={saving || active === true} onClick={() => update(true)}>
          {active ? "Consent given" : "Give consent"}
        </Button>
        {active && (
          <Button size="sm" variant="outline" disabled={saving} onClick={() => update(false)}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}

export default ParentConsentControl;
