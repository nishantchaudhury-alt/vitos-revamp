# Copy cURL + Share API (one-time link)

Add two real actions to the API detail endpoint bar: copy a ready-to-run cURL command, and share the API via a one-time link that can be copied or emailed.

## Endpoint bar (API detail header)

Keep the current method badge, path, version and copy-path button. Add two actions to the right side:

- **Copy cURL** — small button with a terminal icon. Copies a full command built from the API's method, endpoint, headers and (for non-GET) a sample JSON body. Shows an inline "Copied" check for ~1.5s.
- **Share** — button with a link icon that opens the share modal.

## Share modal

Uses the same centered modal shell already used elsewhere in the product (440px card, dark scrim, Esc/backdrop close, X in the corner).

Content:

1. Title "Share this API" + one-line helper: the recipient gets a read-only view of this endpoint, and the link works once.
2. **Link settings** row: expiry select (1 hour / 24 hours / 7 days, default 24 hours) and a note that the link expires after first use.
3. **Generate link** primary button. After generating:
   - Read-only field showing the one-time URL (masked/truncated, monospace) with a Copy button and copied confirmation.
   - Small caption: created just now, single use, expires in <selected window>.
   - "Regenerate" text action that replaces the link and invalidates the previous one in local state.
4. **Or send by email** section: email input + Send button. Validates a basic email shape, disables Send while empty/invalid, and on submit shows a success state ("Link sent to name@example.com") with a "Send to someone else" reset. Multiple sends allowed one at a time.
5. Footer: Close.

All states live in component state — no backend calls; the token is generated client-side so the flow is fully demoable.

## Technical notes

- All work in `src/components/vitos/ApiDetailPage.tsx`.
- Add a local `ModalShell` (portal + Esc + body scroll lock) mirroring the one in `ChannelListView.tsx`, plus a `ShareApiModal` and a `buildCurl(row)` helper.
- Reuse existing tokens (`border-border`, `bg-card`, `hover:bg-hover`, muted foreground) — no new colors.
- Copy uses `navigator.clipboard.writeText` with the same try/catch fallback pattern as `copyPath`.
