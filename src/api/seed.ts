/**
 * @deprecated 最小种子数据 —— 仅供开发阶段页面不白屏。
 * 所有页面已迁移至真实 API 调用，此文件不再被任何页面 import。
 * 保留作为离线开发 fallback，生产环境可安全删除。
 *
 * 来源：monitor-server/src/seed.py → 对应 HTTP Schema
 */

import type {
  AlertGroupResponse,
  FenceResponse,
  NodeResponse,
  PersonResponse,
  UserResponse,
  ViewResponse,
} from './types';
import type { ExceptionResponse } from './types';

// ── Users ─────────────────────────────────────

export const seedUsers: UserResponse[] = [
  { id: 1, username: 'admin', role: 'operator', is_active: true },
];

// ── Persons ───────────────────────────────────

export const seedPersons: PersonResponse[] = [
  {
    id: 1,
    name: '张三',
    avatar_path: null,
    feat_json_id: null,
    created_at: '2026-07-01T08:00:00Z',
  },
  {
    id: 2,
    name: '李四',
    avatar_path: null,
    feat_json_id: null,
    created_at: '2026-07-02T10:30:00Z',
  },
];

// ── Nodes ─────────────────────────────────────

export const seedNodes: NodeResponse[] = [
  { id: 1, is_connected: true, last_seen: '2026-07-09T16:00:00Z' },
];

// ── Views ─────────────────────────────────────

export const seedViews: ViewResponse[] = [
  {
    id: 1,
    audio_id: 1,
    video_id: 1,
    cache_path: null,
    created_at: '2026-07-09T08:00:00Z',
    flv_url: null,
    webrtc_url: null,
    rtmp_url: null,
    warnings: [],
  },
  {
    id: 2,
    audio_id: 2,
    video_id: 2,
    cache_path: null,
    created_at: '2026-07-09T09:00:00Z',
    flv_url: null,
    webrtc_url: null,
    rtmp_url: null,
    warnings: [],
  },
];

// ── Alert Groups ──────────────────────────────

export const seedAlertGroups: AlertGroupResponse[] = [
  { id: 1, name: '高危告警', created_at: '2026-07-01T00:00:00Z', responses: [] },
  { id: 2, name: '中危告警', created_at: '2026-07-01T00:00:00Z', responses: [] },
  { id: 3, name: '低危告警', created_at: '2026-07-01T00:00:00Z', responses: [] },
];

// ── Fences ────────────────────────────────────

export const seedFences: FenceResponse[] = [
  {
    id: 1,
    name: '围栏1',
    view_id: 1,
    coords: [[0, 0], [200, 0], [200, 150], [0, 150]],
    dwell_time: 10,
    density: 0.6,
    leave_frames: 5,
  },
];

// ── Exceptions ────────────────────────────────
// ⚠️ Server ExceptionResponse 目前仅 { id }，待补全后充实种子数据

export const seedExceptions: ExceptionResponse[] = [];
