## MODIFIED Requirements

### Requirement: Report header with title and date
The report detail page SHALL render a title in the format "日报详情 · YYYY-MM-DD" where the date comes from the `date` route parameter.

#### Scenario: Title displays correct date from route
- **WHEN** user visits `/report/2026-07-08`
- **THEN** the title displays `日报详情 · 2026-07-08`

### Requirement: AI daily report data
The report detail page SHALL call `GET /reports/daily?date=YYYY-MM-DD` through the shared API client and render the returned AI-generated monitoring report.

#### Scenario: Load daily report for route date
- **WHEN** user visits `/report/2026-07-08`
- **THEN** the page requests the daily report with `date=2026-07-08`
- **AND** renders the returned summary, risk level, metrics, findings, recommendations, severity distribution, top exceptions, and hourly trend.

### Requirement: Daily report navigation
The sidebar SHALL expose a daily report navigation item that opens `/report/{today}`.

#### Scenario: Open today's daily report
- **WHEN** user clicks the daily report navigation item
- **THEN** the app navigates to `/report/{today}`
