## ADDED Requirements

### Requirement: Video placeholder with edit mode
The fence editor page SHALL render the same video placeholder area as the live monitor page, but with an additional overlay text "(点了编辑后允许点击画框)" displayed below the main title. The video area SHALL be visually identical to the live monitor page to maintain spatial continuity.

#### Scenario: Edit mode overlay is visible
- **WHEN** user visits "/view/:viewId/edit"
- **THEN** the video placeholder displays both "实时雷霆监控画面" and the edit mode hint text

### Requirement: Fence zone list sidebar
The right panel SHALL render a list of fence zones. Each zone MUST display its name ("区域1", "区域2", etc.) and an "编辑" Button (ghost variant). One zone at a time MAY be visually selected (Card `selected` state).

#### Scenario: Zone list renders with edit buttons
- **WHEN** user visits "/view/:viewId/edit"
- **THEN** at least 2 zone cards are rendered in the right panel, each with zone name and "编辑" button

### Requirement: Point selection instruction
When a zone's "编辑" button is clicked, the panel SHALL display a point selection instruction box with text "请在实时画面点击4点" and hint "(只在点击了编辑后显示)". This is a UI state toggle and does not implement actual canvas interaction.

#### Scenario: Instruction box appears on edit click
- **WHEN** user clicks the "编辑" button for "区域1"
- **THEN** an instruction box renders below the zone list with "请在实时画面点击4点" text and the zone card switches to `selected` state

### Requirement: Bottom action buttons
The bottom of the right panel SHALL render two action buttons: "删除" (danger variant) and "保存" (primary variant). These buttons are UI placeholders and do not implement actual save/delete logic in this phase.

#### Scenario: Delete and save buttons are present
- **WHEN** user visits "/view/:viewId/edit"
- **THEN** two buttons labeled "删除" and "保存" are rendered at the bottom of the right panel
