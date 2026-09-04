export interface McpToolSummary {
  name: string;
  description: string;
}

export interface McpServerMeta {
  name: string;
  version: string;
  protocolVersion: string | null;
}

export interface FetchMcpToolsResult {
  server: McpServerMeta;
  tools: McpToolSummary[];
}

function parseSseJsonObjects(body: string): unknown[] {
  const out: unknown[] = [];
  for (const line of body.split("\n")) {
    const t = line.trimEnd();
    if (!t.startsWith("data:")) continue;
    const raw = t.slice(5).trim();
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw) as unknown);
    } catch {
      /* skip non-JSON lines */
    }
  }
  return out;
}

function getJsonRpcResult<T>(payloads: unknown[], id: number): T {
  for (const p of payloads) {
    if (typeof p !== "object" || p === null) continue;
    const o = p as { id?: unknown; result?: T; error?: { message?: string } };
    if (o.id !== id) continue;
    if (o.error) {
      throw new Error(o.error.message ?? "MCP error");
    }
    if (o.result === undefined) {
      throw new Error("Empty MCP result");
    }
    return o.result;
  }
  throw new Error("No JSON-RPC response from MCP");
}

interface InitializeResult {
  protocolVersion?: string;
  serverInfo?: { name?: string; version?: string };
}

interface ToolsListResult {
  tools?: Array<{ name: string; description?: string }>;
}

async function mcpPost(
  url: string,
  apiKey: string,
  rpcBody: Record<string, unknown>,
  sessionId: string | null,
): Promise<{ sessionId: string; payloads: unknown[] }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "X-API-Key": apiKey,
  };
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(rpcBody),
  });
  const text = await res.text();
  const sid =
    res.headers.get("mcp-session-id") ??
    res.headers.get("MCP-Session-Id") ??
    "";
  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}`);
  }
  return { sessionId: sid.trim(), payloads: parseSseJsonObjects(text) };
}

export async function fetchPostsivaMcpTools(
  baseUrl: string,
  apiKey: string,
): Promise<FetchMcpToolsResult> {
  const url = baseUrl.replace(/\/$/, "");
  const key = apiKey.trim();
  if (!key) {
    throw new Error("API key is required");
  }

  const init = await mcpPost(
    url,
    key,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "postsiva-web", version: "1.0.0" },
      },
    },
    null,
  );
  if (!init.sessionId) {
    throw new Error("Missing mcp-session-id header");
  }
  const initResult = getJsonRpcResult<InitializeResult>(init.payloads, 1);
  const serverName = initResult.serverInfo?.name ?? "MCP server";
  const serverVersion = initResult.serverInfo?.version ?? "—";
  const protocolVersion = initResult.protocolVersion ?? null;

  const listed = await mcpPost(
    url,
    key,
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    init.sessionId,
  );
  const toolsResult = getJsonRpcResult<ToolsListResult>(listed.payloads, 2);
  const raw = toolsResult.tools ?? [];
  const tools: McpToolSummary[] = raw.map((t) => ({
    name: t.name,
    description: typeof t.description === "string" ? t.description : "",
  }));

  return {
    server: {
      name: serverName,
      version: serverVersion,
      protocolVersion,
    },
    tools,
  };
}
