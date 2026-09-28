# ADR-0011 — MinIO images from the pgsty community fork

**Status:** accepted (approved by the project owner as the third-party image source)

## Context
`make up` failed on a fresh machine: `minio/minio` and `minio/mc` no longer exist
on Docker Hub ("repository does not exist"), and the `quay.io/minio/*` mirror
returns 401. Upstream MinIO stopped publishing community-edition images/binaries
in late 2025, so the pinned `RELEASE.2025-09-07` / `RELEASE.2025-08-13` tags are
unpullable and the whole stack cannot start. Every other image pulls fine.

Candidates checked (Docker Hub, at the time of the fix):
- `coollabsio/minio` — rebuilds of upstream, frozen at `RELEASE.2025-10-15`; no
  further security fixes.
- `bitnamilegacy/minio` — Bitnami's frozen legacy catalog; different entrypoint
  and env layout, would need more compose changes.
- `pgsty/minio` + `pgsty/mc` — community-maintained fork of upstream MinIO
  (~860k pulls), still releasing (`RELEASE.2026-08-04` server,
  `RELEASE.2026-09-16` client), same CLI and S3 API.

## Decision
Use **`pgsty/minio:RELEASE.2026-08-04T00-00-00Z`** and
**`pgsty/mc:RELEASE.2026-09-16T00-00-00Z`**, pinned to exact tags. Only the two
`image:` lines change; command, env, volumes, ports, healthcheck, bucket init,
and `backup.sh`/`restore.sh` are untouched.

Verified before switching, against the real images: `minio server /data
--console-address :9001` starts; the compose healthcheck `mc ready local` exits 0
inside the server image; the client image has `/bin/sh`; `mc alias set`,
`mc mb -p`, `mc cp`, `mc mirror` (what `minio-init` and `backup.sh` use) all
work; the console answers HTTP 200 on :9001.

## Consequences
- The object store is a fork, not upstream. It is S3-compatible, so the app's
  `boto3` code and Langfuse's S3 client are unaffected; if the fork stops being
  maintained, any S3-compatible store (the fork, SeaweedFS, Garage) is a
  two-line swap here.
- Keep the tags pinned; bump deliberately and re-run `make smoke`.
