## Purpose
Renders the user management page with a page header and add button, 3-column user card grid, and slide-in detail panel with user info and action buttons.

## ADDED Requirements

### Requirement: Page header with add button
The user management page SHALL render a page title "用户管理" and an "添加用户" Button (primary variant with Plus icon) in the top area. The button is a UI placeholder with no modal/form implementation in this phase.

#### Scenario: Header and add button render
- **WHEN** user visits "/users"
- **THEN** "用户管理" title and "添加用户" button (with Plus icon) are displayed

### Requirement: User card grid
The page SHALL render a 3-column grid of user cards (3×3, 9 cards total). The first 3 cards SHALL display mock user names ("用户1", "用户2", "用户3"). The remaining cards SHALL render as empty placeholders (dotted outline). The 4th card in the grid SHALL display "◦ ◦ ◦" as a visual ellipsis indicator.

#### Scenario: User cards render in 3-column grid
- **WHEN** user visits "/users"
- **THEN** a 3×3 grid of user cards is displayed with the first 3 showing names

#### Scenario: Empty card slots show placeholders
- **WHEN** the user card grid renders
- **THEN** cards beyond position 3 render as empty gray placeholders with no text

### Requirement: User detail panel
When a user card is clicked, a Panel SHALL slide in from the right displaying: user name ("张三" for card 1), role ("安全员"), permission level ("二级"), and account status ("正常"). Three action Buttons SHALL render below the info: "修改信息" (secondary), "权限管理" (secondary), "删除用户" (danger). These buttons are UI placeholders.

#### Scenario: Detail panel opens on card click
- **WHEN** user clicks the "用户1" card
- **THEN** a panel slides in from the right showing user info and 3 action buttons

#### Scenario: Detail panel closes
- **WHEN** user clicks the panel backdrop (outside the panel area)
- **THEN** the panel slides out to the right
