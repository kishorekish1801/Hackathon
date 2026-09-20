const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AdminUser {
  id?: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role?: string;
  user?: AdminUser;
}

export interface ReportItem {
  id: string | number;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  severity: number;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface AdminStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  critical: number;
}

// Token helper functions
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aquawatch_admin_token');
}

export function setAdminToken(token: string, role: string) {
  localStorage.setItem('aquawatch_admin_token', token);
  localStorage.setItem('aquawatch_admin_role', role);
}

export function clearAdminAuth() {
  localStorage.removeItem('aquawatch_admin_token');
  localStorage.removeItem('aquawatch_admin_role');
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('aquawatch_admin_token');
  const role = localStorage.getItem('aquawatch_admin_role');
  return !!token && role?.toUpperCase() === 'ADMIN';
}

// Login API
export async function adminLogin(formData: { email: string; password: string }): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Login failed');
  }

  const data: LoginResponse = await res.json();
  const userRole = (data.role || data.user?.role || '').toUpperCase();

  if (userRole !== 'ADMIN') {
    throw new Error('Access denied: ADMIN role required.');
  }

  setAdminToken(data.access_token, userRole);
  return data;
}

// Stats API
export async function getAdminStats(): Promise<AdminStats> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

// Reports API
export async function getAdminReports(): Promise<ReportItem[]> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

// Single Report Details API
export async function getAdminReportById(id: string | number): Promise<ReportItem> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch report details');
  return res.json();
}

// Update Status API
export async function updateReportStatus(id: string | number, status: 'IN_PROGRESS' | 'RESOLVED'): Promise<void> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/reports/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update report status');
}

// Image URL Helper
export function getReportImageUrl(id: string | number): string {
  return `${API_BASE}/api/reports/${id}/image`;
}