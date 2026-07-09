## Purpose
Renders the character management page with a page header and add button, 3-column character card grid, and slide-in detail panel with photo placeholder and action buttons.

## ADDED Requirements

### Requirement: Page header with add button
The character management page SHALL render a page title "命名人物管理" and an "添加人物" Button (primary variant with Plus icon) in the top area. The button is a UI placeholder.

#### Scenario: Header and add button render
- **WHEN** user visits "/characters"
- **THEN** "命名人物管理" title and "添加人物" button (with Plus icon) are displayed

### Requirement: Character card grid
The page SHALL render a 3-column grid of character cards (3×3, 9 cards total). The first 3 cards SHALL display mock character names ("人物名1", "人物名2", "人物名3"). The remaining cards SHALL render as empty placeholders. The 4th card SHALL display "◦ ◦ ◦" as a visual ellipsis indicator. The layout SHALL match the user management page for visual consistency.

#### Scenario: Character cards render in 3-column grid
- **WHEN** user visits "/characters"
- **THEN** a 3×3 grid of character cards is displayed with the same dimensions and styling as user cards

### Requirement: Character detail panel
When a character card is clicked, a Panel SHALL slide in from the right displaying: a photo placeholder area ("选中的人物的图片"), the character name below it (bold, centered), and three action Buttons: "修改信息" (secondary), "更改照片" (secondary), "删除人物" (danger). These buttons are UI placeholders.

#### Scenario: Detail panel opens with photo placeholder
- **WHEN** user clicks the "人物名1" card
- **THEN** a panel slides in from the right displaying a gray photo placeholder area with text, the character name, and 3 action buttons

#### Scenario: Photo placeholder renders with text
- **WHEN** the detail panel for a character is open
- **THEN** a gray rectangle (340×220px) displays centered text "选中的人物的图片"
