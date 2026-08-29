#!/usr/bin/env bash
#
# Apply catalog/migrations/*.sql to a throwaway Postgres database and run
# catalog/tests/schema_guarantees.sql against it.
#
#   npm run catalog:verify-schema
#
# Nothing here touches the Supabase project. It needs a local Postgres 14+
# (client and server binaries). Point PGBIN at your installation if it is not
# on PATH, e.g. PGBIN=/usr/lib/postgresql/16/bin npm run catalog:verify-schema
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGBIN="${PGBIN:-$(dirname "$(command -v initdb || command -v pg_ctl || echo /usr/lib/postgresql/16/bin/x)")}"
WORKDIR="${CATALOG_PG_WORKDIR:-${TMPDIR:-/tmp}/bb-catalog-verify}"
PORT="${CATALOG_PG_PORT:-55432}"
DB=catalog_verify

if [ ! -x "$PGBIN/initdb" ]; then
  echo "Could not find initdb. Install PostgreSQL, or set PGBIN to its bin directory." >&2
  exit 127
fi

cleanup() {
  "$PGBIN/pg_ctl" -D "$WORKDIR/data" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"

"$PGBIN/initdb" -D "$WORKDIR/data" --auth=trust >/dev/null
"$PGBIN/pg_ctl" -D "$WORKDIR/data" -o "-p $PORT -k $WORKDIR" -l "$WORKDIR/postgres.log" start >/dev/null

export PGHOST="$WORKDIR" PGPORT="$PORT"
createdb "$DB"

# Supabase supplies these roles; create them so the migrations run unmodified.
psql -d "$DB" -v ON_ERROR_STOP=1 -q <<'SQL'
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon')          then create role anon nologin;          end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end
$$;
SQL

for migration in "$ROOT"/catalog/migrations/*.sql; do
  echo "applying $(basename "$migration")"
  psql -d "$DB" -v ON_ERROR_STOP=1 -q -f "$migration"
done

echo "running schema guarantees"
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f "$ROOT/catalog/tests/schema_guarantees.sql" | tail -1
