## Purpose
Defines CSS design tokens, semantic color system, dark theme, and typography scale for the monitoring console UI.

## ADDED Requirements

### Requirement: CSS variable design tokens
The system SHALL define a complete CSS custom property system in `tokens.css` covering colors, spacing, border radius, shadows, and typography. All component and page styles MUST reference these variables rather than hardcoded values.

#### Scenario: Color tokens are available
- **WHEN** any component references `var(--bg-canvas)` for its background
- **THEN** the resolved color SHALL be a dark charcoal suitable for monitoring console use

#### Scenario: Spacing tokens follow 4px grid
- **WHEN** a component uses `var(--space-4)` for padding
- **THEN** the computed padding SHALL be 16px (4 × 4px base unit)

### Requirement: Semantic color system
The system SHALL provide semantic color tokens mapped from primitive hue/lightness values. Semantic tokens include `--color-danger` (red, for high-severity alerts), `--color-warning` (orange, for medium-severity), `--color-caution` (yellow, for low-severity), `--color-success` (green, for resolved/normal), and `--color-info` (blue, for actions/information).

#### Scenario: Alert level colors are consistently applied
- **WHEN** a "高危" alert badge and a "已处理" status label are rendered
- **THEN** the badge uses `--color-danger` (red) and the label uses `--color-success` (green)

### Requirement: Dark theme as default
The system SHALL apply the dark theme palette by default. Background depths SHALL follow a 3-level elevation model: `--bg-canvas` (page base), `--bg-surface` (card/panel), `--bg-elevated` (popover/modal).

#### Scenario: Dark theme is active on first load
- **WHEN** user opens the application for the first time
- **THEN** the page background is dark (`--bg-canvas`), cards are slightly lighter (`--bg-surface`), and text is light on dark

### Requirement: Typography scale
The system SHALL define a typography scale using system-native font stack. Monospace font SHALL be used for timestamps, codes, and data values. Font sizes SHALL range from 12px (caption) to 28px (page title).

#### Scenario: Chinese text renders correctly
- **WHEN** any page renders Chinese text content
- **THEN** the text SHALL use the system font stack with Microsoft YaHei as the CJK fallback
