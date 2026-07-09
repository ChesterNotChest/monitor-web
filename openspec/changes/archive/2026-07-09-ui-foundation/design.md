## Context

项目基于 React 19 + TypeScript + Vite 8，当前为空白脚手架。需基于 `public/` 目录中 10 个 SVG 线框图，构建完整的前端 UI 框架。本阶段**只搭 UI 外壳**（布局、导航、路由、页面骨架、通用组件），不接入任何业务逻辑或后端 API。

技术栈当前状态：
- `react` ^19.2.7, `react-dom` ^19.2.7
- `vite` ^8.1.1, `typescript` ~6.0.2
- 无 UI 组件库、无路由库、无动画库、无图标库

## Goals / Non-Goals

**Goals:**
- 建立可扩展的目录结构（pages/、components/、styles/、router/）
- 以暗色主题为默认的 CSS 变量体系（语义色、间距、圆角、阴影、字体层级）
- React Router v7 驱动的 10 页路由 + View Transition API 页面过渡
- 通用 UI 组件：Button (4 级)、Card (3 态)、Panel、StatusDot、Badge、Skeleton
- 10 个页面的组件骨架（布局 + 按钮 + 占位内容，无业务逻辑）
- 侧边栏 ↔ 各页面跳转链路完整可用
- framer-motion 处理面板滑入、列表动效等组件级动画

**Non-Goals:**
- 不接入后端 API（所有数据为静态 mock 或占位）
- 不实现视频流播放（视频区域用占位 div + 文字）
- 不实现表单验证和提交逻辑
- 不实现 WebSocket 实时推送
- 不实现用户认证/权限控制
- 不实现数据持久化
- 不编写单元/集成测试（本阶段仅 UI 骨架）
- 不做响应式适配（固定桌面端 1440+ 优先）

## Decisions

### D1：UI 组件策略——纯手写组件，不引入组件库

**选择**：基于 CSS Modules + CSS 变量手写所有组件，不引入 Ant Design / Mantine 等组件库。

**理由**：
- 监控台 UI 的视觉风格（高密度、暗色底、工业感）与通用组件库的设计语言差异大，大量覆写反而更重
- 当前阶段只需 6 个通用组件的骨架版本，手写成本低于引入库后定制
- 保持零运行时 CSS-in-JS 开销（监控台对渲染性能敏感）

**替代方案**：
- Ant Design 5：表格/表单能力强大，但默认设计偏"企业后台"而非"监控台"，且 tree-shaking 后仍 ~200KB+
- Mantine 7：暗色模式内置、轻量，但同样存在视觉风格偏差
- shadcn/ui：基于 Radix + Tailwind，高度可控，适合后续引入——当组件需求超过手写临界点时迁移

### D2：路由与页面过渡——React Router v7 + View Transition API

**选择**：`react-router-dom` v7（当前最新）作为路由层，浏览器原生 View Transition API 处理页面级过渡，framer-motion 处理组件级动画。

**路由结构**：
```
/                       → redirect to /main
/main                   → 主仪表盘
/view                   → 实时监控
/view/:viewId/edit      → 电子围栏编辑
/replay/:eventId        → 事件回放
/log                    → 日志中心
/report/:date           → 报表详情
/users                  → 用户管理
/characters             → 人物管理
/equipment              → 设备信息
/exception-settings     → 异常设置
```

**页面过渡策略**：
| 跳转类型 | 过渡方式 | 技术 |
|----------|---------|------|
| 模块切换（main→log, main→users 等）| crossfade 150-200ms | View Transition API (`startViewTransition`) |
| 下钻切换（main→view, log→report）| 共享元素 + 内容淡入 | View Transition API + `view-transition-name` |
| 原地切换（view↔edit）| 面板内容交叉淡入淡出 200ms | framer-motion `<AnimatePresence>` |
| 面板弹出（用户详情、告警详情）| 从右滑入 250ms | framer-motion `initial/animate/exit` |

### D3：目录结构

```
src/
├── main.tsx                    # ReactDOM.createRoot 入口
├── App.tsx                     # Layout + RouterProvider
├── router/
│   └── index.tsx               # 路由配置（lazy loading 10 页）
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # 侧边栏 + 面包屑 + <Outlet>
│   │   ├── Sidebar.tsx         # 可折叠侧边栏导航
│   │   └── Breadcrumb.tsx      # 面包屑
│   └── ui/
│       ├── Button.tsx          # 4 级按钮 + 尺寸变体 + loading 态
│       ├── Card.tsx            # 卡片（默认/选中/禁用/悬浮）
│       ├── Panel.tsx           # 右侧操作面板/抽屉
│       ├── StatusDot.tsx       # 状态指示灯（在线/离线/告警 + 动画）
│       ├── Badge.tsx           # 告警级别标签
│       └── Skeleton.tsx        # 骨架屏（文本/卡片/表格变体）
├── pages/
│   ├── MainDashboard.tsx       # 主仪表盘
│   ├── LiveMonitor.tsx         # 实时监控
│   ├── FenceEditor.tsx         # 电子围栏编辑
│   ├── EventReplay.tsx         # 事件回放
│   ├── LogCenter.tsx           # 日志中心
│   ├── ReportDetail.tsx        # 报表详情
│   ├── UserManagement.tsx      # 用户管理
│   ├── CharacterManagement.tsx # 人物管理
│   ├── DeviceInfo.tsx          # 设备信息
│   └── ExceptionSettings.tsx   # 异常设置
├── styles/
│   ├── tokens.css              # CSS 变量（色彩/间距/圆角/阴影/字体）
│   ├── global.css              # 全局样式（body/reset/base）
│   └── transitions.css         # 页面过渡 & 组件动画关键帧
└── data/
    └── mock.ts                 # 静态 mock 数据（告警/用户/设备等占位列表）
```

