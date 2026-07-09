## 1. 项目基础设施

- [ ] 1.1 安装依赖：`react-router-dom`、`framer-motion`、`lucide-react`
- [ ] 1.2 创建目录结构：`src/router/`、`src/components/layout/`、`src/components/ui/`、`src/pages/`、`src/styles/`、`src/data/`
- [ ] 1.3 创建 `src/styles/tokens.css`：CSS 变量体系（色彩/间距/圆角/阴影/字体）
- [ ] 1.4 创建 `src/styles/global.css`：body 暗色背景、reset 样式、滚动条样式
- [ ] 1.5 创建 `src/styles/transitions.css`：View Transition 关键帧、骨架屏 shimmer、StatusDot pulse
- [ ] 1.6 创建 `src/data/mock.ts`：静态 mock 数据（告警列表、用户列表、人物列表、设备节点、异常类型、日志条目、报表行）

## 2. 通用 UI 组件

- [ ] 2.1 实现 `Button` 组件（4 变体 × 3 尺寸 + icon + loading + disabled）
- [ ] 2.2 实现 `Card` 组件（default/selected/disabled/hoverable 状态）
- [ ] 2.3 实现 `Panel` 组件（从右滑入/滑出，framer-motion AnimatePresence）
- [ ] 2.4 实现 `StatusDot` 组件（3 状态 + pulse 动画 + 2 尺寸）
- [ ] 2.5 实现 `Badge` 组件（5 告警级别，圆角 pill）
- [ ] 2.6 实现 `Skeleton` 组件（text/card/table-row 3 变体 × count 重复，shimmer 动画）

## 3. 全局布局与路由

- [ ] 3.1 实现 `AppLayout` 组件（侧边栏 + 顶栏面包屑 + `<Outlet>` 内容区）
- [ ] 3.2 实现 `Sidebar` 组件（10 菜单项 + 可折叠 + 告警 Badge + localStorage 持久化）
- [ ] 3.3 实现 `Breadcrumb` 组件（useLocation 解析路径 → 面包屑层级）
- [ ] 3.4 创建 `src/router/index.tsx`：11 条路由配置 + React.lazy 懒加载 + Suspense 骨架屏
- [ ] 3.5 改造 `App.tsx`：BrowserRouter + AppLayout + RouterProvider
- [ ] 3.6 实现 View Transition API 封装 hook：`useViewTransition`（检测支持 + startViewTransition + 降级）
- [ ] 3.7 验证：侧边栏点击各菜单项可正确跳转到对应页面

## 4. 核心监控页面

- [ ] 4.1 实现 `MainDashboard` 页面：5 个 KPI 统计卡片（图标+数字+趋势箭头）
- [ ] 4.2 实现 `MainDashboard` 页面：3×3 相机缩略图网格 + "进入视图"按钮跳转 `/view`
- [ ] 4.3 实现 `MainDashboard` 页面：右侧告警时间线列表（Badge+时间+按钮）
- [ ] 4.4 实现 `MainDashboard` 页面：底部快速操作按钮组（5 个按钮跳转各页面）
- [ ] 4.5 实现 `LiveMonitor` 页面：全屏视频占位区 + LIVE Badge
- [ ] 4.6 实现 `LiveMonitor` 页面：右侧告警面板 + "查看回放"按钮跳转 `/replay/:eventId`
- [ ] 4.7 实现 `LiveMonitor` 页面：底部固定操作栏（编辑电子围栏→`/view/:id/edit` + 手动录制按钮）
- [ ] 4.8 实现 `FenceEditor` 页面：视频占位区（编辑模式提示文字）+ 右侧围栏区域列表
- [ ] 4.9 实现 `FenceEditor` 页面：区域选中态 + 点选提示框 + 底部删除/保存按钮
- [ ] 4.10 实现 `EventReplay` 页面：视频占位区 + 进度条（静态位置 + 时间标记）
- [ ] 4.11 实现 `EventReplay` 页面：右侧事件详情面板 + 设为误报/已处理按钮
- [ ] 4.12 验证：main→view→edit→replay 核心链路跳转流畅，布局一致

## 5. 数据页面

- [ ] 5.1 实现 `LogCenter` 页面：三栏布局（本日日志/日报/周报）
- [ ] 5.2 实现 `LogCenter` 页面：本日日志列表（时间线 + 未处理/已处理 Badge）
- [ ] 5.3 实现 `LogCenter` 页面：日报日期列表（6 天可点击→`/report/:date`）
- [ ] 5.4 实现 `LogCenter` 页面：周报列表（6 周可点击 Card）
- [ ] 5.5 实现 `ReportDetail` 页面：标题（含日期参数）+ 7 列表头（▼筛选箭头）
- [ ] 5.6 实现 `ReportDetail` 页面：斑马纹数据行（7 行）+ Badge + "查看详情"链接

## 6. 管理页面

- [ ] 6.1 实现 `UserManagement` 页面：标题 + "添加用户"按钮 + 3×3 用户卡片网格
- [ ] 6.2 实现 `UserManagement` 页面：右侧用户详情 Panel（点击卡片打开）+ 3 个操作按钮
- [ ] 6.3 实现 `CharacterManagement` 页面：与用户管理结构一致，标题 + 3×3 人物卡片网格
- [ ] 6.4 实现 `CharacterManagement` 页面：右侧人物详情 Panel（照片占位区 + 3 个操作按钮）
- [ ] 6.5 实现 `DeviceInfo` 页面：2×2 节点卡片网格
- [ ] 6.6 实现 `DeviceInfo` 页面：每个节点卡片内的 video/audio 设备组 + StatusDot + 折叠切换
- [ ] 6.7 实现 `ExceptionSettings` 页面：3 列异常类型卡片网格（含选中态/禁用态/开关状态）
- [ ] 6.8 实现 `ExceptionSettings` 页面：右侧事件组成列表 + 6 个管理操作按钮

## 7. 动画与过渡

- [ ] 7.1 为主模块切换路由（main↔log↔users 等）添加 View Transition crossfade
- [ ] 7.2 为 main→view 添加共享元素过渡（`view-transition-name: camera-feed`）
- [ ] 7.3 为 Panel 滑入/滑出添加 framer-motion enter/exit 动画
- [ ] 7.4 为 Card 的 hover/press 添加 CSS transition 微交互
- [ ] 7.5 添加 `prefers-reduced-motion` 检测，跳过非必要动画

## 8. 最终验证

- [ ] 8.1 验证所有 11 条路由可访问，无 404
- [ ] 8.2 验证侧边栏折叠/展开 + 高亮态 + Badge 显示正确
- [ ] 8.3 验证所有页面按钮可点击且跳转正确（即便目标页面可能尚未实现内部逻辑）
- [ ] 8.4 验证暗色主题在所有页面生效无漏白
- [ ] 8.5 验证 Chrome/Firefox/Edge 均可运行（Firefox 过渡降级为即时切换）
- [ ] 8.6 `npm run build` 无 TS 错误和 lint 错误
