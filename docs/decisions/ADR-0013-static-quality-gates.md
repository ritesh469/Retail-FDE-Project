# ADR-0013 — Static quality gates: `make lint`, CI, pre-commit

**Status:** accepted

## Context
CLAUDE.md requires lint, format, type-check and a secret scan before any change
is done, but the repo had no lint config, no CI, and no secret scanning (an
earlier pre-commit setup had been deleted). CLAUDE.md also rules out pytest,
Playwright and eval harnesses — real verification is `make smoke` against the
live stack, which needs paid API keys and can't honestly run in CI.

## Decision
One entrypoint, `make lint`, that needs no running stack, with every tool pinned:
- `ruff check` (config: `ruff.toml` — pycodestyle errors + pyflakes) over all
  Python packages, run from `ghcr.io/astral-sh/ruff:0.16.9`.
- `opa test` on `infra/opa` with `openpolicyagent/opa:1.20.1` (the same version
  the stack runs).
- Frontend: `npm run lint` (ESLint) + `npx tsc --noEmit`.
- gitleaks `v8.30.1` over the full git history, config `.gitleaks.toml`
  (default rules; allowlist limited to the fixed local-dev Keycloak client
  secrets and one historical commit).

GitHub Actions (`.github/workflows/ci.yml`) runs the same checks plus
`docker compose config` validation and builds of the backend and mcp-server
images. `.pre-commit-config.yaml` runs the fast subset on staged files.

Not adopted: `ruff format` across the codebase (79 files would be rewritten —
a pure-noise diff), a wider ruff rule set, and a `next build` in CI (needs the
Auth.js/Keycloak env). The worker image (~2.4 GB CPU torch) is built by
`make up`, not CI.

## Consequences
- CI proves the code is well-formed, the governance policy's unit tests pass,
  and no new secret was committed. It does **not** prove behaviour — that is
  still `make smoke` + the scenario walkthroughs on a live stack.
- Pinned tool versions are bumped deliberately, like any dependency.
