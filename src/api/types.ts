/**
 * Server Pydantic Schema → TypeScript 类型映射。
 *
 * 来源：monitor-server/src/schema/http/*.py + schema/wss/node_commands.py
 * 原则：逐字段翻译，不做"前端友好"改造。
 *   Python int → TS number
 *   Python str → TS string
 *   Python bool → TS boolean
 *   Python datetime → TS string (ISO 8601)
 *   Python list[X] → TS X[]
 *   Python X | None → TS X | null
 */

// ══════════════════════════════════════════════
// 通用
// ══════════════════════════════════════════════

/** 分页列表响应泛型 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ══════════════════════════════════════════════
// Auth (auth_schema.py)
// ══════════════════════════════════════════════

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  supervisor_id?: number | null;
  dingtalk_mobile?: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// ══════════════════════════════════════════════
// Alert (alert_schema.py)
// ══════════════════════════════════════════════

export interface AlertResponse {
  id: number;
  view_id: number;
  exception_id: number;
  exception_name: string;
  track_id: number;
  recording_id: number | null;
  timestamp: string;
  status?: string;
  view_name?: string;
  severity?: string;
}

export type AlertListResponse = PaginatedResponse<AlertResponse>;

// ══════════════════════════════════════════════
// Alert Group (alert_group_schema.py)
// ══════════════════════════════════════════════

export interface ResponseActionRef {
  id: number;
  name: string;
}

export interface AlertGroupCreate {
  name: string;
}

export interface AlertGroupResponse {
  id: number;
  name: string;
  created_at: string;
  responses: ResponseActionRef[];
}

// ══════════════════════════════════════════════
// Dashboard (dashboard_schema.py)
// ══════════════════════════════════════════════

export interface DashboardStats {
  total_views: number;
  active_alerts: number;
  online_nodes: number;
  total_devices: number;
}

export interface AlertTrendPoint {
  date: string;
  severity: string;
  count: number;
}

export interface DashboardTrends {
  points: AlertTrendPoint[];
}

// ══════════════════════════════════════════════
// Device / Node (device_schema.py + node_schema.py)
// ══════════════════════════════════════════════

export interface NodeDeviceResponse {
  id: number;
  name: string;
  streaming: boolean | null;
}

export interface NodeHealthResponse {
  node_id: number;
  is_connected: boolean;
  video_devices: number;
  audio_devices: number;
  streaming_devices: number;
}

export interface VideoDeviceResponse {
  id: number;
  name: string;
  node_id: number;
  streaming: boolean;
  stream_url: string | null;
}

export interface AudioDeviceResponse {
  id: number;
  name: string;
  node_id: number;
  streaming: boolean;
}

export interface NodeResponse {
  id: number;
  is_connected: boolean;
  is_virtual: boolean;
  last_seen: string | null;
}

// ══════════════════════════════════════════════
// Detection (detection_schema.py)
// ══════════════════════════════════════════════

export interface DetectionTypeCreate {
  name: string;
}

export interface DetectionTypeResponse {
  id: number;
  name: string;
  created_at: string;
}

// ══════════════════════════════════════════════
// Exception (exception_schema.py)
// ══════════════════════════════════════════════

export interface ExceptionCreate {
  name: string;
  severity: number;
  group_id?: number | null;
  entity_ids?: number[];
  action_ids?: number[];
  sound_ids?: number[];
  face_result_id?: number | null;
  fence_event_id?: number | null;
  cooldown_seconds?: number;
  max_recording_seconds?: number;
  wind_down_seconds?: number;
}

export interface ExceptionResponse {
  id: number;
  name: string;
  severity: number;
  group_id: number | null;
  entity_ids: number[];
  action_ids: number[];
  sound_ids: number[];
  face_result_id: number | null;
  fence_event_id: number | null;
  cooldown_seconds: number;
  max_recording_seconds: number;
  wind_down_seconds: number;
  created_at: string;
}

// ══════════════════════════════════════════════
// Fence (fence_schema.py)
// ══════════════════════════════════════════════

export interface FenceCreate {
  name: string;
  view_id: number;
  coords: number[][];
  dwell_time?: number;
  density?: number;
  leave_frames?: number;
}

export interface FenceResponse {
  id: number;
  name: string;
  view_id: number;
  coords: number[][];
  dwell_time: number;
  density: number;
  leave_frames: number;
}

// ══════════════════════════════════════════════
// Log (log_schema.py)
// ══════════════════════════════════════════════

export interface LogEntry {
  id: number;
  log_type: number;
  operator_id: number | null;
  view_id: number | null;
  event_id: number | null;
  severity: number | null;
  summary: string;
  details_json: string | null;
  created_at: string;
}

export interface LogListResponse {
  items: LogEntry[];
  total: number;
  page: number;
  page_size: number;
}

// ══════════════════════════════════════════════
// Report (report_schema.py)
// ══════════════════════════════════════════════

export interface ReportItem {
  label: string;
  value: number;
}

export interface ReportResponse {
  period: string;
  total_alerts: number;
  by_severity: ReportItem[];
  top_exceptions: ReportItem[];
}

export interface DailyTrendPoint {
  hour: string;
  count: number;
}

export interface DailyReportResponse extends ReportResponse {
  date: string;
  risk_level: string;
  summary: string;
  key_findings: string[];
  recommendations: string[];
  hourly_trend: DailyTrendPoint[];
  ai_provider?: string | null;
  ai_model?: string | null;
  ai_generated: boolean;
}

export interface DeepSeekDailyReportRequest {
  date?: string | null;
  api_key: string;
  model?: string;
}

// ── Persisted daily report (new API) ──

export interface DailyStats {
  period: string;
  date: string;
  time_range_start: string;
  time_range_end: string;
  total_alerts: number;
  risk_level: string;
  by_severity: ReportItem[];
  top_exceptions: ReportItem[];
  hourly_trend: DailyTrendPoint[];
  by_view: ReportItem[];
  entity_types: ReportItem[];
}

export interface DailyInsights {
  partial: boolean;
  summary: string;
  key_findings: string[];
  pattern_analysis?: Record<string, unknown> | null;
  trend_forecast?: Record<string, unknown> | null;
  risk_distribution?: { label: string; value: number; severity: string }[];
  recommendations: string[];
  generated_at?: string | null;
}

export interface PersistedDailyReportResponse {
  report_date: string;
  stats: DailyStats;
  insights?: DailyInsights | null;
  ai_provider?: string | null;
  ai_model?: string | null;
  regenerated_count: number;
  generated_at?: string | null;
  next_scheduled_at?: string | null;
  generated_now?: boolean;
}

export interface ReportSettingsResponse {
  has_key: boolean;
  key_preview?: string | null;
  model: string;
  source?: string | null;
  next_scheduled_at?: string | null;
}

export interface ReportSettingsRequest {
  api_key?: string | null;
  model?: string | null;
}

// ══════════════════════════════════════════════
// View (view_schema.py)
// ══════════════════════════════════════════════

export interface ViewCreateRequest {
  audio_id: number | null;
  video_id: number;
}

export interface ViewResponse {
  id: number;
  name: string | null;
  audio_id: number | null;
  video_id: number;
  cache_path: string | null;
  created_at: string | null;
  flv_url: string | null;
  webrtc_url: string | null;
  rtmp_url: string | null;
  warnings: string[];
}

// ══════════════════════════════════════════════
// Named Person (named_person.py)
// ══════════════════════════════════════════════

export interface PersonCreate {
  name: string;
}

export interface PersonUpdate {
  name?: string | null;
}

export interface PersonResponse {
  id: number;
  name: string;
  avatar_path: string | null;
  feat_json_id: string | null;
  created_at: string;
}

export type PersonListResponse = PaginatedResponse<PersonResponse>;

// ══════════════════════════════════════════════
// WSS Commands (wss/node_commands.py)
// ══════════════════════════════════════════════

export interface DeviceInfo {
  id: number;
  name: string;
}

export interface ConnectRequest {
  token: string;
}

export interface ConnectResponse {
  session_token: string;
  videos: DeviceInfo[];
  audios: DeviceInfo[];
}

export interface UpdateStreamRequest {
  command: 'UPDATE_STREAM';
  device_type: 'audio' | 'video';
  device_id: number;
  enable: boolean;
}

export interface UpdateStreamResponse {
  success: boolean;
  message: string | null;
}

// ══════════════════════════════════════════════
// Event (event.py)
// ══════════════════════════════════════════════

export interface EventResponse {
  id: number;
  view_id: number;
  exception_id: number;
  recording_id: number | null;
  timestamp: string;
}

export interface EventListResponse {
  items: EventResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExceptionStatsItem {
  exception_id: number;
  exception_severity: string;
  count: number;
}

export interface TrendItem {
  period: string;
  count: number;
}

// ══════════════════════════════════════════════
// Recording (replay.py)
// ══════════════════════════════════════════════

export interface RecordingResponse {
  id: number;
  view_id: number;
  file_path: string;
  start_time: string;
  end_time: string | null;
}

// ══════════════════════════════════════════════
// Custom Stream Device (device_schema.py)
// ══════════════════════════════════════════════

export interface DeviceCreateRequest {
  device_type: 'video' | 'audio';
  name: string;
  stream_url: string;
}

export interface DeviceCreateResponse {
  id: number;
  name: string;
  device_type: string;
  node_id: number;
  stream_url: string | null;
}
