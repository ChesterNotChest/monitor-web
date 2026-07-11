## Context

设备信息页面展示物理设备（节点 → video/audio 设备），"增添视图"是将已有的 video + audio 设备配对为监控视图，显示在主面板相机网格中。设备本身是自动检测的，不需要手动添加。

## Goals / Non-Goals

**Goals:**
- 从现有设备节点的 video/audio 列表中选择设备，配对生成监控视图
- 新视图添加到 `mockCameras`（共享状态），主面板实时可见
- 复用 Panel、Card、StatusDot、Button、Modal 组件

**Non-Goals:**
- 不添加新的物理设备（设备自动检测）
- 不在设备树中新增节点
- 不接入后端 API

## Decisions

### D1：共享相机列表
`mockCameras` 目前在 `mock.ts` 中是静态常量。改为通过 Context（或 DeviceInfo 和 MainDashboard 的共同父组件 state）管理，使设备页新增的视图能反映到主面板。

**方案**：在 `App.tsx` 层用 `useState` 管理 `cameras`，通过一个新的 `CameraContext` 下发。或更简单地，DeviceInfo 直接操作 `mockCameras` 数组（push 新项），MainDashboard 每次渲染重新读取。但 React 不会响应数组 mutation。

**最终方案**：创建 `CameraContext` 与 `AlertContext` 同级，在 `App.tsx` 中包裹，DeviceInfo 和 MainDashboard 均从中读取。保持最小侵入。

### D2：可用设备列表
从 `mockDeviceNodes` 中提取所有 video 和 audio 设备，去重后作为选择列表。格式：`{ name, nodeName, type }`。

### D3：新视图命名
`视图{n+1}-{video设备名}/{audio设备名}`，n 为当前相机数。id 为 `cam-{n+1}`。

## Risks / Trade-offs

- **[取舍] 刷新丢失**：新视图仅存于内存，刷新后消失。后续需对接后端持久化。
