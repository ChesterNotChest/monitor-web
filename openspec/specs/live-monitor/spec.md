## Purpose
Renders the live monitor page with a full-width video placeholder, alert sidebar panel with action buttons, and fixed action bar for fence editing and manual recording navigation.

## ADDED Requirements

### Requirement: Full-screen video placeholder
The live monitor page SHALL render a full-width video placeholder area occupying approximately 70% of the content width. The placeholder MUST display the text "实时雷霆监控画面" centered with a camera icon. A "LIVE" indicator badge SHALL be shown in the top-left corner of the video area.

#### Scenario: Video placeholder renders
- **WHEN** user visits "/view"
- **THEN** a large dark rectangle with centered "实时雷霆监控画面" text and a live indicator badge is displayed

### Requirement: Alert sidebar panel
The right side (approximately 30% width) SHALL render an alert panel displaying active alerts for the current camera view. Each alert item MUST show severity Badge, alert name, timestamp, and a "查看回放" Button that navigates to "/replay/:eventId".

#### Scenario: Alert panel renders with alerts
- **WHEN** user visits "/view"
- **THEN** at least 2 mock alerts are rendered in the right panel, each with "查看回放" button

#### Scenario: "查看回放" button navigates to replay page
- **WHEN** user clicks "查看回放" on an alert
- **THEN** browser navigates to "/replay/event-001" with a transition

### Requirement: Fixed action bar
A fixed action bar SHALL be rendered at the bottom of the right panel. It MUST contain two Buttons: "编辑电子围栏" (secondary variant) and "手动录制" (primary variant). "编辑电子围栏" SHALL navigate to "/view/:viewId/edit".

#### Scenario: Action buttons navigate correctly
- **WHEN** user clicks "编辑电子围栏"
- **THEN** browser navigates to "/view/default/edit" with the panel content crossfading to the fence editor sidebar
