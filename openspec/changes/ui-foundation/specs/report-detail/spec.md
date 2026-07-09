## ADDED Requirements

### Requirement: Report header with title and date
The report detail page SHALL render a title in the format "日报详情 · YYYY-MM-DD" where the date comes from the `date` route parameter. The entire content SHALL be wrapped in a Card with a subtle border.

#### Scenario: Title displays correct date from route
- **WHEN** user visits "/report/2026-07-08"
- **THEN** the title displays "日报详情 · 2026-07-08"

### Requirement: Filterable table header
The report SHALL render a table with 7 columns: "序号", "发生时间", "所属视图", "告警事件", "告警级别", "处理状态", "操作". Each column header (except 序号 and 操作) SHALL display a dropdown arrow indicator (▼) to imply filterability. No actual filtering logic is implemented.

#### Scenario: Table header renders with filter indicators
- **WHEN** user visits "/report/:date"
- **THEN** a table header row is rendered with 7 column labels and ▼ arrows on filterable columns

### Requirement: Zebra-striped data rows
The table SHALL render at least 7 rows of mock alert data with alternating row backgrounds (two subtly different `--bg-surface` variants). Each row SHALL display: sequence number, full timestamp, camera view name, alert event name, severity Badge, processing status text (with appropriate color), and a "查看详情" link (styled as a blue text link, not a button).

#### Scenario: Rows alternate background color
- **WHEN** at least 2 data rows are rendered
- **THEN** odd rows use `--bg-surface` and even rows use a slightly lighter variant

#### Scenario: Severity is displayed as Badge
- **WHEN** a row has "高危" alert level
- **THEN** the alert level cell renders a `<Badge level="danger">高危</Badge>`

#### Scenario: View detail is a text link
- **WHEN** a row renders the "操作" column
- **THEN** "查看详情" is displayed as a blue text link (not a filled button)
