## Context

前端 `src/data/mock.ts` 包含了自造的 TypeScript 接口和假数据数组，14 个文件直接依赖它。monitor-server 端有完整的 Pydantic Schema（`schema/http/` 下 14 个文件）、枚举常量（`constants.py`）、和 REST API 路由（`network/api/` 下 15 个 Router）。两端各自独立建模，类型定义、ID 类型、枚举值全部不一致。

本阶段不接入真实 API（API 尚未完成），但提前铺设类型对齐的数据中间层，让后续 API 接入只需替换函数体。

## Goals / Non-Goals

**Goals:**
- 将前端所有类型定义替换为 server Pydantic Schema 的 TS 映射，ID 全改 `number`
- 将前端枚举替换为 server `constants.py` 的 TS 映射
- 建立 `.env` → `config.ts` → `api-client` 的配置链路（`VITE_SERVER_BASE_URL`、`VITE_API_PORT`、`VITE_WEBRTC_PORT`）
- 创建类型化的 API 客户端骨架（签名正确，函数体 stub）
- AuthContext 改为 token-based 签名，AlertContext 改为 server-aligned 类型
- 保留少量结构正确的种子数据，保证开发时页面可渲染
- 所有页面移除 `mock.ts` 依赖，改用新类型和种子数据

**Non-Goals:**
- 不发起真实 HTTP 请求（API client 为 stub）
- 不实现 JWT 解码/验证逻辑（AuthContext 仅改签名）
- 不修改 ui-foundation 定义的 UI 结构和交互行为
- 不引入 React Query / SWR 等数据请求库（本阶段不需要）
- 不修改 server 端任何代码
- 不处理 WebSocket 实时推送

## Decisions

### D1：类型定义的源——Server Pydantic Schema 逐字段翻译

**选择**：以 server `schema/http/*.py` 中已导出的 Pydantic Response/Request 模型为唯一事实来源，逐字段翻译为 TypeScript `interface`。不对 server 类型做任何"前端友好"的改造。

**映射规则**：
| Python | TypeScript |
|--------|-----------|
| `int` | `number` |
| `str` | `string` |
| `bool` | `boolean` |
| `datetime` | `string`（ISO 8601） |
| `list[X]` | `X[]` |
| `X \| None` | `X \| null` |
| `Literal["a","b"]` | `"a" \| "b"` |

**理由**：减少心智转换成本。前端类型 = 后端类型的投影，不需要"适配层"。

**替代方案**：前端自造"UI 友好型"类型 → 增加了一层映射代码，且与 server 不同步时出 bug。

### D2：配置架构——三个独立 env vars → config.ts 组装

**选择**：

```
.env.development            config.ts（组装点）          使用方
═══════════════             ═══════════════             ══════
VITE_SERVER_BASE_URL ─┐     apiBase           ──→   api-client.ts
  (不含端口)           ├──→  webrtcBase        ──→   LiveMonitor 等
VITE_API_PORT ────────┘     serverBaseUrl     ──→   调试/日志
VITE_WEBRTC_PORT ─────────
```

`VITE_SERVER_BASE_URL` 不含端口（如 `http://192.168.1.100`），由 `config.ts` 拼接 `${BASE_URL}:${API_PORT}`。三者互不重叠，无冗余。

**理由**：
- SERVER_BASE_URL 不含端口，避免了端口出现在两处的冲突
- 三因子互不派生，配置意图清晰
- 部署时只需改 env，不需要改代码

### D3：种子数据策略——结构正确，体量最小

**选择**：删除 `mock.ts` 所有假数据数组，新建 `src/api/seed.ts`，每个实体保留 1-3 条用新类型定义的种子数据。

```
seed.ts 内容:
  seedUsers: UserResponse[]          // 1 条（admin）
  seedCameras/Views: ...             // 2-3 条
  seedAlerts: AlertResponse[]        // 0 条（AlertResponse 字段太少，无意义）
  seedPersons: PersonResponse[]      // 2 条
  seedNodes: ...                     // 1 条
  seedFences: ...                    // 1 条
```

每个页面的 `useState` 初始值从 `seedXxx` 取，不足 3 条的补空数组 `[]`。

