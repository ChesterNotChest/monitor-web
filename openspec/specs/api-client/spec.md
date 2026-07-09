# API Client

类型化的 REST API 调用层。

## Purpose

按 server 15 个 Router 的端点定义对应 TypeScript 函数签名。API 就绪前函数体为 stub（列表返回空数据，变更抛出未实现错误），类型签名完全匹配 server API contract。

## Requirements

### Requirement: Typed API function per server endpoint

The system SHALL define one exported async function per server REST endpoint, with TypeScript signatures matching the server's response model.

#### Scenario: Function exists for each router prefix

- **WHEN** checking the API client module
- **THEN** there SHALL be typed functions covering every server router prefix (auth, dashboard, alerts, alert-groups, devices, detection, exceptions, fences, logs, nodes, reports, users, views, persons)

#### Scenario: Function return type matches server Pydantic response

- **WHEN** calling `fetchAlerts(1)`
- **THEN** the return type SHALL be `Promise<AlertListResponse>`

#### Scenario: Function parameters match server query/body parameters

- **WHEN** a server endpoint accepts `page` and `page_size` query params
- **THEN** the corresponding client function SHALL accept those parameters with correct types

### Requirement: Stub implementations that return empty or safe defaults

The system SHALL implement each API function body with a stub that returns an empty or safe default value matching the return type.

#### Scenario: List endpoint stub returns empty array

- **WHEN** calling a list endpoint function before the real API is ready
- **THEN** it SHALL return `{ items: [], total: 0, page: 1, page_size: 20 }` (or equivalent empty list)

#### Scenario: Mutation endpoint stub throws descriptive error

- **WHEN** calling a POST/PUT/DELETE endpoint function before the real API is ready
- **THEN** it SHALL throw an Error with message indicating the endpoint is not yet connected

### Requirement: Single source of truth for API base URL

The system SHALL read the API base URL from a centralized config module (`src/api/config.ts`) rather than hardcoding it in each function.

#### Scenario: Base URL change requires one file edit

- **WHEN** the API server address changes
- **THEN** only the config or environment variables need updating
