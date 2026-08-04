# @pipeworx/noaa-tides

NOAA [Tides & Currents](https://api.tidesandcurrents.noaa.gov) MCP — observations, predictions, datums, stations. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Noaa Tides data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
