## ADDED Requirements

### Requirement: Three environment variable config entries

The system SHALL expose three build-time configuration entries via Vite environment variables, all prefixed with `VITE_`:

- `VITE_SERVER_BASE_URL` — server host (no port, e.g. `http://192.168.1.100`)
- `VITE_API_PORT` — REST API port (e.g. `8000`)
- `VITE_WEBRTC_PORT` — WebRTC signaling/stream port (e.g. `8080`)

#### Scenario: All three configs present in .env files

- **WHEN** the project is checked out
- **THEN** `.env.development` SHALL contain default values for all three variables

#### Scenario: Vite prefixes variables

- **WHEN** accessing a config value in client code
- **THEN** it SHALL be accessible via `import.meta.env.VITE_<NAME>`

### Requirement: Centralized config assembly module

The system SHALL provide a `config.ts` module that assembles the three env variables into URL strings used by the rest of the application.

#### Scenario: API base URL is assembled from base + port

- **WHEN** `VITE_SERVER_BASE_URL` is `http://192.168.1.100` and `VITE_API_PORT` is `8000`
- **THEN** `config.apiBase` SHALL be `http://192.168.1.100:8000/api/v1`

#### Scenario: WebRTC base URL is assembled from base + webrtc port

- **WHEN** `VITE_SERVER_BASE_URL` is `http://192.168.1.100` and `VITE_WEBRTC_PORT` is `8080`
- **THEN** `config.webrtcBase` SHALL be `http://192.168.1.100:8080`

#### Scenario: SERVER_BASE_URL does not contain port

- **WHEN** a user configures `VITE_SERVER_BASE_URL`
- **THEN** the value SHALL NOT include a port number (ports are provided separately by `VITE_API_PORT` and `VITE_WEBRTC_PORT`)

### Requirement: .env.example for documentation

The system SHALL provide a `.env.example` file listing all required variables with default values and comments.

#### Scenario: Developer onboarding

- **WHEN** a new developer sets up the frontend
- **THEN** they can copy `.env.example` to `.env.development` and have a working default configuration
