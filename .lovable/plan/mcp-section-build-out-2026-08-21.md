# MCP section build-out

Replace the current MCP tab (hero + a single "MCP server" card + a placeholder "MCP tools" block) with the full structure from the product brief.

## Layout, top to bottom

1. **MCP banner** — keep the existing MCP hero (label, headline, copy), and make the endpoint area the real connector URL with a dedicated **Copy URL** action plus a **How to use** link (opens the setup guide; placeholder href until Priyanshu's doc lands).

2. **Connection card** — a compact card under the banner showing:
   - MCP server URL in a mono field with a Copy button (copied → check state, same pattern as the "Use your collection as…" cards).
   - Transport label (Streamable HTTP) and a short "paste this into Claude / Cursor / any MCP client" line.
   - Secondary "How to use" link.

3. **Credentials** — card titled "Credentials" that drives everything below:
   - Reuses the existing credential data shape from the Authentication → Credentials table (display name, subject, provider, scopes, expiry).
   - Selection UI: selectable credential cards in a grid (radio-like, with provider + scope count + expiry); switching selection refreshes the tool list. If more than 4 exist, a compact dropdown is used instead.
   - Header action: **+ Add credentials**, which navigates to Authentication → Credentials and opens the existing Issue Credential drawer (via a window event, same mechanism already used for `vitos:navigate-policy`).

4. **Tool list** — table of MCP tools available for the selected credential: tool name (mono), description, type badge (API / Agent / Query), required scope, and a "Read only / Writes" annotation pill. Header shows "N tools available for <credential>".

## UX states

- **No credentials**: credentials card renders an empty state — icon, "No credentials yet", copy explaining tools can't be loaded until a credential is added, single primary CTA **Add credentials**. Tool list section renders a muted, disabled placeholder.
- **Credentials exist, none selected**: tool list shows "Select a credential to see the tools you can call."
- **No tools for selected credential**: tool list shows "No tools are available for this credential." with a hint to widen scopes in Authentication.
- **Multiple credentials**: selecting a different one re-derives the tool list; selection persists while on the tab.

## Data

All demo data, in-file, matching the existing mock style:

- 2–3 credentials (e.g. Support Bot – API Key, Ops Agent – OAuth 2.0, Analytics Reader – JWT) with scope sets.
- ~10 mock tools each tagged with a required scope; the tool list is filtered by the selected credential's scopes so the state changes are visibly real. One credential intentionally maps to zero tools so the empty state is reachable.

## Technical notes

- Work stays in `src/components/vitos/IntegrationsPage.tsx`: `MCPSection` is expanded into the connection + credentials + tools composition, and the `sectionTab === "mcp"` placeholder branch is removed.
- Mock credential/tool data and the tool-filtering helper go in a small new module `src/components/vitos/mcpData.ts` to keep the page file manageable.
- No new dependencies; existing design tokens, card/table/pill patterns, and the burgundy `#B22257` primary are reused. No backend work.
