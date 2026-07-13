# Monitor Web

监控系统 Web 前端 — React + TypeScript + Vite。通过 REST API 与 Monitor Server 通信，WebRTC WHEP 播放实时画面，flv.js 播放录制回放。

## 目录结构

```
monitor-web/
├── src/
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件（AuthProvider → AlertProvider → Router）
│   ├── api/                    # API 层
│   │   ├── config.ts           #   运行时配置（env → base URL）
│   │   ├── types.ts            #   Server Pydantic → TypeScript 类型映射
│   │   ├── enums.ts            #   Server 枚举 + 中文标签
│   │   ├── client.ts           #   完整 REST API 封装（~500 行，fetch + JWT）
│   │   └── seed.ts             #   [已废弃] 开发用假数据
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   │   ├── AppLayout.tsx   #   侧边栏 + 面包屑 + 内容区
│   │   │   ├── Sidebar.tsx     #   可折叠导航（告警 badge、用户菜单）
│   │   │   └── Breadcrumb.tsx  #   动态路径面包屑
│   │   └── ui/                 # UI 原子组件
│   │       ├── Badge.tsx       #   状态标签
│   │       ├── Button.tsx      #   按钮（primary/secondary/danger/ghost）
│   │       ├── Card.tsx        #   卡片（selected/disabled/hoverable）
│   │       ├── Panel.tsx       #   侧滑面板（framer-motion 动画）
│   │       ├── Skeleton.tsx    #   骨架屏占位
│   │       ├── StatusDot.tsx   #   在线/离线/告警状态点
│   │       └── TableFilter.tsx #   表格筛选下拉
│   ├── context/
│   │   ├── AuthContext.tsx      #   认证状态（JWT 登录/登出/token 验证）
│   │   ├── AlertContext.tsx     #   告警状态（30s 轮询 + 处理）
│   │   └── CameraContext.tsx    #   本地视图管理
│   ├── hooks/
│   │   ├── useWhepPlayer.ts    #   WebRTC WHEP 直播播放器 hook
│   │   └── useViewTransition.ts #  View Transition API 导航
│   ├── pages/                  # 页面组件（14 个路由）
│   │   ├── Login.tsx           #   登录页
│   │   ├── MainDashboard.tsx   #   主面板（KPI + 视图网格 + 创建 View）
│   │   ├── LiveMonitor.tsx     #   直播监控（WebRTC WHEP + 告警侧栏）
│   │   ├── EventReplay.tsx     #   事件回放（flv.js + 拖拽进度条）
│   │   ├── FenceEditor.tsx     #   电子围栏（WHEP 视频 + canvas 围栏叠加）
│   │   ├── DeviceInfo.tsx      #   设备信息（Node 树 + 增添视图）
│   │   ├── ExceptionSettings.tsx # 异常设置（CRUD + 告警组响应动作）
│   │   ├── LogCenter.tsx       #   日志中心（日志列表 + 日报/周报入口）
│   │   ├── ReportDetail.tsx    #   日报详情
│   │   ├── WeeklyReportDetail.tsx # 周报详情
│   │   ├── UserManagement.tsx  #   用户管理（CRUD + 角色变更）
│   │   ├── CharacterManagement.tsx # 命名人物管理（CRUD + 头像上传）
│   │   └── EventStats.tsx      #   事件统计（按异常分组 + 趋势图）
│   ├── router/
│   │   └── index.tsx           #   React Router v7 路由配置（懒加载 + AuthGuard）
│   └── styles/
│       ├── tokens.css          #   CSS 自定义属性（暗色主题设计系统）
│       ├── global.css          #   全局重置 + 滚动条样式
│       └── transitions.css     #   动画（shimmer/pulse-ring/view-transition）
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.development
└── .env.example
```

---

## 环境准备

前置条件：已安装 **Node.js** ≥18。

### 1. 安装依赖

```bash
cd monitor-web
npm install
```

### 2. 配置环境变量

`.env.development` 已提供默认值：

```env
VITE_SERVER_BASE_URL=http://localhost
VITE_API_PORT=8000
VITE_WEBRTC_PORT=8080
```

- `VITE_SERVER_BASE_URL` — Server 主机地址（不含端口）
- `VITE_API_PORT` — Server REST API 端口
- `VITE_WEBRTC_PORT` — SRS HTTP 端口（WebRTC/HTTP-FLV）

### 3. 启动开发服务器

```bash
npm run dev
```

默认 http://localhost:5173。

### 4. 构建生产包

```bash
npm run build
```

输出到 `dist/`。


---

## API 路径规则

前端所有 REST 调用统一写在 `src/api/client.ts`。生产 Server 经 nginx 暴露在 `:8081` 时，FastAPI 的 307 尾斜杠重定向可能生成不带 `:8081` 的 Location，浏览器会表现为 CORS 或 `Failed to fetch`。因此 API 路径必须和后端路由完全一致：

