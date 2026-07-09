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
// YOLO 目标检测实体类别
// ══════════════════════════════════════════════

export const YOLOEntityType = {
  PERSON: 1,
  CAR: 2,
  TRUCK: 3,
  BUS: 4,
  MOTORCYCLE: 5,
  BICYCLE: 6,
  DOG: 7,
  CAT: 8,
  BIRD: 9,
  BACKPACK: 10,
  SUITCASE: 11,
  KNIFE: 12,
  GUN: 13,
  FIRE: 14,
  SMOKE: 15,
} as const;

export type YOLOEntityType = (typeof YOLOEntityType)[keyof typeof YOLOEntityType];

export const YOLOEntityLabel: Record<YOLOEntityType, string> = {
  [YOLOEntityType.PERSON]: '人员',
  [YOLOEntityType.CAR]: '轿车',
  [YOLOEntityType.TRUCK]: '卡车',
  [YOLOEntityType.BUS]: '公交车',
  [YOLOEntityType.MOTORCYCLE]: '摩托车',
  [YOLOEntityType.BICYCLE]: '自行车',
  [YOLOEntityType.DOG]: '狗',
  [YOLOEntityType.CAT]: '猫',
  [YOLOEntityType.BIRD]: '鸟',
  [YOLOEntityType.BACKPACK]: '背包',
  [YOLOEntityType.SUITCASE]: '行李箱',
  [YOLOEntityType.KNIFE]: '刀具',
  [YOLOEntityType.GUN]: '枪支',
  [YOLOEntityType.FIRE]: '火焰',
  [YOLOEntityType.SMOKE]: '烟雾',
};

// ══════════════════════════════════════════════
// SlowFast 行为识别类别
// ══════════════════════════════════════════════

export const SlowFastActionType = {
  WALKING: 1,
  RUNNING: 2,
  FALLING: 3,
  FIGHTING: 4,
  LOITERING: 5,
  CROWDING: 6,
  CLIMBING: 7,
  THROWING: 8,
  POINTING: 9,
  WAVING: 10,
  HUGGING: 11,
  PUSHING: 12,
  LYING_DOWN: 13,
  SITTING: 14,
  STANDING: 15,
} as const;

export type SlowFastActionType = (typeof SlowFastActionType)[keyof typeof SlowFastActionType];

export const SlowFastActionLabel: Record<SlowFastActionType, string> = {
  [SlowFastActionType.WALKING]: '行走',
  [SlowFastActionType.RUNNING]: '奔跑',
  [SlowFastActionType.FALLING]: '跌倒',
  [SlowFastActionType.FIGHTING]: '打架',
  [SlowFastActionType.LOITERING]: '徘徊',
  [SlowFastActionType.CROWDING]: '聚集',
  [SlowFastActionType.CLIMBING]: '攀爬',
  [SlowFastActionType.THROWING]: '投掷',
  [SlowFastActionType.POINTING]: '指向',
  [SlowFastActionType.WAVING]: '挥手',
  [SlowFastActionType.HUGGING]: '拥抱',
  [SlowFastActionType.PUSHING]: '推搡',
  [SlowFastActionType.LYING_DOWN]: '躺倒',
  [SlowFastActionType.SITTING]: '坐着',
  [SlowFastActionType.STANDING]: '站立',
};

// ══════════════════════════════════════════════
// YAMNet 音频分类类别
// ══════════════════════════════════════════════

export const YAMNetSoundType = {
  GUNSHOT: 1,
  SCREAM: 2,
  SIREN: 3,
  EXPLOSION: 4,
  GLASS_BREAKING: 5,
  DOG_BARKING: 6,
  CAR_HORN: 7,
  ENGINE: 8,
  BABY_CRYING: 9,
  ALARM: 10,
  THUNDER: 11,
  WIND: 12,
  RAIN: 13,
  FOOTSTEPS: 14,
  SILENCE: 15,
} as const;

export type YAMNetSoundType = (typeof YAMNetSoundType)[keyof typeof YAMNetSoundType];

export const YAMNetSoundLabel: Record<YAMNetSoundType, string> = {
  [YAMNetSoundType.GUNSHOT]: '枪声',
  [YAMNetSoundType.SCREAM]: '尖叫声',
  [YAMNetSoundType.SIREN]: '警笛声',
  [YAMNetSoundType.EXPLOSION]: '爆炸声',
  [YAMNetSoundType.GLASS_BREAKING]: '玻璃破碎声',
  [YAMNetSoundType.DOG_BARKING]: '犬吠声',
  [YAMNetSoundType.CAR_HORN]: '汽车喇叭声',
  [YAMNetSoundType.ENGINE]: '引擎声',
  [YAMNetSoundType.BABY_CRYING]: '婴儿哭声',
  [YAMNetSoundType.ALARM]: '警报声',
  [YAMNetSoundType.THUNDER]: '雷声',
  [YAMNetSoundType.WIND]: '风声',
  [YAMNetSoundType.RAIN]: '雨声',
  [YAMNetSoundType.FOOTSTEPS]: '脚步声',
  [YAMNetSoundType.SILENCE]: '静音',
};

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
