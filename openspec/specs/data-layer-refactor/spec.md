# Data Layer Refactor

全局数据层改造——移除 mock 数据依赖，切换到 server-aligned 类型和种子数据。

## Purpose

删除 `src/data/mock.ts` 及其所有引用，用 server-aligned 类型替换所有页面和 Context 的类型定义。AuthContext 从 mock 登录切换为 token-based 签名，AlertContext 从 mock 数组切换为 server-aligned 类型。保留最小种子数据供开发期间页面渲染。

## Requirements

### Requirement: Remove mock data dependency

The system SHALL delete `src/data/mock.ts` and remove all direct imports of mock data arrays from every file that currently references them.

#### Scenario: mock.ts no longer exists

- **WHEN** searching for `src/data/mock.ts`
- **THEN** the file SHALL NOT exist

#### Scenario: No page imports mock data

- **WHEN** searching for `from '../data/mock'` or `from '../../data/mock'` across all source files
- **THEN** there SHALL be zero matches

### Requirement: Minimal seed data in new types

The system SHALL provide `src/api/seed.ts` containing 1-3 structurally correct sample records per entity, using the server-aligned TypeScript interfaces from `api-types`.

#### Scenario: Seed data uses server-aligned types

- **WHEN** checking seed data entries
- **THEN** every object SHALL be typed with interfaces from `src/api/types.ts` (all IDs are `number`, fields match server schema)

#### Scenario: Seed data has minimal volume

- **WHEN** a developer views `seed.ts`
- **THEN** each entity array SHALL contain at most 3 entries

#### Scenario: Pages can initialize from seed data

- **WHEN** a page component mounts
- **THEN** its `useState` initial value MAY reference a `seedXxx` array from `seed.ts`

### Requirement: AuthContext uses token-based signature

The system SHALL refactor `AuthContext` to use `UserResponse` type (from `api-types`) and expose a `login(username, password)` function returning `Promise<LoginResponse | null>`.

#### Scenario: Login returns typed response

- **WHEN** `login()` is called with valid credentials
- **THEN** the return type SHALL be `Promise<LoginResponse | null>` matching the server's `POST /auth/login` response shape

#### Scenario: Context stores token

- **WHEN** a user successfully logs in
- **THEN** the context SHALL store `access_token` and `token_type` alongside the user object

#### Scenario: Login stub returns null

- **WHEN** `login()` is called in development (API not connected)
- **THEN** the function SHALL return `null` (indicating the real auth endpoint is unavailable)

### Requirement: AlertContext uses AlertResponse type

The system SHALL refactor `AlertContext` to use `AlertResponse` type (from `api-types`) and expose `markHandled(id: number)` and `markFalseAlarm(id: number)` actions matching server endpoints.

#### Scenario: Alerts array uses server type

- **WHEN** accessing `alerts` from AlertContext
- **THEN** each element SHALL be of type `AlertResponse`

#### Scenario: Actions match server endpoints

- **WHEN** calling `markHandled(1)`
- **THEN** it SHALL match the `PUT /alerts/1/handle` server endpoint signature

### Requirement: Page components use new types

The system SHALL update all 12 page components to use types from `src/api/types.ts` instead of `src/data/mock.ts`.

#### Scenario: TypeScript compilation passes

- **WHEN** running `tsc --noEmit`
- **THEN** there SHALL be zero type errors related to mock data or old interfaces

#### Scenario: ID comparisons use number type

- **WHEN** a page compares `item.id === selectedId`
- **THEN** both operands SHALL be of type `number`
