## ADDED Requirements

### Requirement: Page layout and structure
The exception settings page SHALL render a page title "异常设置" and divide into two areas: left (exception type card grid, ~70% width) and right (detail/action panel, ~30% width). The entire content SHALL be wrapped in a Card container.

#### Scenario: Page renders with left grid and right panel
- **WHEN** user visits "/exception-settings"
- **THEN** an exception type card grid is rendered on the left and a detail panel on the right

### Requirement: Exception type card grid
The left area SHALL render a 3-column grid of exception type cards (3×3, up to 9 cards). Each card MUST display: exception name (e.g., "陌生人识别告警"), a severity Badge, and a StatusDot indicating whether the exception monitoring is ON (green) or OFF (gray). Cards with monitoring OFF SHALL display reduced opacity (0.6) and a "已关闭" label.

#### Scenario: Active exception card renders correctly
- **WHEN** a card for "陌生人识别告警" (HIGH, ON) is rendered
- **THEN** the card displays full opacity, a red "高危" Badge, and a green StatusDot

#### Scenario: Disabled exception card renders dimmed
- **WHEN** a card for "抽烟行为检测" (MEDIUM, OFF) is rendered
- **THEN** the card displays 0.6 opacity, an orange "中危" Badge, a gray StatusDot, and a "已关闭" label

### Requirement: Selected card state
One card at a time SHALL be in the selected state (Card `selected` prop, blue border). Clicking a card SHALL toggle selection. The selected card's event composition SHALL be reflected in the right panel.

#### Scenario: Card selection toggles on click
- **WHEN** user clicks the "危险区域闯入" card
- **THEN** the card displays a blue (`--color-info`) border and the right panel updates to show that exception's event composition

### Requirement: Event composition panel
The right panel SHALL display the selected exception's event composition as a list of event steps. For "危险区域闯入", 3 event steps SHALL be displayed: "人员进入区域检测", "边界靠近检测", "停留超时检测". Each step SHALL render as a rounded Card within the panel.

#### Scenario: Event steps render for selected exception
- **WHEN** "危险区域闯入" card is selected
- **THEN** 3 numbered event step cards are rendered in the right panel

### Requirement: Management action buttons
The right panel SHALL render 6 management action Buttons stacked vertically: "添加事件", "修改事件", "删除事件", "设置异常等级", "异常告警开关", "删除异常". All buttons SHALL be secondary variant. These buttons are UI placeholders with no logic.

#### Scenario: Management buttons render in right panel
- **WHEN** user visits "/exception-settings"
- **THEN** 6 action buttons are visible in the right panel below the event composition list
