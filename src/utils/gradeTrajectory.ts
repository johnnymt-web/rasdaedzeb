import type { GradeBand } from "@/utils/gradeBands";

/**
 * The developmental "ladder" a student moves along, grades 6 → 13.
 * Each node is a decision stage. The report frames guidance around the
 * student's CURRENT node and the immediate NEXT one (no jumping ahead).
 *
 * Short labels are resolved via i18n: report.synthesis.trajectory.nodes.<band>
 */
export interface TrajectoryNode {
  band: Exclude<GradeBand, "unknown">;
  order: number;
  grades: string; // human-readable grade range
  i18nKey: string; // suffix under report.synthesis.trajectory.nodes
}

export const TRAJECTORY_NODES: TrajectoryNode[] = [
  { band: "discovery", order: 0, grades: "6–8", i18nKey: "discovery" },
  { band: "exploration", order: 1, grades: "9–10", i18nKey: "exploration" },
  { band: "planning", order: 2, grades: "11–12", i18nKey: "planning" },
  { band: "transition", order: 3, grades: "13", i18nKey: "transition" },
];

/** Returns the node for a band, or null for unknown/out-of-range. */
export const getTrajectoryNode = (band: GradeBand): TrajectoryNode | null =>
  TRAJECTORY_NODES.find((n) => n.band === band) ?? null;

/** Returns the next node after the given band, or null if at/after the last. */
export const getNextTrajectoryNode = (band: GradeBand): TrajectoryNode | null => {
  const current = getTrajectoryNode(band);
  if (!current) return null;
  return TRAJECTORY_NODES.find((n) => n.order === current.order + 1) ?? null;
};

/** True when the band maps to a real node on the ladder. */
export const isOnTrajectory = (band: GradeBand): boolean => getTrajectoryNode(band) !== null;
