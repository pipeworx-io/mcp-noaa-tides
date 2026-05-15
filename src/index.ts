interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NOAA Tides & Currents MCP.
 *
 * Auth: none. Docs: https://api.tidesandcurrents.noaa.gov/api/prod/
 */


const META = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';
const DATA = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const UA = 'pipeworx-mcp-noaa-tides/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'stations',
    description: 'List stations.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'waterlevels (default) | currents | physical | meteorological' },
        format: { type: 'string', description: 'json (default)' },
      },
    },
  },
  {
    name: 'station_metadata',
    description: 'Single-station metadata.',
    inputSchema: {
      type: 'object',
      properties: { station: { type: 'string' } },
      required: ['station'],
    },
  },
  {
    name: 'predictions',
    description: 'Tide predictions.',
    inputSchema: {
      type: 'object',
      properties: {
        station: { type: 'string' },
        begin_date: { type: 'string' },
        end_date: { type: 'string' },
        datum: { type: 'string', description: 'MLLW (default), MSL, MHW, NAVD, …' },
        interval: { type: 'string', description: 'hilo (default) | h (hourly) | 6 | 30 (minutes)' },
        units: { type: 'string', description: 'english (default) | metric' },
        time_zone: { type: 'string', description: 'gmt (default) | lst | lst_ldt' },
      },
      required: ['station', 'begin_date', 'end_date'],
    },
  },
  {
    name: 'water_level',
    description: 'Observed water level.',
    inputSchema: {
      type: 'object',
      properties: {
        station: { type: 'string' },
        begin_date: { type: 'string' },
        end_date: { type: 'string' },
        datum: { type: 'string' },
        units: { type: 'string' },
        time_zone: { type: 'string' },
      },
      required: ['station', 'begin_date', 'end_date'],
    },
  },
  {
    name: 'currents',
    description: 'Observed currents.',
    inputSchema: {
      type: 'object',
      properties: {
        station: { type: 'string' },
        begin_date: { type: 'string' },
        end_date: { type: 'string' },
        bin: { type: 'number' },
        units: { type: 'string' },
        time_zone: { type: 'string' },
      },
      required: ['station', 'begin_date', 'end_date'],
    },
  },
  {
    name: 'met_obs',
    description: 'Meteorological observations.',
    inputSchema: {
      type: 'object',
      properties: {
        station: { type: 'string' },
        product: { type: 'string', description: 'wind | air_temperature | water_temperature | air_pressure | humidity | conductivity | visibility' },
        begin_date: { type: 'string' },
        end_date: { type: 'string' },
        units: { type: 'string' },
        time_zone: { type: 'string' },
      },
      required: ['station', 'product', 'begin_date', 'end_date'],
    },
  },
  {
    name: 'datums',
    description: 'Vertical datums for a station.',
    inputSchema: {
      type: 'object',
      properties: { station: { type: 'string' } },
      required: ['station'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'stations': {
      const type = String(args.type ?? 'waterlevels');
      return metaGet(`/stations.json?type=${encodeURIComponent(type)}`);
    }
    case 'station_metadata':
      return metaGet(`/stations/${encodeURIComponent(reqStr(args, 'station', '"8454000"'))}.json`);
    case 'datums':
      return metaGet(`/stations/${encodeURIComponent(reqStr(args, 'station', '"8454000"'))}/datums.json`);
    case 'predictions':
      return dataGet(reqStr(args, 'station', '"8454000"'), {
        product: 'predictions',
        begin_date: reqStr(args, 'begin_date', '"20260101"'),
        end_date: reqStr(args, 'end_date', '"20260102"'),
        datum: String(args.datum ?? 'MLLW'),
        interval: String(args.interval ?? 'hilo'),
        units: String(args.units ?? 'english'),
        time_zone: String(args.time_zone ?? 'gmt'),
      });
    case 'water_level':
      return dataGet(reqStr(args, 'station', '"8454000"'), {
        product: 'water_level',
        begin_date: reqStr(args, 'begin_date', '"20260101"'),
        end_date: reqStr(args, 'end_date', '"20260102"'),
        datum: String(args.datum ?? 'MLLW'),
        units: String(args.units ?? 'english'),
        time_zone: String(args.time_zone ?? 'gmt'),
      });
    case 'currents':
      return dataGet(reqStr(args, 'station', '"PUG1515"'), {
        product: 'currents',
        begin_date: reqStr(args, 'begin_date', '"20260101"'),
        end_date: reqStr(args, 'end_date', '"20260101 06:00"'),
        bin: args.bin != null ? String(args.bin) : undefined,
        units: String(args.units ?? 'english'),
        time_zone: String(args.time_zone ?? 'gmt'),
      });
    case 'met_obs':
      return dataGet(reqStr(args, 'station', '"8454000"'), {
        product: reqStr(args, 'product', '"wind"'),
        begin_date: reqStr(args, 'begin_date', '"20260101"'),
        end_date: reqStr(args, 'end_date', '"20260102"'),
        units: String(args.units ?? 'english'),
        time_zone: String(args.time_zone ?? 'gmt'),
      });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function metaGet(path: string): Promise<unknown> {
  const res = await fetch(`${META}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`NOAA Tides metadata: ${res.status}`);
  return res.json();
}

async function dataGet(station: string, params: Record<string, string | undefined>): Promise<unknown> {
  const q = new URLSearchParams({ station, format: 'json', application: 'pipeworx' });
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const res = await fetch(`${DATA}?${q}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`NOAA Tides: ${res.status}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
