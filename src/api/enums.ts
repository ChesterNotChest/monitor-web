/**
 * Server 枚举的 TypeScript 映射 —— 来自 monitor-server/src/constants.py。
 * 每个枚举附带中文显示标签，供 UI 直接使用。
 */

// ══════════════════════════════════════════════
// 严重级别
// ══════════════════════════════════════════════

export const SeverityLevel = {
  INFO: 1,
  WARNING: 2,
  CRITICAL: 3,
  EMERGENCY: 4,
} as const;

export type SeverityLevel = (typeof SeverityLevel)[keyof typeof SeverityLevel];

export const SeverityLabel: Record<SeverityLevel, string> = {
  [SeverityLevel.INFO]: '信息',
  [SeverityLevel.WARNING]: '警告',
  [SeverityLevel.CRITICAL]: '严重',
  [SeverityLevel.EMERGENCY]: '紧急',
};

/** severity int → CSS Badge level */
export const SeverityBadgeLevel: Record<SeverityLevel, 'neutral' | 'warning' | 'danger' | 'danger'> = {
  [SeverityLevel.INFO]: 'neutral',
  [SeverityLevel.WARNING]: 'warning',
  [SeverityLevel.CRITICAL]: 'danger',
  [SeverityLevel.EMERGENCY]: 'danger',
};

// ══════════════════════════════════════════════
// 用户角色
// ══════════════════════════════════════════════

export const Role = {
  SECURITY_GUARD: 'security_guard',
  MANAGER: 'manager',
  OPERATOR: 'operator',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const RoleLabel: Record<Role, string> = {
  [Role.SECURITY_GUARD]: '安全员',
  [Role.MANAGER]: '管理员',
  [Role.OPERATOR]: '运维员',
};

// ══════════════════════════════════════════════
// AI 检测枚举类型
// ══════════════════════════════════════════════
//
// 实体/行为/声音/围栏/人脸的类型列表和标签，应通过 API 动态获取：
//   GET /detection/entity-types/
//   GET /detection/action-types/
//   GET /detection/sound-types/
//   GET /detection/fence-event-types/
//   GET /face-recognition-results/
//
// API 返回的 DetectionTypeResponse 包含 id 和 name，即为唯一真相来源。
// 不要再硬编码这些枚举值。

// ══════════════════════════════════════════════
// 响应动作类型
// ══════════════════════════════════════════════

export const ResponseActionType = {
  TRIGGER_RECORDING: 1,
  SEND_NOTIFICATION: 2,
  ACTIVATE_ALARM: 3,
  CALL_API: 4,
  SEND_EMAIL: 5,
} as const;

export type ResponseActionType = (typeof ResponseActionType)[keyof typeof ResponseActionType];

export const ResponseActionLabel: Record<ResponseActionType, string> = {
  [ResponseActionType.TRIGGER_RECORDING]: '触发录像',
  [ResponseActionType.SEND_NOTIFICATION]: '发送通知',
  [ResponseActionType.ACTIVATE_ALARM]: '激活警报',
  [ResponseActionType.CALL_API]: '调用API',
  [ResponseActionType.SEND_EMAIL]: '发送邮件',
};
