# ADR-0012 — Publish every port on the loopback interfaces only

**Status:** accepted

## Context
`docker-compose.yml` published all 15 service ports as `"HOST:CONTAINER"`, which
Docker binds on every interface (`0.0.0.0`). On a laptop on shared Wi-Fi that
exposes Postgres, Redis, the dev-mode Vault (root token), MinIO, Keycloak,
ContextForge, OPA and the API to anyone on the same network — for a system whose
whole scope is "local-only, one machine".

## Decision
Publish every port on **both** loopback addresses and nothing else, e.g.
`["127.0.0.1:5432:5432", "[::1]:5432:5432"]`.

Why both: on Windows, `localhost` resolves to `::1` first. With an IPv4-only
binding, the IPv6 attempt is refused — and psycopg's connect on Windows never
notices the refusal, so every host script's Postgres connection through
`localhost` stalled until `connect_timeout` (30 s measured; forever without one)
before falling back to IPv4. `verify_m2` hung this way. Binding `[::1]` too keeps
`localhost` instant for every client (measured: ~0.1 s) with no code changes.
Nothing else changes: containers still talk to each other over the `rg` compose
network, and everything on the host (the Next.js dev server, the `scripts/`,
the browser) already uses `localhost`.

Verified on a live stack after `docker compose up -d`: `all services healthy`;
ports 5432 / 8200 / 8000 are unreachable on every non-loopback address of the
machine (Wi-Fi and virtual adapters); psycopg and httpx through `localhost`
connect immediately.

## Consequences
- Another machine can no longer reach the demo (e.g. a phone on the same Wi-Fi).
  If that's ever wanted, it's a deliberate per-port change, not the default.
- Remaining local-dev postures are unchanged and documented in the README's
  Security notes (dev-mode Vault, plain HTTP, fixed Keycloak client secrets).
