## Why

设备信息页面展示了每个节点下的 video 和 audio 物理设备，但缺少将这些设备组合为监控视图的功能入口。需要提供"增添视图"能力——从已有设备中选择一个 video 和一个 audio，配对生成监控视图，展示在主面板的相机网格中。

## What Changes

- **新增**：设备信息页面"增添视图"按钮
- **新增**：右侧配置面板——视图预览区 + "选择video"按钮 + "选择audio"按钮 + "保存"按钮
- **新增**：video/audio 设备从现有设备节点的设备列表中提取
- **新增**：保存后，新视图添加到相机列表（`mockCameras`），主面板相机网格实时显示新增的视图
- **改动**：`mockCameras` 从静态数据改为可由设备页追加的共享状态

## Capabilities

### New Capabilities

- `camera-view-creation`: 在设备信息页面选择 video + audio 设备创建监控视图，新增的视图在主面板相机网格中展示

## Impact

- `src/pages/DeviceInfo.tsx`：新增按钮、Panel、设备选择逻辑
- `src/data/mock.ts`：新增 `addCameraView` 函数或通过 Context 共享相机列表
- `src/pages/MainDashboard.tsx`：相机列表从共享状态读取（如需）
