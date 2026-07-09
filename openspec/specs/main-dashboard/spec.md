## Purpose
Renders the main dashboard page with KPI statistics bar, camera view thumbnail grid, alert timeline sidebar, and quick action buttons for navigation.

## ADDED Requirements

### Requirement: KPI statistics bar
The main dashboard SHALL render a horizontal statistics bar across the top containing 5 KPI cards. Each card MUST display a lucide-react icon, a numeric value, a label, and a trend indicator (↑/↓ percentage). Cards SHALL use `--bg-surface` background with rounded corners.

#### Scenario: Statistics bar renders 5 KPI cards
- **WHEN** user visits "/main"
- **THEN** 5 KPI cards are rendered: "视图数", "监控数", "今日告警", "已解决", "待处理" with mock numeric values and trend arrows

### Requirement: Camera view grid
The main dashboard SHALL render a 3-column grid of camera view thumbnail cards below the statistics bar. Each card MUST display the camera name, a placeholder for the video thumbnail, and a "进入视图" button that navigates to "/view". The grid SHALL be scrollable when content exceeds viewport.

#### Scenario: Camera grid renders 9 placeholder thumbnails
- **WHEN** user visits "/main"
- **THEN** a 3×3 grid of camera cards is displayed, each showing a camera name (view01-view09) and "进入视图" button

#### Scenario: Clicking "进入视图" navigates to live monitor
- **WHEN** user clicks the "进入视图" button on a camera card
- **THEN** browser navigates to "/view" with a shared-element view transition

### Requirement: Alert timeline sidebar
The right side of the main dashboard SHALL render a vertical alert timeline showing unprocessed alerts. Each alert item MUST display alert name, severity (via Badge component), timestamp, associated camera, and a "进入视图" button. Alerts SHALL be ordered by severity (high→medium→low) then by time (newest first).

#### Scenario: Alert timeline renders mock alerts
- **WHEN** user visits "/main"
- **THEN** at least 5 mock alerts are rendered in the right sidebar, each showing severity badge, timestamp, camera name, and action button

### Requirement: Quick action buttons
The bottom-right area of the main dashboard SHALL render quick action buttons linking to other pages: "查看日志" (→ "/log"), "用户管理" (→ "/users"), "人物管理" (→ "/characters"), "设备信息" (→ "/equipment"), "异常设置" (→ "/exception-settings"). Each button SHALL include a lucide-react icon.

#### Scenario: Quick action buttons navigate correctly
- **WHEN** user clicks "查看日志" quick action button
- **THEN** browser navigates to "/log" with a crossfade transition
