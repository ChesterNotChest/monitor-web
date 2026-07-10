/**
 * 类型化 API 客户端 —— 函数签名对齐全量 server REST 端点。
 *
 * 所有函数通过 fetch() 调用 server API，自动注入 JWT token。
 */

import { config } from './config';
import type {
  AlertGroupCreate,
  AlertGroupResponse,
  AlertListResponse,
  DashboardStats,
  DashboardTrends,
  DetectionTypeCreate,
  DetectionTypeResponse,
  EventListResponse,
  EventResponse,
  ExceptionCreate,
  ExceptionResponse,
  ExceptionStatsItem,
  FenceCreate,
  FenceResponse,
  LogEntry,
  LogListResponse,
  LoginRequest,
  LoginResponse,
  NodeHealthResponse,
  NodeResponse,
  PersonCreate,
  PersonListResponse,
  PersonResponse,
  PersonUpdate,
  RecordingResponse,
  ReportResponse,
  TrendItem,
  UserResponse,
  VideoDeviceResponse,
  AudioDeviceResponse,
  ViewCreateRequest,
  ViewResponse,
} from './types';

const API = config.apiBase;

// ══════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('access-token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function baseFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(options?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Global 401 handling: clear auth state
    localStorage.removeItem('access-token');
    localStorage.removeItem('current-user');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Build query string from an object, skipping undefined/null values */
function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ══════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════

