## Purpose
Renders the log center page with a three-panel layout: daily log list with processing status, daily report date list for navigation, and weekly report list.

## ADDED Requirements

### Requirement: Three-panel log layout
The log center page SHALL render three vertical panels: "本日日志" (left, 33%), "日报" (center, 33%), "周报" (right, 33%). Each panel SHALL have a header label with distinct background color.

#### Scenario: Three panels render side by side
- **WHEN** user visits "/log"
- **THEN** three equal-width panels "本日日志", "日报", "周报" are displayed horizontally

### Requirement: Daily log list
The "本日日志" panel SHALL render a list of log entries in reverse chronological order. Each entry MUST display time (HH:MM), camera view name, alert description, and processing status. The status SHALL be rendered as a Badge: "未处理" (warning level, orange) or "已处理" (success level, green).

#### Scenario: Log entries display with mixed statuses
- **WHEN** user visits "/log"
- **THEN** at least 6 mock log entries are rendered in the left panel with alternating "未处理" (orange) and "已处理" (green) badges

### Requirement: Daily report date list
The "日报" panel SHALL render a vertical list of recent dates (YYYY-MM-DD format, 6 items descending). Each date SHALL be a clickable Card that navigates to "/report/:date".

#### Scenario: Date cards navigate to report detail
- **WHEN** user clicks a date card "2026-07-08" in the daily report panel
- **THEN** browser navigates to "/report/2026-07-08" pushing from the right

### Requirement: Weekly report list
The "周报" panel SHALL render a vertical list of recent weeks (e.g., "第27周（07.07-07.13）", 6 items descending). Each week SHALL be a clickable Card. Navigation to specific weekly report detail is deferred to a future phase.

#### Scenario: Weekly report cards render as list
- **WHEN** user visits "/log"
- **THEN** 6 weekly report cards are displayed in the right panel showing week number and date range
