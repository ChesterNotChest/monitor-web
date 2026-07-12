# Connect DeepSeek Daily Report

## Why
The report page currently displays a deterministic local daily report. Users need a way to enter their own DeepSeek API key and generate an AI-written report without server-side key setup.

## What Changes
- Add frontend types and API client for `POST /reports/daily/deepseek`.
- Add a DeepSeek API key input on the daily report page.
- Add a manual generation action that calls the DeepSeek endpoint and displays the returned AI report.
- Keep the local daily report as the initial/default view.

## Non-Goals
- Do not persist API keys in the backend.
- Do not download models.
- Do not require global app settings for DeepSeek.

## Impact
- Report page adds one provider control area.
- Users must provide their DeepSeek key per browser/session use.