export async function login(body: LoginRequest): Promise<LoginResponse> {
  return baseFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logout(): Promise<void> {
  await baseFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  return baseFetch<UserResponse>('/auth/me');
}

// ══════════════════════════════════════════════
// Alerts
// ══════════════════════════════════════════════

export async function fetchAlerts(page = 1, pageSize = 20): Promise<AlertListResponse> {
  return baseFetch<AlertListResponse>(`/alerts${qs({ page, page_size: pageSize })}`);
}

export async function markAlertHandled(id: number): Promise<void> {
  await baseFetch<{ ok: boolean }>(`/alerts/${id}/handle`, { method: 'PUT' });
}

export async function markAlertFalseAlarm(id: number): Promise<void> {
  await baseFetch<{ ok: boolean }>(`/alerts/${id}/false-alarm`, { method: 'PUT' });
}

// ══════════════════════════════════════════════
// Alert Groups
// ══════════════════════════════════════════════

export async function fetchAlertGroups(): Promise<AlertGroupResponse[]> {
  return baseFetch<AlertGroupResponse[]>('/alert-groups');
}

export async function createAlertGroup(body: AlertGroupCreate): Promise<AlertGroupResponse> {
  return baseFetch<AlertGroupResponse>('/alert-groups', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateAlertGroup(id: number, body: AlertGroupCreate): Promise<AlertGroupResponse> {
  return baseFetch<AlertGroupResponse>(`/alert-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteAlertGroup(id: number): Promise<void> {
  await baseFetch<void>(`/alert-groups/${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return baseFetch<DashboardStats>('/dashboard/stats');
}

export async function fetchDashboardTrends(): Promise<DashboardTrends> {
  return baseFetch<DashboardTrends>('/dashboard/trends');
}

// ══════════════════════════════════════════════
// Nodes
// ══════════════════════════════════════════════

export async function fetchNodes(): Promise<NodeResponse[]> {
  const data = await baseFetch<{ nodes: NodeResponse[] }>('/nodes');
  return data.nodes;
}

export async function fetchNodeVideos(nodeId: number): Promise<VideoDeviceResponse[]> {
  const data = await baseFetch<{ videos: VideoDeviceResponse[] }>(`/nodes/${nodeId}/videos`);
  return data.videos;
}

export async function fetchNodeAudios(nodeId: number): Promise<AudioDeviceResponse[]> {
  const data = await baseFetch<{ audios: AudioDeviceResponse[] }>(`/nodes/${nodeId}/audios`);
  return data.audios;
}

// ══════════════════════════════════════════════
// Devices
// ══════════════════════════════════════════════

export async function fetchNodeHealth(nodeId: number): Promise<NodeHealthResponse> {
  return baseFetch<NodeHealthResponse>(`/devices/nodes/${nodeId}/health`);
}

export async function onboardDevice(nodeId: number): Promise<void> {
  await baseFetch<{ ok: boolean }>(`/devices/nodes/${nodeId}/onboard`, { method: 'POST' });
}

// ══════════════════════════════════════════════
// Detection Types
// ══════════════════════════════════════════════

export async function fetchEntityTypes(): Promise<DetectionTypeResponse[]> {
  return baseFetch<DetectionTypeResponse[]>('/detection/entity-types');
}

export async function createEntityType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>('/detection/entity-types', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateEntityType(id: number, body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>(`/detection/entity-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteEntityType(id: number): Promise<void> {
  await baseFetch<void>(`/detection/entity-types/${id}`, { method: 'DELETE' });
}

export async function fetchActionTypes(): Promise<DetectionTypeResponse[]> {
  return baseFetch<DetectionTypeResponse[]>('/detection/action-types');
}

export async function createActionType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>('/detection/action-types', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateActionType(id: number, body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>(`/detection/action-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteActionType(id: number): Promise<void> {
  await baseFetch<void>(`/detection/action-types/${id}`, { method: 'DELETE' });
}

export async function fetchSoundTypes(): Promise<DetectionTypeResponse[]> {
  return baseFetch<DetectionTypeResponse[]>('/detection/sound-types');
}

export async function createSoundType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>('/detection/sound-types', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateSoundType(id: number, body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  return baseFetch<DetectionTypeResponse>(`/detection/sound-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteSoundType(id: number): Promise<void> {
  await baseFetch<void>(`/detection/sound-types/${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════
// Exceptions
// ══════════════════════════════════════════════

export async function fetchExceptions(): Promise<ExceptionResponse[]> {
  return baseFetch<ExceptionResponse[]>('/exceptions');
}

export async function createException(body: ExceptionCreate): Promise<ExceptionResponse> {
  return baseFetch<ExceptionResponse>('/exceptions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateException(id: number, body: ExceptionCreate): Promise<ExceptionResponse> {
  return baseFetch<ExceptionResponse>(`/exceptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteException(id: number): Promise<void> {
  await baseFetch<void>(`/exceptions/${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════
// Fences
// ══════════════════════════════════════════════

export async function fetchFences(): Promise<FenceResponse[]> {
  return baseFetch<FenceResponse[]>('/fences');
}

export async function createFence(body: FenceCreate): Promise<FenceResponse> {
  return baseFetch<FenceResponse>('/fences', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateFence(id: number, body: FenceCreate): Promise<FenceResponse> {
  return baseFetch<FenceResponse>(`/fences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteFence(id: number): Promise<void> {
  await baseFetch<void>(`/fences/${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════
// Logs
// ══════════════════════════════════════════════

export async function fetchLogs(page = 1, pageSize = 20): Promise<LogListResponse> {
  return baseFetch<LogListResponse>(`/logs${qs({ page, page_size: pageSize })}`);
}

export async function fetchLogById(id: number): Promise<LogEntry> {
  return baseFetch<LogEntry>(`/logs/${id}`);
}

// ══════════════════════════════════════════════
// Reports
// ══════════════════════════════════════════════

export async function fetchWeeklyReport(): Promise<ReportResponse> {
  return baseFetch<ReportResponse>('/reports/weekly');
}

export async function fetchMonthlyReport(): Promise<ReportResponse> {
  return baseFetch<ReportResponse>('/reports/monthly');
}

// ══════════════════════════════════════════════
// Views
// ══════════════════════════════════════════════

export async function createView(body: ViewCreateRequest): Promise<ViewResponse> {
  return baseFetch<ViewResponse>('/views', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchViews(): Promise<ViewResponse[]> {
  const data = await baseFetch<{ views: ViewResponse[] }>('/views');
  return data.views;
}

export async function fetchViewById(id: number): Promise<ViewResponse> {
  return baseFetch<ViewResponse>(`/views/${id}`);
}

export async function deleteView(id: number): Promise<void> {
  await baseFetch<void>(`/views/${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════
// Persons
// ══════════════════════════════════════════════

export async function fetchPersons(page = 1, pageSize = 20): Promise<PersonListResponse> {
  return baseFetch<PersonListResponse>(`/persons${qs({ page, page_size: pageSize })}`);
}

export async function fetchPersonById(id: number): Promise<PersonResponse> {
  return baseFetch<PersonResponse>(`/persons/${id}`);
}

export async function createPerson(body: PersonCreate): Promise<PersonResponse> {
  return baseFetch<PersonResponse>('/persons', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updatePerson(id: number, body: PersonUpdate): Promise<PersonResponse> {
  return baseFetch<PersonResponse>(`/persons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deletePerson(id: number): Promise<void> {
  await baseFetch<void>(`/persons/${id}`, { method: 'DELETE' });
}

export async function uploadPersonAvatar(id: number, file: File): Promise<PersonResponse> {
  const token = localStorage.getItem('access-token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  // Do NOT set Content-Type — browser sets it with boundary for multipart

  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API}/persons/${id}/avatar`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || res.statusText);
  }
  return res.json();
}

// ══════════════════════════════════════════════
// Users
// ══════════════════════════════════════════════

export async function fetchUsers(): Promise<UserResponse[]> {
  return baseFetch<UserResponse[]>('/users');
}

export async function createUser(username: string, password: string, role: string): Promise<UserResponse> {
  return baseFetch<UserResponse>(`/users${qs({ username, password, role })}`, { method: 'POST' });
}

export async function updateUserRole(id: number, role: string): Promise<UserResponse> {
  return baseFetch<UserResponse>(`/users/${id}/role${qs({ role })}`, { method: 'PUT' });
}

export async function deactivateUser(id: number): Promise<void> {
  await baseFetch<void>(`/users/${id}/deactivate`, { method: 'PUT' });
}

// ══════════════════════════════════════════════
// Events
// ══════════════════════════════════════════════

export interface EventQuery {
  view_id?: number | null;
  start?: string | null;
  end?: string | null;
  page?: number;
  page_size?: number;
}

export async function fetchEvents(query: EventQuery = {}): Promise<EventListResponse> {
  const params: Record<string, string | number | boolean | undefined | null> = {
    view_id: query.view_id,
    start: query.start,
    end: query.end,
    page: query.page ?? 1,
    page_size: query.page_size ?? 20,
  };
  return baseFetch<EventListResponse>(`/events${qs(params)}`);
}

export async function fetchEventById(id: number): Promise<EventResponse> {
  return baseFetch<EventResponse>(`/events/${id}`);
}

export async function fetchExceptionStats(start?: string | null, end?: string | null): Promise<ExceptionStatsItem[]> {
  return baseFetch<ExceptionStatsItem[]>(`/events/stats/by-exception${qs({ start, end })}`);
}

export async function fetchEventTrend(
  granularity: 'hour' | 'day' | 'month' = 'day',
  start?: string | null,
  end?: string | null,
): Promise<TrendItem[]> {
  return baseFetch<TrendItem[]>(`/events/stats/trend${qs({ granularity, start, end })}`);
}

// ══════════════════════════════════════════════
// Replay
// ══════════════════════════════════════════════

export async function fetchRecordings(viewId: number, start?: string | null, end?: string | null): Promise<RecordingResponse[]> {
  return baseFetch<RecordingResponse[]>(`/views/${viewId}/recordings${qs({ start, end })}`);
}

export function getRecordingStreamUrl(id: number): string {
  return `${API}/recordings/${id}/stream`;
}
