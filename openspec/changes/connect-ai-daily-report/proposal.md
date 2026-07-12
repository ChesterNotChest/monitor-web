# Connect AI Daily Report

## Why
The current `/report/:date` page uses weekly report data and does not display AI-generated daily report content. The web UI needs to consume the server daily report API and present summary, findings, recommendations, and metrics.

## What Changes
- Add frontend types and API client for `GET /reports/daily`.
- Update `/report/:date` to load the daily report for the route date.
- Add a sidebar entry for daily reports.
- Display AI summary, risk level, key findings, recommendations, severity distribution, top exceptions, and hourly trend.

## Non-Goals
- No report editing.
- No scheduled report push UI.
- No new charting dependency.

## Impact
- Report page becomes backed by real daily report API instead of weekly placeholder data.
