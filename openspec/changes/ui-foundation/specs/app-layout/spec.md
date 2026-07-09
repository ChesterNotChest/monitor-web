## ADDED Requirements

### Requirement: Sidebar navigation
The system SHALL provide a collapsible sidebar navigation with icon + text labels for all 10 page routes. The sidebar SHALL support two modes: expanded (240px, icon + text) and collapsed (56px, icon only). The collapse state MUST be persisted to localStorage.

#### Scenario: Sidebar renders in expanded mode by default
- **WHEN** user first loads the application
- **THEN** sidebar displays at 240px width with icon and text label for each menu item

#### Scenario: User collapses sidebar
- **WHEN** user clicks the collapse button at the bottom of the sidebar
- **THEN** sidebar animates to 56px width with icon-only display, and collapse preference is saved to localStorage

#### Scenario: Active route is highlighted
- **WHEN** user navigates to "/view" (Live Monitor page)
- **THEN** the "实时监控" sidebar menu item SHALL display a left border in `--color-info` and background in `--bg-hover`

### Requirement: Breadcrumb navigation
The system SHALL render breadcrumb navigation below the top bar, showing the current page hierarchy. Breadcrumb items for parent levels MUST be clickable links.

#### Scenario: Breadcrumb renders on nested page
- **WHEN** user is on "/view/1/edit" (Fence Editor page)
- **THEN** breadcrumb displays "雷霆监控 > 实时监控 > 电子围栏编辑"

#### Scenario: Breadcrumb on top-level page
- **WHEN** user is on "/main" (Main Dashboard)
- **THEN** breadcrumb displays "雷霆监控 > 主面板"

### Requirement: Layout structure
The system SHALL render a full-height application layout consisting of sidebar (left), top bar (with breadcrumb), and main content area. The main content area SHALL render the active route via React Router `<Outlet>`.

#### Scenario: Page content renders in layout
- **WHEN** user navigates to any valid route
- **THEN** the page content renders in the main content area without layout shift

### Requirement: Alert badge on sidebar
The "实时监控" sidebar menu item SHALL display a count badge showing the number of unprocessed alerts. The badge MUST use `--color-danger` background with white text.

#### Scenario: Badge displays alert count
- **WHEN** mock data contains 3 unprocessed alerts
- **THEN** the sidebar "实时监控" item displays a red badge with "3"