**理由**：删除假数据消除"看起来能跑"的错觉；保留最小种子数据保证开发时页面不白屏。种子数据的结构 = server API 返回的结构，后续删掉 `seed.ts import`、换成 `fetch()` 即可切换。

### D4：API Client 骨架——签名真、函数体空

**选择**：`src/api/client.ts` 中的每个函数签名对应一个 server API 端点，类型严格匹配 Pydantic Response model。函数体返回空数据或 `throw new Error("Not implemented")`。

```typescript
// 示例
export async function fetchAlerts(page: number): Promise<AlertListResponse> {
  return { items: [], total: 0, page, page_size: 20 };
}
export async function markAlertHandled(id: number): Promise<void> {
  throw new Error("Not implemented");
}
```

**理由**：类型签名是"契约"的核心。函数体等 API 就绪再填，但各处引用已经可以写 `await fetchAlerts(1)` 且通过类型检查。

### D5：Context 改造——签名先行，逻辑后补

**AuthContext**：
```
现在: login(userId: string, password: string) → mockUsers.find()
改后: login(username: string, password: string) → Promise<LoginResponse | null>
      内部: return null  // stub，等 API 好了替换为 fetch
      新增: token: string | null 状态
```

**AlertContext**：
```
现在: alerts: Alert[], updateAlert(id: string, updates: Partial<Alert>)
改后: alerts: AlertResponse[], markHandled(id: number), markFalseAlarm(id: number)
      内部: 空数组初始化，操作改本地状态（等 API 好了替换为 PUT 调用）
```

### D6：目录结构

```
src/
├── api/                         ← 新建
│   ├── types.ts                 ← 全部 server-aligned 接口定义
│   ├── enums.ts                 ← 枚举常量 + 中文标签映射
│   ├── client.ts                ← 类型化 API 函数签名（stub）
│   ├── config.ts                ← 从 import.meta.env 组装 URL
│   └── seed.ts                  ← 最小种子数据（新类型）
├── data/
│   └── mock.ts                  ← 删除
├── context/
│   ├── AuthContext.tsx           ← 改：token-based 签名，移除 mockUsers
│   └── AlertContext.tsx          ← 改：AlertResponse 类型，移除 mockAlerts
├── pages/                       ← 12 个页面：全部移除 mock 导入，改用新类型
├── components/                  ← 不变
├── styles/                      ← 不变
└── router/                      ← 轻改：路由参数类型 string→number
```

### D7：ID 类型迁移——string → number

Server 所有 ID 为数据库自增 `int`。前端全部改为 `number`：

| 位置 | 原值示例 | 新值示例 |
|------|---------|---------|
| `Alert.id` | `"alert-001"` | `1` |
| `User.id` | `"user-1"` | `1` |
| `Camera.id` | `"cam-01"` | `1` |
| 路由参数 `:eventId` | `"alert-003"` | `"3"`（React Router 参数本身是 string，但比较时做 `Number()` 转换） |

## Risks / Trade-offs

- **[风险] Server Schema 后续变更** → 本 change 定义的类型可能与 server 后续修改产生偏差。缓解：类型定义集中在 `types.ts`，修改时只需改一个文件。建议 server schema 变更时同步通知前端。
- **[风险] API Client stub 可能被误用** → stub 返回空数组，调用方需处理空状态。缓解：页面已有 Skeleton 和空状态组件（ui-foundation 已做），渲染逻辑不受影响。
- **[取舍] 不引入 React Query** → 当前阶段手动管理请求状态代码略多。但 API 未就绪时引入数据请求库属于过早抽象。后续接入 API 时可平滑迁移到 React Query。
- **[取舍] AlertResponse 字段不足** → 当前 server `AlertResponse` 仅有 `{id, view_id, exception_id, timestamp}`，种子数据无法展示告警的 title/severity。缓解：告警相关页面在此阶段使用空数组初始化，等 server 补全 schema 后再加种子数据。

## Open Questions

- Server `ExceptionResponse` 目前只有 `id` 字段，补全后方可定义完整的 TS 类型和种子数据
- Server 暂无事件回放 API，`EventReplay` 页面的数据模型待后续定义
- 日志中心的语义差异（server `/logs` 是 syslog vs 前端展示的是告警时间线）需要后续与 server 端对齐
