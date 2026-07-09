## Purpose
Provides reusable UI components including Button (4 variants, 3 sizes, loading/icon support), Card (3 states, hoverable), Panel (slide-in), StatusDot (3 states with pulse animation), Badge (5 severity levels), and Skeleton (3 variants for loading placeholders).

## ADDED Requirements

### Requirement: Button component
The system SHALL provide a Button component with 4 variants: primary (filled `--color-info`), secondary (outlined with border), danger (filled `--color-danger`), ghost (transparent with hover background). Each variant SHALL support 3 sizes (sm/md/lg) and an optional icon (lucide-react) rendered before the label. The Button SHALL support `loading` (shows spinner, disables click) and `disabled` states.

#### Scenario: Primary button renders correctly
- **WHEN** a `<Button variant="primary">保存</Button>` is rendered
- **THEN** the button displays with `--color-info` background, white text, 4px border radius, and hover darkens the background

#### Scenario: Button with loading state
- **WHEN** a `<Button loading>提交</Button>` is rendered
- **THEN** the button shows a spinner icon, is not clickable, and uses reduced opacity

#### Scenario: Button with icon
- **WHEN** a `<Button variant="secondary" icon={Plus}>添加用户</Button>` is rendered
- **THEN** the Plus icon appears to the left of the label text

### Requirement: Card component
The system SHALL provide a Card component with three states: default (normal display), selected (blue border `--color-info` + elevated), and disabled (reduced opacity, no pointer events). The Card SHALL support an optional `hoverable` prop that adds shadow on hover.

#### Scenario: Selected card is highlighted
- **WHEN** a `<Card selected>` is rendered
- **THEN** the card displays with a 2px `--color-info` border and elevated background

#### Scenario: Disabled card is non-interactive
- **WHEN** a `<Card disabled>` is rendered
- **THEN** the card has reduced opacity (0.6), `cursor: not-allowed`, and does not respond to clicks

### Requirement: Panel component
The system SHALL provide a Panel component that slides in from the right side of its container. The Panel SHALL support open/close state, a title, and configurable width (default 400px). Close SHALL trigger `onClose` callback and an exit animation.

#### Scenario: Panel opens with slide animation
- **WHEN** `open` prop changes from false to true
- **THEN** the panel animates into view from the right (250ms, cubic-bezier easing)

#### Scenario: Panel closes on backdrop click
- **WHEN** user clicks the semi-transparent backdrop area
- **THEN** `onClose` is called and the panel slides out (200ms, slightly faster than enter)

### Requirement: StatusDot component
The system SHALL provide a StatusDot component indicating device/alert status with 3 states: online (green, `--color-success`), offline (gray, `--color-neutral`), and alert (red, `--color-danger`). The alert state SHALL support an optional pulse animation (expanding ring) for active alerts.

#### Scenario: Online status renders green dot
- **WHEN** `<StatusDot status="online" />` is rendered
- **THEN** a `--color-success` filled circle (8px diameter) is displayed

#### Scenario: Alert status pulses for active warnings
- **WHEN** `<StatusDot status="alert" pulse />` is rendered
- **THEN** a red dot with an expanding/contracting ring animation is displayed

### Requirement: Badge component
The system SHALL provide a Badge component for alert severity level labels. Five severity levels SHALL be supported: danger (red), warning (orange), caution (yellow), success (green), neutral (gray). Each SHALL render as a small rounded pill with filled background and contrasting text.

#### Scenario: Danger badge renders in red
- **WHEN** `<Badge level="danger">高危</Badge>` is rendered
- **THEN** a small rounded pill with `--color-danger` background and white "高危" text is displayed

### Requirement: Skeleton component
The system SHALL provide a Skeleton component with 3 variants: text (single line placeholder), card (rectangular card placeholder), and table-row (multi-column row placeholder). The Skeleton SHALL use a shimmer/pulse animation. The `count` prop SHALL control repetition for rows.

#### Scenario: Skeleton card renders as placeholder
- **WHEN** `<Skeleton variant="card" width="280px" height="180px" />` is rendered
- **THEN** a rounded rectangle of 280×180px with shimmer animation is displayed

#### Scenario: Multiple skeleton rows for table loading
- **WHEN** `<Skeleton variant="table-row" count={5} />` is rendered
- **THEN** five rows of skeleton placeholders with shimmer animation are displayed
