## 1. 环境变量与配置

- [x] 1.1 创建 `.env.development`，填入 `VITE_SERVER_BASE_URL`、`VITE_API_PORT`、`VITE_WEBRTC_PORT` 默认值
- [x] 1.2 创建 `.env.example`，列出三项变量及注释
- [x] 1.3 创建 `src/api/config.ts`，组装 `apiBase`、`webrtcBase`、`serverBaseUrl`

## 2. 枚举常量定义

- [x] 2.1 创建 `src/api/enums.ts`，定义 `SeverityLevel` 映射（int + 中文标签 + CSS class）
- [x] 2.2 添加 `Role` 枚举映射（str value + 中文标签）
- [x] 2.3 添加 `YOLOEntityType`、`SlowFastActionType`、`YAMNetSoundType` 映射（int + 中文标签）
- [x] 2.4 添加 `ResponseActionType` 映射（int + 中文标签）

## 3. API 类型定义

- [x] 3.1 创建 `src/api/types.ts`，定义 `PaginatedResponse<T>` 泛型
- [x] 3.2 翻译 auth schema → `LoginRequest`、`LoginResponse`、`UserResponse`
- [x] 3.3 翻译 alert schema → `AlertResponse`、`AlertListResponse`
- [x] 3.4 翻译 alert_group schema → `AlertGroupCreate`、`AlertGroupResponse`
- [x] 3.5 翻译 dashboard schema → `DashboardStats`、`AlertTrendPoint`、`DashboardTrends`
- [x] 3.6 翻译 device/node schema → `NodeDeviceResponse`、`NodeHealthResponse`、`NodeResponse`、`VideoDeviceResponse`、`AudioDeviceResponse`
- [x] 3.7 翻译 detection schema → `DetectionTypeCreate`、`DetectionTypeResponse`
- [x] 3.8 翻译 exception schema → `ExceptionCreate`、`ExceptionResponse`
- [x] 3.9 翻译 fence schema → `FenceCreate`、`FenceResponse`
- [x] 3.10 翻译 log schema → `LogEntry`、`LogListResponse`
- [x] 3.11 翻译 report schema → `ReportItem`、`ReportResponse`
- [x] 3.12 翻译 view schema → `ViewCreateRequest`、`ViewResponse`
- [x] 3.13 翻译 named_person schema → `PersonCreate`、`PersonUpdate`、`PersonResponse`、`PersonListResponse`
- [x] 3.14 翻译 WSS schema → `DeviceInfo`、`ConnectRequest`、`ConnectResponse`、`UpdateStreamRequest`、`UpdateStreamResponse`

## 4. API Client 骨架

- [x] 4.1 创建 `src/api/client.ts`，导入 config 和 types
- [x] 4.2 实现 auth 端点 stub（`login`、`logout`、`fetchCurrentUser`）
- [x] 4.3 实现 alert 端点 stub（`fetchAlerts`、`markAlertHandled`、`markAlertFalseAlarm`）
- [x] 4.4 实现 alert-group 端点 stub（`fetchAlertGroups`、`createAlertGroup`、`updateAlertGroup`、`deleteAlertGroup`）
- [x] 4.5 实现 dashboard 端点 stub（`fetchDashboardStats`、`fetchDashboardTrends`）
- [x] 4.6 实现 device/node 端点 stub（`fetchNodes`、`fetchNodeHealth`、`fetchNodeVideos`、`fetchNodeAudios`）
- [x] 4.7 实现 detection 端点 stub（entity/action/sound types CRUD）
- [x] 4.8 实现 exception 端点 stub（CRUD）
- [x] 4.9 实现 fence 端点 stub（CRUD）
- [x] 4.10 实现 log 端点 stub（`fetchLogs`、`fetchLogById`）
- [x] 4.11 实现 report 端点 stub（`fetchWeeklyReport`、`fetchMonthlyReport`）
- [x] 4.12 实现 view 端点 stub（`createView`、`fetchViews`、`fetchViewById`、`deleteView`）
- [x] 4.13 实现 person 端点 stub（CRUD + `uploadAvatar`）
- [x] 4.14 实现 user 端点 stub（`fetchUsers`、`createUser`、`updateUserRole`、`deactivateUser`）

