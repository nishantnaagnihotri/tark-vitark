import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = (process.env.PENPOT_BASE_URL || "").replace(/\/$/, "");
const TOKEN = process.env.PENPOT_TOKEN || "";
const TIMEOUT_MS = Number(process.env.PENPOT_TIMEOUT_MS || 20000);

function assertConfigured() {
  if (!BASE_URL) {
    throw new Error("PENPOT_BASE_URL is required.");
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeQuery(query) {
  if (!query || typeof query !== "object") return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.set(key, String(value));
    }
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

async function requestPenpot({ method = "GET", path = "/", query, body, headers = {} }) {
  assertConfigured();

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}${normalizeQuery(query)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (TOKEN) {
    requestHeaders.Authorization = `Bearer ${TOKEN}`;
  }

  let requestBody;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    const raw = await response.text();
    const parsed = safeJsonParse(raw);

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: parsed ?? raw,
      url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function asTextContent(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

const server = new Server(
  {
    name: "penpot-mcp-bridge",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "penpot_api_request",
      description:
        "Call any Penpot API endpoint by method/path/query/body. Use this to interact with Penpot projects, files, and pages in a flexible way.",
      inputSchema: {
        type: "object",
        properties: {
          method: {
            type: "string",
            description: "HTTP method",
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            default: "GET",
          },
          path: {
            type: "string",
            description: "API path, for example /api/rpc/command/get-profile",
          },
          query: {
            type: "object",
            description: "Optional query string params",
            additionalProperties: true,
          },
          body: {
            description: "Optional JSON body",
          },
          headers: {
            type: "object",
            description: "Optional additional headers",
            additionalProperties: {
              type: "string",
            },
          },
        },
        required: ["path"],
      },
    },
    {
      name: "penpot_health_check",
      description: "Basic connectivity check against the configured Penpot base URL.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "penpot_health_check") {
      assertConfigured();
      const result = await requestPenpot({ method: "GET", path: "/" });
      return asTextContent({
        ok: result.ok,
        status: result.status,
        baseUrl: BASE_URL,
        note: "If this endpoint is not useful in your deployment, use penpot_api_request with a known API path.",
      });
    }

    if (name === "penpot_api_request") {
      const result = await requestPenpot({
        method: args?.method || "GET",
        path: args?.path,
        query: args?.query,
        body: args?.body,
        headers: args?.headers,
      });

      return asTextContent(result);
    }

    return asTextContent({ error: `Unknown tool: ${name}` });
  } catch (error) {
    return asTextContent({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
