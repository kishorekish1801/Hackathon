// Citizen-facing API client — PLACEHOLDER ONLY.
//
// None of these functions call a real backend yet. Each one is typed and
// shaped the way the eventual FastAPI service is expected to respond, so
// swapping the body for a real `fetch()` later is a small, contained change.
//
// The backend base URL is read from the environment so it can be pointed
// at localhost during development and at a real host in production.

import type { WaterReport } from "@/types/report";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface AuthCredentials {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface AuthResult {
  citizenId: string;
  fullName: string;
  token: string;
}

export interface CreateReportPayload {
  image: File | null;
  latitude: number | null;
  longitude: number | null;
  severity_rating: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

/**
 * Registers a new citizen account.
 * TODO(backend): POST `${API_BASE_URL}/auth/register`
 */
export async function registerCitizen(
  payload: RegisterPayload
): Promise<AuthResult> {
  throw new Error("registerCitizen() is not connected to a backend yet.");
}

/**
 * Signs a citizen in with phone + password.
 * TODO(backend): POST `${API_BASE_URL}/auth/login`
 */
export async function loginCitizen(
  credentials: AuthCredentials
): Promise<AuthResult> {
  throw new Error("loginCitizen() is not connected to a backend yet.");
}

/**
 * Submits a new water problem report.
 * TODO(backend): POST `${API_BASE_URL}/reports` (multipart/form-data)
 * Expected response includes the backend-assigned category and priority.
 */
export async function createReport(
  payload: CreateReportPayload
): Promise<WaterReport> {
  throw new Error("createReport() is not connected to a backend yet.");
}

/**
 * Fetches the signed-in citizen's own reports.
 * TODO(backend): GET `${API_BASE_URL}/reports/mine`
 */
export async function getMyReports(): Promise<WaterReport[]> {
  throw new Error("getMyReports() is not connected to a backend yet.");
}

/**
 * Fetches a single report by id.
 * TODO(backend): GET `${API_BASE_URL}/reports/:id`
 */
export async function getReport(id: string): Promise<WaterReport> {
  throw new Error("getReport() is not connected to a backend yet.");
}

/**
 * Resolves the public URL for a report's uploaded image.
 * TODO(backend): the backend will likely return an absolute URL or a
 * storage key that this function turns into a full URL.
 */
export function getReportImageUrl(imageKey: string): string {
  return `${API_BASE_URL}/media/${imageKey}`;
}
