# Calpulli CDMX MCP Server

Read-only MCP server for discovering, combining and planning tours in Mexico City.

## Architecture

```
mcp/
├── server.js          # JSON-RPC 2.0 over stdio (MCP spec)
├── tests/
│   └── server.test.js # 18 tests (node --test)
└── README.md          # This file
```

The server connects to the same service layer (`lib/knowledge/service.js`) as the API v1 endpoints. No duplicated logic.

## Installation

```bash
# No new dependencies required (uses esbuild already in package.json)
npm install
```

## Running

```bash
# Stdio mode (for MCP clients)
node mcp/server.js

# Test
node --test mcp/tests/
```

## Configuration

No environment variables required. The server reads from the local knowledge graph (`lib/knowledge/graph.js`).

## Tools (14)

| Tool                             | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `search_tours`                   | Search by neighborhood, language, category, duration, price, interests |
| `get_tour_details`               | Full tour details by id or slug                                        |
| `match_tours_to_preferences`     | Match with explicit rules (no opaque scores)                           |
| `build_half_day_plan`            | 3-5 hour plan with tour + nearby activities                            |
| `build_day_plan`                 | Full-day plan combining tours and places                               |
| `build_itinerary`                | Multi-day itinerary (2-7 days)                                         |
| `combine_tours_and_places`       | What to combine before/after a tour                                    |
| `find_activities_near`           | Tours and activities near a location                                   |
| `find_before_or_after_tour`      | What to do before/after a specific tour                                |
| `suggest_for_time_available`     | Tours that fit a time budget                                           |
| `suggest_for_location`           | Tours based on visitor location                                        |
| `suggest_for_weather`            | Tours suitable for weather conditions                                  |
| `suggest_for_first_time_visitor` | Iconic, central tours for first visits                                 |
| `explain_recommendation`         | Why a tour was recommended (explicit filters)                          |

## Resources (9)

- `Calpulli CDMX://tours` — all tours
- `Calpulli CDMX://tours/{id}` — single tour
- `Calpulli CDMX://places/{id}` — single place
- `Calpulli CDMX://neighborhoods/{id}` — single neighborhood
- `Calpulli CDMX://itineraries/{id}` — single itinerary
- `Calpulli CDMX://taxonomies` — controlled vocabularies
- `Calpulli CDMX://knowledge-graph` — full graph index
- `Calpulli CDMX://data-policy` — attribution and use policy
- `Calpulli CDMX://attribution` — entity attribution

## Prompts (5)

- `plan-first-visit-to-cdmx` — first visit planning
- `build-half-day-plan` — half-day plan with tour + activities
- `combine-tour-with-nearby-activities` — combine specific tour
- `explain-tour-match` — explain recommendation
- `plan-around-existing-booking` — plan around booked tour

## Example Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_tours",
    "arguments": {
      "neighborhood": "Roma",
      "language": "en",
      "interests": ["history", "food"]
    }
  }
}
```

## Example Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "schemaVersion": "1.0.0",
    "retrievedAt": "2026-10-11T19:25:53.902Z",
    "attribution": "Calpulli CDMX — https://Calpulli CDMX-amx.vercel.app",
    "data": [...],
    "appliedFilters": {...},
    "warnings": [],
    "missingData": []
  }
}
```

## Security

- Read-only: no mutations, no bookings, no payments
- No secrets exposed
- Input validation on all tools
- Result limits (default 10, max 50)
- No PII in logs

## Observability

Every response includes:

- `schemaVersion` — schema version
- `retrievedAt` — timestamp
- `attribution` — source attribution
- `appliedFilters` — filters used
- `warnings` — non-fatal issues
- `missingData` — data gaps

## Limitations

- No coordinates: proximity is neighborhood-level only
- No fixed start times, live availability or real reviews
- No restaurants, hotels, events or metro entities yet
- No subjective scores (walkability, safety, authenticity)

## Testing

```bash
node --test mcp/tests/
```

18 tests covering:

- Valid and invalid inputs
- Incompatible filters
- Missing data
- Broken relationships
- No secrets in responses
- No opaque scores
- Consistency between API and MCP
