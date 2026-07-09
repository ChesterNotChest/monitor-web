## Why

项目目前只有一个空白 React 脚手架（`App.tsx` 仅渲染 `<h1>Monitor Web</h1>`），而 `public/` 目录中已有 10 个基于产品需求的 SVG 线框图定义了完整的页面体系。需要将这些静态线框图落地为可交互的前端 UI 框架——建立全局导航、页面路由、页面间流畅过渡，以及每个页面的组件骨架。**本阶段只搭建 UI 外壳（按钮、导航、页面布局、过渡动画），不接入任何业务逻辑或后端 API。**

## What Changes

- **新增**：全局布局框架（侧边栏导航 + 面包屑 + 主内容区）
- **新增**：基于 React Router 的 10 个页面路由及页面间过渡动画
- **新增**：暗色主题 CSS 变量体系（色彩、间距、圆角、阴影、字体层级）
- **新增**：通用 UI 组件（按钮 Button、卡片 Card、面板 Panel、状态指示灯 StatusDot、骨架屏 Skeleton、告警级别标签 Badge）
- **新增**：10 个页面的组件骨架（布局 + 按钮 + 列表/网格占位，内部功能不做实现）
- **新增**：侧边栏菜单项与各页面的跳转连通
- **新增**：View Transition API 实现页面间共享元素过渡（相机卡片→视频全屏）
- **改动**：`App.tsx` 从单行占位替换为全局 Layout + Router 架构

## Capabilities

### New Capabilities

- `app-layout`: 全局布局框架——侧边栏导航（可折叠）、面包屑、内容区。侧边栏菜单项高亮当前路由，告警数量 Badge 标记
- `theme-system`: CSS 变量暗色主题体系——语义色（高危/中危/低危/正常/信息）、间距栅格、圆角层级、阴影层级、字体层级。支持未来扩展亮色主题
- `page-routing`: 10 个页面的路由配置与页面间过渡动画——View Transition API 用于模块切换（crossfade），framer-motion 用于面板进出与原地替换
- `common-components`: 通用 UI 组件库——Button（primary/secondary/danger/ghost 4 级）、Card（含选中态/禁用态）、Panel（右侧操作面板/抽屉）、StatusDot（在线/离线/告警 3 态含动画）、Badge（告警级别标签）、Skeleton（骨架屏）
- `main-dashboard`: 主仪表盘页面骨架——顶部 5 个 KPI 统计卡片、左侧 3×N 视图缩略图网格、右侧告警时间线列表、底部功能入口区
- `live-monitor`: 实时监控页面骨架——全屏视频占位区、右侧告警面板、底部固定操作栏
- `fence-editor`: 电子围栏编辑页面骨架——视频占位区（编辑模式提示）、右侧围栏区域列表、底部删除/保存按钮
- `event-replay`: 事件回放页面骨架——视频占位区 + 进度条、右侧事件详情面板、设为误报/已处理按钮
- `log-center`: 日志中心页面骨架——本日日志列表（时间倒序 + 未处理/已处理标签）、日报/周报标签切换
- `report-detail`: 报表详情页面骨架——筛选表头 + 斑马纹数据表格 + 分页器
- `user-management`: 用户管理页面骨架——3 列用户卡片网格、右侧用户详情面板（修改信息/权限管理/删除用户按钮）
- `character-management`: 人物管理页面骨架——3 列人物卡片网格、右侧人物详情面板（修改信息/更改照片/删除人物按钮）
- `device-info`: 设备信息页面骨架——按节点分组的可折叠设备树、设备状态指示灯（含动画）
- `exception-settings`: 异常设置页面骨架——异常类型卡片网格（含选中态/禁用态/开关指示）、右侧事件组成列表 + 管理按钮组

### Modified Capabilities

<!-- 无现有 specs，此阶段不修改任何已有能力 -->

## Impact

- **代码**：`src/` 目录从 4 个文件扩展为完整目录结构（pages/、components/、styles/、router/、hooks/）
- **依赖**：新增 `react-router-dom`、`framer-motion`、`lucide-react`
- **breaking**：`App.tsx` 原有占位内容将被替换，但这不是 breaking change（因为当前代码无实际功能）