### D4：CSS 变量体系（Design Tokens）

采用三层结构：

**Primitive Tokens**（原始值）：
```css
--hue-red: 0;     --hue-orange: 25;   --hue-yellow: 45;
--hue-green: 142;  --hue-blue: 217;    --hue-purple: 260;
--spacing-unit: 4px;                   --radius-unit: 4px;
```

**Semantic Tokens**（语义映射）：
```css
/* 背景 */
--bg-canvas: #111318;         /* 页面底色 */
--bg-surface: #1a1d2a;        /* 卡片/面板底色 */
--bg-elevated: #242840;       /* 悬浮/弹窗 */
--bg-hover: rgba(255,255,255,0.06);

/* 语义色 */
--color-danger: #f04747;      /* 高危 */
--color-warning: #f59e0b;     /* 中危 */
--color-caution: #facc15;     /* 低危 */
--color-success: #22c55e;     /* 正常/已处理 */
--color-info: #3b82f6;        /* 信息/操作 */
--color-neutral: #6b7280;     /* 禁用/次要 */

/* 文字 */
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-disabled: #64748b;

/* 间距（基于 4px 单位） */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-6: 24px;  --space-8: 32px;

/* 圆角 */
--radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;

/* 阴影 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 8px rgba(0,0,0,0.5);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
```

**Component Tokens**（组件级别——在组件 CSS Module 中使用）：
```css
/* Button */
--btn-primary-bg: var(--color-info);
--btn-danger-bg: var(--color-danger);
--btn-radius: var(--radius-sm);

/* Card */
--card-bg: var(--bg-surface);
--card-radius: var(--radius-md);
--card-shadow: var(--shadow-sm);
```

### D5：动画与过渡规范

**时长阶梯**：
| 场景 | 时长 | 缓动 |
|------|------|------|
| 微交互（hover/press） | 80-150ms | ease-out |
| 组件进出（Panel/Modal） | 200-250ms | cubic-bezier(0.16, 1, 0.3, 1) |
| 页面过渡（crossfade） | 150-200ms | ease-in-out |
| 共享元素变形 | 300ms | cubic-bezier(0.22, 1, 0.36, 1) |
| 骨架→内容替换 | 300ms | ease-out |

**原则**：
- 退出动画比进入快 50ms（不拖沓）
- 只对 `opacity` 和 `transform` 做动画（纯 GPU compositor，不触发 layout/paint）
- 所有动画使用 `will-change` 按需声明，动画结束后移除
- 用户设置了 `prefers-reduced-motion` 时跳过所有非必要动画

### D6：组件接口设计

```typescript
// Button
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  children: ReactNode;
}

// Card
interface CardProps {
  selected?: boolean;
  disabled?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

// Panel
interface PanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;  // px, default 400
  children: ReactNode;
}

// StatusDot
interface StatusDotProps {
  status: 'online' | 'offline' | 'alert';
  pulse?: boolean;  // 告警时是否脉冲动画
  size?: 'sm' | 'md';
}

// Badge
interface BadgeProps {
  level: 'danger' | 'warning' | 'caution' | 'success' | 'neutral';
  children: ReactNode;
}

// Skeleton
interface SkeletonProps {
  variant: 'text' | 'card' | 'table-row';
  count?: number;  // 重复行数
  width?: string;
  height?: string;
}
```

### D7：侧边栏信息架构

```
┌─────────────────────┐
│ ⚡ 雷霆监控          │  ← Logo/品牌区
├─────────────────────┤
│ 📊 主面板           │  ← /main
│ 👁 实时监控         │  ← /view（Badge: 告警数）
│ ✏️ 电子围栏         │  ← /view/:id/edit
│ 🔁 事件回放         │  ← /replay/:id (参数化路由)
├─────────────────────┤
│ 📋 日志            │  ← /log
│ 📄 报表            │  ← /report/:date (参数化)
├─────────────────────┤
│ 👤 用户管理         │  ← /users
│ 🧑 人物管理         │  ← /characters
│ 🖥️ 设备信息         │  ← /equipment
│ ⚙️ 异常设置         │  ← /exception-settings
├─────────────────────┤
│         收起 »      │  ← 折叠按钮
└─────────────────────┘
```

- 宽模式 240px，窄模式（仅图标）56px
- 当前路由菜单项高亮（`--color-info` 左边框 + 背景 `--bg-hover`）
- "实时监控" 菜单项右侧显示未处理告警数 Badge（红色圆点 + 数字）
- 折叠状态存储在 localStorage

## Risks / Trade-offs

- **[风险] View Transition API 浏览器兼容性** → Chrome 111+ 支持，Firefox/Safari 不支持时降级为无动画的即时切换（不影响功能）
- **[风险] 10 个页面一次性创建代码量大** → 每个页面从"骨架"起步（框架+占位按钮），不包含业务逻辑，代码量可控。按 tasks 分步创建可降低风险
- **[取舍] 不引入组件库** → 当前阶段节省了引入和定制成本，但当后续需要复杂表格/表单/日期选择器等功能组件时，需要重新评估是否引入 shadcn/ui
- **[取舍] 未做响应式** → 当前面向桌面端 1440+，后续移动端/平板适配需要额外的样式工作
