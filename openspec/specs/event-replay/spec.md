## Purpose
Renders the event replay page with video placeholder and progress bar, event detail panel with mock data, and action buttons for marking events as false or processed.

## ADDED Requirements

### Requirement: Replay video placeholder
The event replay page SHALL render a video placeholder area (same dimensions as live monitor) with centered text "事件的雷霆回放画面". Below the video area, a progress bar SHALL be rendered showing a mock playback position (e.g., 00:12 / 02:45) with a draggable thumb indicator (visual only, no drag logic).

#### Scenario: Replay video placeholder with progress bar
- **WHEN** user visits "/replay/:eventId"
- **THEN** a video placeholder with "事件的雷霆回放画面" text and a progress bar at approximately 20% position are displayed

#### Scenario: Progress bar shows time markers
- **WHEN** the replay page renders
- **THEN** the left side of the progress bar shows "00:12" and the right side shows "02:45"

### Requirement: Event detail panel
The right panel SHALL display event details including: event title ("Xxx 雷霆事件"), alert level (via Badge), alert type, occurrence time, and associated camera view. All values SHALL be populated from mock data based on the `eventId` route parameter.

#### Scenario: Event details render with mock data
- **WHEN** user visits "/replay/event-001"
- **THEN** the right panel displays event title, "高危" badge, alert type, timestamp, and "1号车间监控" as associated view

### Requirement: Event action buttons
The right panel SHALL render two action buttons below the event details: "设为误报" (Button variant="warning"/orange) and "设为已处理" (Button variant="primary"/green). These buttons are UI placeholders.

#### Scenario: Action buttons render correctly
- **WHEN** user visits "/replay/:eventId"
- **THEN** orange "设为误报" button and green "设为已处理" button are rendered in the right panel