- 设备列表使用 `/nodes/`，不要写 `/nodes`。
- 创建/列表 View 使用 `/views/`。
- 查询单个 View 使用 `/views/{id}`。
- 删除单个 View 使用 `/views/{id}`，不要写 `/views/{id}/`。

如果浏览器控制台出现从 `http://10.126.59.25:8081/...` 重定向到 `http://10.126.59.25/...` 的请求，优先检查 `client.ts` 对应路径的尾斜杠。

---

## 依赖

| 包 | 用途 |
|---|---|
| `react` ^19 | UI 框架 |
| `react-dom` ^19 | DOM 渲染 |
| `react-router-dom` ^7 | 路由 |
| `flv.js` | FLV 录制回放（MSE 解码） |
| `lucide-react` | 图标库 |
| `framer-motion` | Panel 侧滑动画 |
| `vite` ^8 | 构建工具 |
| `typescript` ~6 | 类型检查 |

---

## 架构

```
浏览器
├── AuthContext         ← 登录/登出 → POST /auth/login, GET /auth/me
├── AlertContext        ← 30s 轮询 → GET /alerts
├── MainDashboard       ← KPI + 视图列表 → GET /dashboard/stats, GET /views
│   └── 创建 View       ← 设备选择 → GET /nodes, GET /nodes/{id}/videos
│                       ← POST /views（约 8s）
├── LiveMonitor         ← WebRTC WHEP → view.webrtc_url
│   └── 告警面板        ← 过滤 alerts by view_id
├── EventReplay         ← FLV 回放 → GET /events/{id}, GET /recordings/{id}/stream
│   └── 标记处理        ← PUT /alerts/{id}/handle
├── FenceEditor         ← WHEP 视频 + canvas 围栏 → GET /fences, POST /fences
├── ExceptionSettings   ← CRUD → GET/POST/PUT/DELETE /exceptions
├── UserManagement      ← CRUD → GET/POST/PUT /users
├── CharacterManagement ← CRUD + 头像上传 → GET/POST/PUT/DELETE /persons
├── DeviceInfo          ← Node 设备树 → GET /nodes
├── LogCenter           ← 日志 → GET /logs
├── ReportDetail        ← 报表 → GET /reports/weekly
└── EventStats          ← 事件统计 → GET /events/stats/by-exception, /events/stats/trend
```

### 播放链路

```
直播:  SRS :8080 → WebRTC WHEP → RTCPeerConnection → <video>
回放:  Server /recordings/{id}/stream → HTTP-FLV → flv.js → <video>
```

### 状态处理

- **loading** — 全局使用 Skeleton 骨架屏占位
- **error** — 错误文案 + "重试"按钮
- **empty** — 中文提示（"暂无数据"等）

---

## 认证

使用 JWT Bearer Token。`AuthContext` 管理完整生命周期：

1. `POST /auth/login` → 存储 `access_token` + `user` 到 localStorage
2. 所有 API 请求通过 `baseFetch()` 自动注入 `Authorization: Bearer <token>`
3. 应用 mount 时通过 `GET /auth/me` 验证 token 有效性
4. 401 响应全局处理 → 清除 token → 跳转登录页
5. 登出时 `POST /auth/logout` + 清除 localStorage

首次启动时 Server 自动生成管理员账户，密码写入 `monitor-server/admin_password.txt`。

---

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | Login | 公开 |
| `/main` | MainDashboard | KPI + 视图列表 + 创建 View |
| `/view/:cameraId` | LiveMonitor | WebRTC 直播 + 告警侧栏 |
| `/view/:viewId/edit` | FenceEditor | 围栏编辑 + 视频 + canvas |
| `/replay/:alertId` | EventReplay | FLV 回放 + 拖拽进度条 |
| `/log` | LogCenter | 日志 + 日报/周报入口 |
| `/report/:date` | ReportDetail | 日报 |
| `/weekly-report/:weekNum` | WeeklyReportDetail | 周报 |
| `/users` | UserManagement | 用户 CRUD |
| `/characters` | CharacterManagement | 人物 CRUD + 头像上传 |
| `/equipment` | DeviceInfo | Node 设备树 + 增添视图 |
| `/exception-settings` | ExceptionSettings | 异常 CRUD + 告警组详情 |
| `/event-stats` | EventStats | 事件统计表格 + 趋势图 |

---

## 开发约定

- 所有 API 调用通过 `src/api/client.ts`，页面不直接 fetch
- 类型定义对齐 Server Pydantic Schema（`src/api/types.ts`）
- 组件零外部 UI 库依赖，全部手写 inline style + CSS 变量
- 暗色主题设计系统定义在 `src/styles/tokens.css`
- FLV 为唯一视频回放格式（业务约束，不可引入 HLS/MP4/DASH）
- 直播使用 WebRTC WHEP，不使用 flv.js
