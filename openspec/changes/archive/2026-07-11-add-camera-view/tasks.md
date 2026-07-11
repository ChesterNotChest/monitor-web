## 1. 共享相机状态

- [x] 1.1 创建 `src/context/CameraContext.tsx`：管理 `cameras` 数组 + `addCamera` 方法，初始值来自 `mockCameras`
- [x] 1.2 在 `App.tsx` 中包裹 `CameraProvider`
- [x] 1.3 `DeviceInfo.tsx` 引入 `useCameras()` 获取 `addCamera`
- [x] 1.4 `MainDashboard.tsx` 引入 `useCameras()` 获取 `cameras` 替换静态 `mockCameras`

## 2. 设备信息页面按钮与面板

- [x] 2.1 添加"增添视图"按钮到标题旁
- [x] 2.2 从 `mockDeviceNodes` 提取可用 video/audio 设备列表
- [x] 2.3 实现配置 Panel：顶部视图预览区（模拟主面板相机卡片外观，深色圆角矩形，未选时 Camera 图标 + 提示文字，选中后实时显示 video/audio 设备名）
- [x] 2.4 "选择video"/"选择audio"按钮 + 选中后按钮文字 + 预览区同步更新
- [x] 2.5 "保存"按钮：video+audio 都选定后才可点击

## 3. 设备选择 Modal

- [x] 3.1 创建设备选择 Modal（区分 video/audio），列表每项显示：设备名 + 所属节点名 + StatusDot
- [x] 3.2 点击设备项 → 选中 → 关闭 Modal → 更新面板中的选择状态

## 4. 保存逻辑

- [x] 4.1 保存时调用 `addCamera` 新增视图到相机列表
- [x] 4.2 面板关闭，选中状态重置
- [x] 4.3 主面板自动显示新视图卡片

## 5. 验证

- [x] 5.1 `npm run build` 无 TS 错误
- [x] 5.2 完整流程：设备页→选video→选audio→保存→主面板出现新相机卡片
