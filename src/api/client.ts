/**
 * 类型化 API 客户端 —— 函数签名对齐全量 server REST 端点。
 *
 * 本阶段所有函数体为 stub：列表类返回空数据，变更类 throw "Not implemented"。
 * Server API 就绪后只需替换函数体。
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
  ExceptionCreate,
  ExceptionResponse,
  FenceCreate,
  FenceResponse,
  LogEntry,
  LogListResponse,
  LoginRequest,
  LoginResponse,
  PersonCreate,
  PersonListResponse,
  PersonResponse,
  PersonUpdate,
  ReportResponse,
  UserResponse,
  ViewResponse,
} from './types';

const API = config.apiBase;

// ══════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════

export async function login(body: LoginRequest): Promise<LoginResponse | null> {
  // TODO: POST /auth/login
  return null;
}

export async function logout(): Promise<void> {
  // TODO: POST /auth/logout
}

export async function fetchCurrentUser(): Promise<UserResponse | null> {
  // TODO: GET /auth/me
  return null;
}

// ══════════════════════════════════════════════
// Alerts
// ══════════════════════════════════════════════

export async function fetchAlerts(page = 1, pageSize = 20): Promise<AlertListResponse> {
  // TODO: GET /alerts?page=&page_size=
  return { items: [], total: 0, page, page_size: pageSize };
}

export async function markAlertHandled(id: number): Promise<void> {
  // TODO: PUT /alerts/:id/handle
  throw new Error(`PUT /alerts/${id}/handle — not implemented`);
}

export async function markAlertFalseAlarm(id: number): Promise<void> {
  // TODO: PUT /alerts/:id/false-alarm
  throw new Error(`PUT /alerts/${id}/false-alarm — not implemented`);
}

// ══════════════════════════════════════════════
// Alert Groups
// ══════════════════════════════════════════════

export async function fetchAlertGroups(): Promise<AlertGroupResponse[]> {
  // TODO: GET /alert-groups
  return [];
}

export async function createAlertGroup(body: AlertGroupCreate): Promise<AlertGroupResponse> {
  // TODO: POST /alert-groups
  throw new Error('POST /alert-groups — not implemented');
}

export async function updateAlertGroup(id: number, body: AlertGroupCreate): Promise<AlertGroupResponse> {
  // TODO: PUT /alert-groups/:id
  throw new Error(`PUT /alert-groups/${id} — not implemented`);
}

export async function deleteAlertGroup(id: number): Promise<void> {
  // TODO: DELETE /alert-groups/:id
  throw new Error(`DELETE /alert-groups/${id} — not implemented`);
}

// ══════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // TODO: GET /dashboard/stats
  return { total_views: 0, active_alerts: 0, online_nodes: 0, total_devices: 0 };
}

export async function fetchDashboardTrends(): Promise<DashboardTrends> {
  // TODO: GET /dashboard/trends
  return { points: [] };
}

// ══════════════════════════════════════════════
// Devices / Nodes
// ══════════════════════════════════════════════

export async function fetchNodes(): Promise<unknown[]> {
  // TODO: GET /nodes
  return [];
}

export async function fetchNodeVideos(nodeId: number): Promise<unknown[]> {
  // TODO: GET /nodes/:node_id/videos
  return [];
}

export async function fetchNodeAudios(nodeId: number): Promise<unknown[]> {
  // TODO: GET /nodes/:node_id/audios
  return [];
}

export async function fetchNodeHealth(nodeId: number): Promise<unknown> {
  // TODO: GET /devices/nodes/:node_id/health
  return null;
}

// ══════════════════════════════════════════════
// Detection Types
// ══════════════════════════════════════════════

export async function fetchEntityTypes(): Promise<DetectionTypeResponse[]> {
  // TODO: GET /detection/entity-types
  return [];
}

export async function fetchActionTypes(): Promise<DetectionTypeResponse[]> {
  // TODO: GET /detection/action-types
  return [];
}

export async function fetchSoundTypes(): Promise<DetectionTypeResponse[]> {
  // TODO: GET /detection/sound-types
  return [];
}

export async function createEntityType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  // TODO: POST /detection/entity-types
  throw new Error('POST /detection/entity-types — not implemented');
}

export async function createActionType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  // TODO: POST /detection/action-types
  throw new Error('POST /detection/action-types — not implemented');
}

export async function createSoundType(body: DetectionTypeCreate): Promise<DetectionTypeResponse> {
  // TODO: POST /detection/sound-types
  throw new Error('POST /detection/sound-types — not implemented');
}

// ══════════════════════════════════════════════
// Exceptions
// ══════════════════════════════════════════════

export async function fetchExceptions(): Promise<ExceptionResponse[]> {
  // TODO: GET /exceptions
  return [];
}

export async function createException(body: ExceptionCreate): Promise<ExceptionResponse> {
  // TODO: POST /exceptions
  throw new Error('POST /exceptions — not implemented');
}

export async function updateException(id: number, body: ExceptionCreate): Promise<ExceptionResponse> {
  // TODO: PUT /exceptions/:id
  throw new Error(`PUT /exceptions/${id} — not implemented`);
}

export async function deleteException(id: number): Promise<void> {
  // TODO: DELETE /exceptions/:id
  throw new Error(`DELETE /exceptions/${id} — not implemented`);
}

// ══════════════════════════════════════════════
// Fences
// ══════════════════════════════════════════════

export async function fetchFences(): Promise<FenceResponse[]> {
  // TODO: GET /fences
  return [];
}

export async function createFence(body: FenceCreate): Promise<FenceResponse> {
  // TODO: POST /fences
  throw new Error('POST /fences — not implemented');
}

export async function updateFence(id: number, body: FenceCreate): Promise<FenceResponse> {
  // TODO: PUT /fences/:id
  throw new Error(`PUT /fences/${id} — not implemented`);
}

export async function deleteFence(id: number): Promise<void> {
  // TODO: DELETE /fences/:id
  throw new Error(`DELETE /fences/${id} — not implemented`);
}

// ══════════════════════════════════════════════
// Logs
// ══════════════════════════════════════════════

export async function fetchLogs(page = 1, pageSize = 20): Promise<LogListResponse> {
  // TODO: GET /logs?page=&page_size=
  return { items: [], total: 0, page, page_size: pageSize };
}

export async function fetchLogById(id: number): Promise<LogEntry | null> {
  // TODO: GET /logs/:id
  return null;
}

// ══════════════════════════════════════════════
// Reports
// ══════════════════════════════════════════════

export async function fetchWeeklyReport(): Promise<ReportResponse> {
  // TODO: GET /reports/weekly
  return { period: '', total_alerts: 0, by_severity: [], top_exceptions: [] };
}

export async function fetchMonthlyReport(): Promise<ReportResponse> {
  // TODO: GET /reports/monthly
  return { period: '', total_alerts: 0, by_severity: [], top_exceptions: [] };
}

// ══════════════════════════════════════════════
// Views
// ══════════════════════════════════════════════

export async function createView(audioId: number, videoId: number): Promise<ViewResponse> {
  // TODO: POST /views?audio_id=&video_id=
  throw new Error('POST /views — not implemented');
}

export async function fetchViews(): Promise<ViewResponse[]> {
  // TODO: GET /views
  return [];
}

export async function fetchViewById(id: number): Promise<ViewResponse | null> {
  // TODO: GET /views/:id
  return null;
}

export async function deleteView(id: number): Promise<void> {
  // TODO: DELETE /views/:id
  throw new Error(`DELETE /views/${id} — not implemented`);
}

// ══════════════════════════════════════════════
// Persons
// ══════════════════════════════════════════════

export async function fetchPersons(page = 1, pageSize = 20): Promise<PersonListResponse> {
  // TODO: GET /persons?page=&page_size=
  return { items: [], total: 0, page, page_size: pageSize };
}

export async function fetchPersonById(id: number): Promise<PersonResponse | null> {
  // TODO: GET /persons/:id
  return null;
}

export async function createPerson(body: PersonCreate): Promise<PersonResponse> {
  // TODO: POST /persons
  throw new Error('POST /persons — not implemented');
}

export async function updatePerson(id: number, body: PersonUpdate): Promise<PersonResponse> {
  // TODO: PUT /persons/:id
  throw new Error(`PUT /persons/${id} — not implemented`);
}

export async function deletePerson(id: number): Promise<void> {
  // TODO: DELETE /persons/:id
  throw new Error(`DELETE /persons/${id} — not implemented`);
}

export async function uploadPersonAvatar(id: number, file: File): Promise<PersonResponse> {
  // TODO: POST /persons/:id/avatar
  throw new Error(`POST /persons/${id}/avatar — not implemented`);
}

// ══════════════════════════════════════════════
// Users
// ══════════════════════════════════════════════

export async function fetchUsers(): Promise<UserResponse[]> {
  // TODO: GET /users
  return [];
}

export async function createUser(username: string, password: string, role: string): Promise<UserResponse> {
  // TODO: POST /users?username=&password=&role=
  throw new Error('POST /users — not implemented');
}

export async function updateUserRole(id: number, role: string): Promise<UserResponse> {
  // TODO: PUT /users/:id/role?role=
  throw new Error(`PUT /users/${id}/role — not implemented`);
}

export async function deactivateUser(id: number): Promise<void> {
  // TODO: PUT /users/:id/deactivate
  throw new Error(`PUT /users/${id}/deactivate — not implemented`);
}