## 5. 种子数据

- [x] 5.1 创建 `src/api/seed.ts`，导入新 types
- [x] 5.2 定义 `seedUsers`（1 条 admin 记录）
- [x] 5.3 定义 `seedPersons`（2 条命名人物记录）
- [x] 5.4 定义 `seedNodes`（1 条节点记录）
- [x] 5.5 定义 `seedViews`（2 条视图记录）
- [x] 5.6 定义 `seedAlertGroups`（3 条告警分组记录）
- [x] 5.7 定义 `seedFences`（1 条围栏记录）
- [x] 5.8 定义 `seedExceptions`（待 server schema 补全后添加，暂时空数组）

## 6. AuthContext 改造

- [x] 6.1 移除 `mockUsers` 导入，改为 `UserResponse` / `LoginResponse` 类型
- [x] 6.2 将 `login()` 签名改为 `(username: string, password: string) => Promise<boolean>`
- [x] 6.3 新增 `token` 状态（`string | null`）
- [x] 6.4 `login()` 内部改为调用 `loginStub()`（暂返回 false），保留 token 存储逻辑
- [x] 6.5 移除 `switchUser()`，移除 `users` 列表暴露
- [x] 6.6 `logout()` 清除 token + user

## 7. AlertContext 改造

- [x] 7.1 移除 `mockAlerts` 导入，改为 `AlertResponse` 类型
- [x] 7.2 `alerts` 初始值改为 `[]`
- [x] 7.3 `updateAlert` 替换为 `markHandled(id: number)` 和 `markFalseAlarm(id: number)`
- [x] 7.4 两个新方法内部暂为本地 state 操作（标记对应的 alert 状态）

## 8. 页面迁移——逐个替换 mock 依赖

- [x] 8.1 **Login.tsx**：适配新的 `login()` 签名（username 替代 name/id 登录）
- [x] 8.2 **MainDashboard.tsx**：KPI 从 `DashboardStats` 类型取，视图网格用 `seedViews`，告警列表用 `AlertContext.alerts`
- [x] 8.3 **LiveMonitor.tsx**：视图列表从 `seedViews` 取，移除 `mockCameras`
- [x] 8.4 **FenceEditor.tsx**：围栏数据从 `seedFences` 取（如已无 mock 依赖则跳过）
- [x] 8.5 **EventReplay.tsx**：告警数据从 `AlertContext.alerts` 取，ID 比较 `alert.id === Number(eventId)`
- [x] 8.6 **LogCenter.tsx**：移除 `mockReportDates`/`mockWeeks`，日期列表改为动态生成
- [x] 8.7 **ReportDetail.tsx**：移除 `mockReportRows`，报表数据从 API client `fetchWeeklyReport()` stub 取（初始空状态）
- [x] 8.8 **WeeklyReportDetail.tsx**：同上，移除 `mockWeeklyReportRows`
- [x] 8.9 **UserManagement.tsx**：`useState<UserResponse[]>(seedUsers)` 替代 `mockUsers`
- [x] 8.10 **CharacterManagement.tsx**：`useState<PersonResponse[]>(seedPersons)` 替代 `mockCharacters`
- [x] 8.11 **DeviceInfo.tsx**：设备树从 `seedNodes` 取，节点用 `NodeResponse` 类型
- [x] 8.12 **ExceptionSettings.tsx**：`useState<ExceptionResponse[]>(seedExceptions)`，等 server schema 补全后种子数据可用

## 9. 路由参数类型修正

- [x] 9.1 `EventReplay`：`useParams<{ eventId: string }>()` → 取值时 `Number(eventId)` 转换
- [x] 9.2 `LiveMonitor`：如有 `:cameraId` 参数同理转换
- [x] 9.3 `FenceEditor`：如有 `:viewId` 参数同理转换

## 10. 清理与验证

- [x] 10.1 删除 `src/data/mock.ts`
- [x] 10.2 全局搜索 `from.*mock` 确认零残留
- [x] 10.3 全局搜索 `: string` ID 字段确认已改为 `: number`
- [x] 10.4 运行 `npx tsc --noEmit` 确认零类型错误
- [x] 10.5 启动开发服务器，逐个页面确认渲染不报错、不白屏
