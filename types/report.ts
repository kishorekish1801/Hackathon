// Domain types for AquaWatch AI — citizen frontend.
// These mirror the shape the backend (Member 2/3) is expected to return.
// No confidence scores or estimated-water-loss fields are modeled here by design.

export type Category =
  | "PIPE_LEAK"
  | "BROKEN_TAP"
  | "TANK_OVERFLOW"
  | "DAMAGED_PIPELINE"
  | "WATER_CONTAMINATION"
  | "DRAINAGE_PROBLEM"
  | "NO_WATER_SUPPLY"
  | "PUBLIC_WATER_WASTAGE"
  | "OTHER";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface WaterReport {
  id: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  severity_rating: 1 | 2 | 3 | 4 | 5;
  category: Category;
  priority: Priority;
  status: ReportStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  resolved_at?: string | null; // ISO timestamp
  locationLabel?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  PIPE_LEAK: "Pipe Leak",
  BROKEN_TAP: "Broken Public Tap",
  TANK_OVERFLOW: "Tank Overflow",
  DAMAGED_PIPELINE: "Damaged Pipeline",
  WATER_CONTAMINATION: "Water Contamination",
  DRAINAGE_PROBLEM: "Drainage Problem",
  NO_WATER_SUPPLY: "No Water Supply",
  PUBLIC_WATER_WASTAGE: "Public Water Wastage",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
