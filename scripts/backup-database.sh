#!/usr/bin/env bash
# Nightly Supabase Postgres backup, independent of Supabase's own storage.
#
# P16-dr-bcp.md (High): the platform had zero backup strategy outside of
# Supabase itself — if that account were locked or lost, every case,
# client, and financial record in it would be gone with no way to
# recover it. This dumps the database and uploads it to a *separate*
# object store, so losing access to Supabase doesn't mean losing the data.
#
# Requires:
#   DATABASE_URL             - Supabase connection string (Settings > Database
#                               > Connection string > URI, "Session pooler" or
#                               direct connection; use the `postgres` role)
#   BACKUP_S3_BUCKET          - s3://bucket/prefix to upload to (any
#                               S3-compatible target: AWS S3, Cloudflare R2,
#                               Backblaze B2 all work with `aws s3 cp`)
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_ENDPOINT_URL (if not AWS)
#
# Usage: ./scripts/backup-database.sh
# Wired to run nightly via .github/workflows/backup.yml.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set." >&2
  exit 1
fi
if [ -z "${BACKUP_S3_BUCKET:-}" ]; then
  echo "❌ BACKUP_S3_BUCKET is not set." >&2
  exit 1
fi

TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUT_DIR="$(mktemp -d)"
DUMP_FILE="${OUT_DIR}/malaf-backup-${TIMESTAMP}.sql.gz"

echo "📦 Dumping database..."
pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$DUMP_FILE"

SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "✅ Dump complete (${SIZE}): ${DUMP_FILE}"

echo "☁️  Uploading to ${BACKUP_S3_BUCKET}..."
aws s3 cp "$DUMP_FILE" "${BACKUP_S3_BUCKET%/}/malaf-backup-${TIMESTAMP}.sql.gz"

rm -rf "$OUT_DIR"
echo "🎉 Backup uploaded."

# Retention is left to a lifecycle policy on the bucket itself (e.g. expire
# objects older than 30-90 days) rather than deleting here, so a bug in
# this script can never delete the only remaining backup.
