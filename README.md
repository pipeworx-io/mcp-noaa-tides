# @pipeworx/noaa-tides

NOAA [Tides & Currents](https://api.tidesandcurrents.noaa.gov) MCP — observations, predictions, datums, stations. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

- `stations(type?, format?)` — list of tide/current/water-level stations
- `station_metadata(station)` — single-station metadata
- `predictions(station, begin_date, end_date, datum?, interval?, units?, time_zone?)` — tide predictions
- `water_level(station, begin_date, end_date, datum?, units?, time_zone?)` — observed water level
- `currents(station, begin_date, end_date, units?, time_zone?, bin?)` — observed currents
- `met_obs(station, product, begin_date, end_date, units?, time_zone?)` — meteorological obs (wind, air_temp, water_temp, …)
- `datums(station)` — vertical datums

`station` accepts a 7-digit NOAA station id. Dates: `yyyyMMdd` or `yyyyMMdd HH:mm`.

## Data source

`https://api.tidesandcurrents.noaa.gov/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "noaa-tides": {
      "url": "https://gateway.pipeworx.io/noaa-tides/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/noaa-tides/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Noaa Tides data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/stations \
  -H 'Content-Type: application/json' \
  -d '{"type":"waterlevels"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/stations`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
