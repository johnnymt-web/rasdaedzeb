import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatchedMentors, getMyMentorRequests, requestMentor } from "@/services/mentorService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Send, Loader2, CheckCircle2, Clock, XCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Props {
  studentId: string;
  hollandCode: string;
  isCounselorView?: boolean;
}

export default function MentorMatchSection({ studentId, hollandCode, isCounselorView }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["mentor-matches", hollandCode],
    queryFn: () => getMatchedMentors(hollandCode),
    enabled: !!hollandCode,
  });

  const { data: myRequests } = useQuery({
    queryKey: ["mentor-requests", studentId],
    queryFn: () => getMyMentorRequests(studentId),
    enabled: !!studentId && !isCounselorView,
  });

  const statusOf = (mentorId: string) => myRequests?.find((r) => r.mentor_id === mentorId)?.status;

  const handleSend = async (mentorId: string) => {
    setSending(true);
    try {
      await requestMentor(studentId, mentorId, message);
      toast.success(t("report.mentors.requestSent", "Request sent!"));
      setOpenId(null);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["mentor-requests", studentId] });
    } catch {
      toast.error(t("report.mentors.requestError", "Could not send request. You may have already requested this mentor."));
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!mentors || mentors.length === 0) return null;

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "accepted") return <Badge className="bg-emerald-100 text-emerald-700 gap-1"><CheckCircle2 className="w-3 h-3" /> {t("report.mentors.accepted", "Connected")}</Badge>;
    if (status === "declined") return <Badge className="bg-slate-100 text-slate-600 gap-1"><XCircle className="w-3 h-3" /> {t("report.mentors.declined", "Declined")}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 gap-1"><Clock className="w-3 h-3" /> {t("report.mentors.pending", "Request pending")}</Badge>;
  };

  return (
    <section className="card-warm p-8 shadow-sm border-t-4 border-t-secondary">
      <h3 className="text-2xl font-heading font-bold mb-2 flex items-center gap-2">
        <Users className="w-6 h-6 text-secondary" /> {t("report.mentors.title", "Connect with a mentor")}
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        {t("report.mentors.subtitle", "Professionals whose interests align with yours. Reach out to learn about their path.")}
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {mentors.map((m) => {
          const status = statusOf(m.id);
          return (
            <div key={m.id} className="p-5 bg-white rounded-2xl border border-secondary/15 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h4 className="font-bold text-sm text-secondary-900">{m.full_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {m.profession}{m.organization ? ` · ${m.organization}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] whitespace-nowrap gap-1">
                  <Sparkles className="w-3 h-3" /> {m.matchScore}%
                </Badge>
              </div>

              {m.bio && <p className="text-xs text-foreground/75 leading-snug mt-2">{m.bio}</p>}

              {m.fields && m.fields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.fields.map((f, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-medium">{f}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-secondary/10">
                {status ? (
                  <StatusBadge status={status} />
                ) : isCounselorView ? (
                  <span className="text-[10px] text-muted-foreground italic">{t("report.mentors.studentOnly", "Students can request a connection here.")}</span>
                ) : openId === m.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2.5 rounded-lg border bg-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
                      rows={3}
                      maxLength={500}
                      placeholder={t("report.mentors.messagePlaceholder", "Introduce yourself and say what you'd like to learn…")}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-secondary text-white" disabled={sending} onClick={() => handleSend(m.id)}>
                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1" /> {t("report.mentors.send", "Send")}</>}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setOpenId(null); setMessage(""); }}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setOpenId(m.id); setMessage(""); }}>
                    {t("report.mentors.request", "Request a chat")}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground italic mt-4">
        {t("report.mentors.disclaimer", "Mentors are volunteers. A counselor or the mentor will follow up on your request.")}
      </p>
    </section>
  );
}
