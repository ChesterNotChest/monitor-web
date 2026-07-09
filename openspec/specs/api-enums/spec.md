# API Enums

Server 枚举常量的 TypeScript 映射与中文标签。

## Purpose

将 monitor-server 的 `constants.py` 中所有枚举（SeverityLevel、Role、YOLOEntityType、SlowFastActionType、YAMNetSoundType、ResponseActionType）映射为 TypeScript 常量对象和中文显示标签，供 UI 组件直接使用。

## Requirements

### Requirement: Severity level enum with Chinese labels

The system SHALL define a TypeScript constant mapping that mirrors server's `SeverityLevel` IntEnum (values 1-4) with corresponding Chinese display labels.

#### Scenario: Severity to label lookup

- **WHEN** a component needs to display a severity level of 3 (CRITICAL)
- **THEN** the system SHALL return the Chinese label "严重"

#### Scenario: Severity to CSS class mapping

- **WHEN** a component needs a CSS class for severity styling
- **THEN** the system SHALL provide a mapping from severity int to semantic color class (danger/warning/caution/info)

### Requirement: User role enum

The system SHALL define a TypeScript mapping mirroring server's `Role` StrEnum (`security_guard`, `manager`, `operator`) with Chinese labels.

#### Scenario: Role display

- **WHEN** displaying a user's role
- **THEN** "security_guard" SHALL display as "安全员", "manager" as "管理员", "operator" as "运维员"

### Requirement: AI detection type enums

The system SHALL define TypeScript constant objects mirroring server's `YOLOEntityType` (1-15), `SlowFastActionType` (1-15), and `YAMNetSoundType` (1-15) IntEnums, each with Chinese display names.

#### Scenario: Entity type lookup

- **WHEN** an exception references entity type ID 1 (PERSON)
- **THEN** the system SHALL return the label "人员"

#### Scenario: Action type lookup

- **WHEN** an exception references action type ID 4 (FIGHTING)
- **THEN** the system SHALL return the label "打架"

#### Scenario: Sound type lookup

- **WHEN** an exception references sound type ID 2 (SCREAM)
- **THEN** the system SHALL return the label "尖叫声"

### Requirement: Response action type enum

The system SHALL define a TypeScript mapping mirroring server's `ResponseActionType` IntEnum (1-5).

#### Scenario: Response action display

- **WHEN** listing response actions for an exception configuration
- **THEN** each action ID SHALL map to a Chinese label
