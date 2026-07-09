## ADDED Requirements

### Requirement: Server-aligned HTTP response types

The system SHALL define TypeScript interfaces that are field-for-field translations of every Pydantic response model exported by monitor-server's `schema/http/` package.

#### Scenario: All server HTTP schemas have TS counterparts

- **WHEN** a developer needs the TypeScript type for any server API response
- **THEN** they can import it from `src/api/types.ts`

#### Scenario: ID fields are typed as number

- **WHEN** any entity ID field is accessed in TypeScript
- **THEN** the type system SHALL enforce `number`, matching server's database integer IDs

#### Scenario: Nullable fields are typed as T | null

- **WHEN** a server Pydantic field has type `str | None`
- **THEN** the TypeScript counterpart SHALL be `string | null`

#### Scenario: List fields preserve element types

- **WHEN** a server schema has a `list[AlertResponse]` field
- **THEN** the TypeScript counterpart SHALL be `AlertResponse[]`

### Requirement: Request body types for mutable endpoints

The system SHALL define TypeScript interfaces matching server Pydantic request models (Create/Update bodies) for all POST/PUT endpoints.

#### Scenario: Create request types available

- **WHEN** a page needs to construct a POST request body
- **THEN** the type matches the server's expected Pydantic Create model exactly

### Requirement: Paginated response generic

The system SHALL define a reusable generic type for paginated list responses matching the server's `{items, total, page, page_size}` pattern.

#### Scenario: Any paginated list endpoint uses the generic

- **WHEN** a list endpoint returns paginated data
- **THEN** the response type SHALL extend `PaginatedResponse<T>` where T is the item type
