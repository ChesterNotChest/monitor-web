## MODIFIED Requirements

### Requirement: Daily report detail page
The report detail page SHALL continue to load and render `GET /reports/daily?date=YYYY-MM-DD` by default.

#### Scenario: Local report loads by default
- **WHEN** the user opens a report detail route
- **THEN** the page displays the local daily report without requiring a model token

### Requirement: DeepSeek report generation UI
The report detail page SHALL allow a user to enter a DeepSeek API key and manually request AI generation for the current report date.

#### Scenario: Generate DeepSeek report
- **WHEN** the user enters an API key and clicks the DeepSeek generate action
- **THEN** the page calls `POST /reports/daily/deepseek`
- **AND** displays the generated report content returned by the server
- **AND** indicates the report source/model when available

#### Scenario: Missing API key
- **WHEN** the user clicks DeepSeek generate without an API key
- **THEN** the page shows an inline error and does not call the API
