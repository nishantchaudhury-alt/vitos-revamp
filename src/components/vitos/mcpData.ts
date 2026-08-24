export const MCP_SERVER_URL = "https://api.vitos.io/v1/mcp";
// Placeholder until the final setup guide document is shared.
export const MCP_HOW_TO_USE_URL = "#mcp-setup-guide";

export type McpCredentialType = "API Key" | "OAuth 2.0" | "JWT";
export type McpCredentialStatus = "Active" | "Revoked" | "Expired";

export type McpCredential = {
  id: string;
  displayName: string;
  subject: string;
  type: McpCredentialType;
  status: Exclude<McpCredentialStatus, "Expired">;
  provider: string;
  rateLimit: string;
  ipPolicy: string;
  expiry: string;
  scopes: string[];
};

/** Mirrors the Authentication → Credentials records available for MCP auth. */
export const MCP_CREDENTIALS: McpCredential[] = [
  {
    id: "cred_prod_mcp",
    displayName: "Production MCP Client",
    subject: "vitos-prod-mcp",
    type: "API Key",
    status: "Active",
    provider: "Internal API Keys",
    rateLimit: "Pro Tier",
    ipPolicy: "Office IPs",
    expiry: "2026-12-20",
    scopes: ["users:read", "billing:read", "billing:charge", "search:query", "users:write"],
  },
  {
    id: "cred_support_bot",
    displayName: "Support Bot OAuth",
    subject: "support-bot@acme.com",
    type: "OAuth 2.0",
    status: "Active",
    provider: "Okta Workforce",
    rateLimit: "Enterprise",
    ipPolicy: "None",
    expiry: "—",
    scopes: ["users:read", "users:write", "search:query"],
  },
  {
    id: "cred_analytics_reader",
    displayName: "Analytics Reader",
    subject: "analytics-reader",
    type: "JWT",
    status: "Active",
    provider: "Partner OAuth",
    rateLimit: "Free Tier",
    ipPolicy: "Partner Allowlist",
    expiry: "—",
    scopes: ["search:query"],
  },
];

export type McpToolKind = "Bound API" | "Bound Fn" | "API" | "Agent" | "Query";

export type McpTool = {
  name: string;
  meta: string;
  kind: McpToolKind;
  scope: string;
  access: "Read only" | "Writes";
};

/** Tools exposed over MCP; visibility is derived from the credential's scopes. */
export const MCP_TOOLS: McpTool[] = [
  {
    name: "get_user",
    meta: "GET · /v1/users/{id}",
    kind: "API",
    scope: "users:read",
    access: "Read only",
  },
  {
    name: "list_users",
    meta: "GET · /v1/users",
    kind: "API",
    scope: "users:read",
    access: "Read only",
  },
  {
    name: "kapture_lookup",
    meta: "GET · /custom/lookup",
    kind: "API",
    scope: "users:read",
    access: "Read only",
  },
  {
    name: "create_ticket",
    meta: "POST · /v1/tickets",
    kind: "Bound API",
    scope: "users:write",
    access: "Writes",
  },
  {
    name: "update_user",
    meta: "PATCH · /v1/users/{id}",
    kind: "Bound API",
    scope: "users:write",
    access: "Writes",
  },
  {
    name: "pdf_render_fn",
    meta: "Custom Function · TS",
    kind: "Bound Fn",
    scope: "users:write",
    access: "Writes",
  },
  {
    name: "get_invoice",
    meta: "GET · /v1/billing/invoices",
    kind: "API",
    scope: "billing:read",
    access: "Read only",
  },
  {
    name: "charge_customer",
    meta: "POST · /v1/billing/charges",
    kind: "Bound API",
    scope: "billing:charge",
    access: "Writes",
  },
  {
    name: "search_collection",
    meta: "Query · semantic",
    kind: "Query",
    scope: "search:query",
    access: "Read only",
  },
  {
    name: "support_agent",
    meta: "Agent · vitos-support",
    kind: "Agent",
    scope: "search:query",
    access: "Read only",
  },
];

export function toolsForScopes(scopes: string[]): McpTool[] {
  return MCP_TOOLS.filter((t) => scopes.includes(t.scope));
}

export function getMcpCredentialStatus(
  credential: McpCredential,
  now = Date.now(),
): McpCredentialStatus {
  if (credential.status === "Revoked") return "Revoked";
  if (credential.expiry === "—") return "Active";

  const expiresAt = Date.parse(`${credential.expiry}T23:59:59Z`);
  return Number.isFinite(expiresAt) && expiresAt < now ? "Expired" : "Active";
}
