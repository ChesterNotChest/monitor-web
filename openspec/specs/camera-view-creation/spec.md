## ADDED Requirements

### Requirement: Add view button
设备信息页面 SHALL 在标题旁渲染"增添视图"按钮（primary + Plus 图标）。

#### Scenario: Button visible
- **WHEN** 用户访问 "/equipment"
- **THEN** "增添视图"按钮显示在页面标题右侧

### Requirement: Configuration panel opens
点击"增添视图"后 SHALL 从右侧滑入配置面板。面板自上而下包含：视图预览区、"选择video"按钮、"选择audio"按钮、"保存"按钮（video 和 audio 均未选时 disabled）。

#### Scenario: Panel opens with empty preview
- **WHEN** 用户点击"增添视图"
- **THEN** 右侧面板滑入，顶部预览区显示 Camera 图标和"未选择设备"占位文字，"保存"按钮灰色不可点击

### Requirement: View preview area
视图预览区 SHALL 占据面板顶部显著位置，模拟主面板相机卡片的缩略外观。预览区背景为深色圆角矩形，当未选设备时显示 Camera 图标和提示文字；当选了设备后，SHALL 动态显示：
- 上半部分：大尺寸 Camera 图标（模拟视频画面）
- 下半部分：video 设备名（左侧）+ audio 设备名（右侧），用图标区分

#### Scenario: Preview updates when video selected
- **WHEN** 用户选择了 video 设备 "Camera-01"
- **THEN** 预览区底部左侧显示 "📹 Camera-01"

#### Scenario: Preview updates when both selected
- **WHEN** video="Camera-01", audio="Mic-01"
- **THEN** 预览区显示完整信息——顶部 Camera 图标，底部 "📹 Camera-01  🎤 Mic-01"

### Requirement: Device selection from existing equipment
"选择video"和"选择audio"按钮 SHALL 弹出 Modal，列出所有设备节点中已存在的 video/audio 设备。每个列表项显示设备名称和所属节点。点击某项选中并关闭 Modal。"选择video"仅列出 video 设备，"选择audio"仅列出 audio 设备。

#### Scenario: Select a video device
- **WHEN** 用户点击"选择video" → Modal 列出所有节点的 video 设备 → 点击"设备名1 (node1)"
- **THEN** Modal 关闭，"选择video"按钮文字变为"video: 设备名1"，预览区显示所选设备名

### Requirement: Save creates camera view
当 video 和 audio 均已选择，"保存"按钮变为可点击。点击后 SHALL 将新的监控视图（格式："视图{n}-{区域描述}"）添加到共享的相机列表中。面板关闭，主面板的相机网格随之更新显示新视图。

#### Scenario: Save new camera view
- **WHEN** video="设备名1", audio="设备名1", 用户点击"保存"
- **THEN** 相机列表新增一条记录（name 为"视图01-设备名1/设备名1"），面板关闭，主面板相机网格出现新卡片
