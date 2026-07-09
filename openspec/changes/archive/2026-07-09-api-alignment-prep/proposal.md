## Why

当前前端 14 个文件依赖 `src/data/mock.ts` 中自造的假数据——类型定义、枚举值、ID 体系全部与 monitor-server 的 Pydantic Schema / 数据库模型不一致。Server API 就绪后，前端类型层面无法直接对接，需要大量事后补救。现在趁 API 尚未完成，提前铺设类型对齐的数据中间层，后续 API 接入只需"插线"。

## What Changes

- **删除** `src/data/mock.ts` 中所有用于测试展示的假数据数组（保留少量结构正确的种子数据供开发使用）
- **新增** `src/api/types.ts`：从 server Pydantic Schema 逐字段翻译的 TypeScript 类型定义（AlertResponse, UserResponse, ExceptionResponse 等 14+ 个类型）
- **新增** `src/api/enums.ts`：server `constants.py` 中 SeverityLevel、Role、YOLOEntityType、SlowFastActionType、YAMNetSoundType 等枚举的 TS 映射与中文标签
- **新增** `src/api/client.ts`：类型化的 API 客户端骨架（函数签名对齐全量 REST 端点，函数体留 stub）
- **新增** `.env` / `.env.development`：`VITE_SERVER_BASE_URL`、`VITE_API_PORT`、`VITE_WEBRTC_PORT` 三个构建时配置入口
- **新增** `src/api/config.ts`：从 env 变量组装 `apiBase` 和 `webrtcBase` 的统一配置模块
- **改动** `AuthContext`：类型改为 `UserResponse`，`login()` / `logout()` 改为 token-based 签名（内部暂用 stub），移除 `mockUsers` 依赖
- **改动** `AlertContext`：类型改为 `AlertResponse`，操作改为 `markHandled()` / `markFalseAlarm()`（内部暂为本地状态），移除 `mockAlerts` 依赖
- **改动** 12 个页面：所有 `useState(mockXxx)` 改为 `useState<ServerType>(seedData)` 或空初始值；ID 类型 `string` → `number`
- **改动** 路由参数类型：`/replay/:eventId` 等参数从 `string` 改为 `number`

## Capabilities

### New Capabilities

- `api-types`: Server Pydantic Schema 到 TypeScript 的类型映射层——AlertResponse、UserResponse、NodeResponse、ViewResponse、ExceptionResponse、DashboardStats 等全部 HTTP schema 的 TS 对应类型。ID 统一为 `number`，枚举统一为 server 定义的 int/str enum 值。
- `api-enums`: Server `constants.py` 中所有枚举的 TypeScript 映射——SeverityLevel(1-4)、Role(三值 str)、YOLOEntityType(1-15)、SlowFastActionType(1-15)、YAMNetSoundType(1-15)、ResponseActionType(1-5)，每个附带中文显示标签。
- `api-client`: 类型化的 API 调用层——按 server 15 个 Router 的端点，定义对应的请求/响应函数签名。函数体在此期间为 stub（返回空数据或抛 "not implemented"），但类型签名完全匹配 server API contract。
- `api-config`: 前端运行时配置——从 Vite 环境变量（`VITE_SERVER_BASE_URL`、`VITE_API_PORT`、`VITE_WEBRTC_PORT`）组装 `apiBase` 和 `webrtcBase` 等统一 URL 入口，供 api-client 和各组件引用。
- `data-layer-refactor`: 全局数据层改造——AuthContext 从 mock 登录切换为 token-based 签名，AlertContext 从 mock 数组切换为 server-aligned 类型，所有页面移除对 `mock.ts` 的导入依赖，改用新的 api-types 和少量种子数据。

### Modified Capabilities

<!-- ui-foundation 的 specs 定义的是 UI 行为（页面布局、组件交互、路由过渡），本 change 不改这些——只替换数据层的类型和来源。page-routing 的路由参数类型从 string 改为 number，属于实现细节调整，不影响路由结构 spec。 -->

## Impact

- **代码**：`src/data/mock.ts` 删除，新增 `src/api/` 目录（types.ts、enums.ts、client.ts、config.ts、seed.ts）
- **页面**：12 个页面文件 + 2 个 Context 文件全部修改（换类型引用、换初始数据），但 UI 结构和交互不变
- **依赖**：无需新增 npm 包（Vite 环境变量为内置能力，类型定义为纯 TS）
- **路由**：参数类型 string→number，不影响路由匹配，React Router 内部自动转换
- **breaking**：无。当前无 API 消费者，mock 数据仅内部开发使用
