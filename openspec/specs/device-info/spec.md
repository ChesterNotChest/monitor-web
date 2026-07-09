## Purpose
Renders the device info page with a 2x2 node card grid showing device groups (video/audio) with status indicators and collapsible sections.

## ADDED Requirements

### Requirement: Page layout
The device info page SHALL render a page title "设备信息" and display device nodes in a card-based grid layout (2 columns × 2 rows, 4 nodes total). The entire content SHALL be wrapped in a Card container.

#### Scenario: Page renders with 4 node cards
- **WHEN** user visits "/equipment"
- **THEN** "设备信息" title and 4 node cards in a 2×2 grid are displayed

### Requirement: Node card with device groups
Each node card SHALL render a header with the node name ("node1" or "node2") and contain two device group sections: "video" and "audio". Each group SHALL list 2 device items. Each device item SHALL display the device name, a StatusDot, and the device container with rounded corners.

#### Scenario: Node card renders video and audio groups
- **WHEN** a node card is rendered
- **THEN** it displays a "video" section with 2 devices and an "audio" section with 2 devices, each device showing name and StatusDot

### Requirement: Device status indicators
Each device item SHALL display a StatusDot component indicating its online/offline status. Normal nodes (node1) SHALL have all green (online) dots. The abnormal node2 in the top row SHALL have all red (alert, pulse) dots to visually distinguish abnormal nodes.

#### Scenario: Normal node shows green status dots
- **WHEN** the "node1" card renders
- **THEN** all 4 device StatusDots display green (online, no pulse)

#### Scenario: Abnormal node shows pulsing red status dots
- **WHEN** the "node2" card in the top row renders
- **THEN** all 4 device StatusDots display red with pulse animation to indicate alert state

### Requirement: Node collapse toggle
Each node card header SHALL include a chevron toggle button that collapses/expands the device groups section. The toggle state SHALL be managed locally (useState). All nodes start expanded.

#### Scenario: Node collapses on chevron click
- **WHEN** user clicks the chevron toggle on a node card
- **THEN** the video and audio device sections collapse with a 200ms height animation
