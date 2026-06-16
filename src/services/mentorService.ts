import { supabase } from "@/integrations/supabase/client";

export interface Mentor {
  id: string;
  full_name: string;
  profession: string;
  organization?: string | null;
  holland_code: string;
  bio?: string | null;
  fields?: string[] | null;
}

export interface MentorMatch extends Mentor {
  matchScore: number; // 0-100
}

export interface MentorRequest {
  id: string;
  mentor_id: string;
  status: "pending" | "accepted" | "declined";
}

/**
 * Holland-code overlap score (0-100). Shared interest letters earn points,
 * weighted by the student's ordering (first letter matters most) and bonus
 * when the letter sits in the same position in the mentor's code.
 */
export function hollandOverlapScore(studentCode: string, mentorCode: string): number {
  const s = (studentCode || "").toUpperCase().slice(0, 3).split("");
  const m = (mentorCode || "").toUpperCase().slice(0, 3).split("");
  if (s.length === 0 || m.length === 0) return 0;
  let score = 0;
  s.forEach((letter, i) => {
    const idx = m.indexOf(letter);
    if (idx !== -1) score += (3 - i) * (idx === i ? 1.5 : 1);
  });
  const max = (3 + 2 + 1) * 1.5; // perfect, same-position match = 9
  return Math.round((score / max) * 100);
}

/** Active mentors ranked by Holland-code match against the student's code. */
export const getMatchedMentors = async (studentHollandCode: string, limit = 6): Promise<MentorMatch[]> => {
  const { data, error } = await (supabase.from("mentors" as any) as any)
    .select("id, full_name, profession, organization, holland_code, bio, fields")
    .eq("active", true);
  if (error) throw error;
  const mentors = (data || []) as Mentor[];
  return mentors
    .map((mtr) => ({ ...mtr, matchScore: hollandOverlapScore(studentHollandCode, mtr.holland_code) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

/** Requests the current student has already sent (to render status / prevent dupes). */
export const getMyMentorRequests = async (studentId: string): Promise<MentorRequest[]> => {
  const { data, error } = await (supabase.from("mentor_requests" as any) as any)
    .select("id, mentor_id, status")
    .eq("student_id", studentId);
  if (error) throw error;
  return (data || []) as MentorRequest[];
};

/** Create a connection request from the student to a mentor. */
export const requestMentor = async (studentId: string, mentorId: string, message: string): Promise<void> => {
  const { error } = await (supabase.from("mentor_requests" as any) as any).insert([
    { student_id: studentId, mentor_id: mentorId, message: message?.trim() || null },
  ]);
  if (error) throw error;
};
