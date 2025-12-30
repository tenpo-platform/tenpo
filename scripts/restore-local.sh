#!/bin/bash
# Restore local database from production snapshot
#
# Prerequisites:
#   - Set SUPABASE_PROD_DB_PASSWORD in your environment or .env.scripts
#   - Local Supabase running (supabase start)
#
# Usage:
#   ./scripts/restore-local.sh

set -e

# Load env vars from .env.scripts if it exists
if [ -f .env.scripts ]; then
  export $(grep -v '^#' .env.scripts | xargs)
fi

# Project reference
PROD_REF="ifsjdiuheciwxuwrjsst"

# Check for required env vars
if [ -z "$SUPABASE_PROD_DB_PASSWORD" ]; then
  echo "❌ SUPABASE_PROD_DB_PASSWORD is not set"
  echo "   Add it to .env.scripts or export it"
  exit 1
fi

# Check if local Supabase is running
if ! supabase status > /dev/null 2>&1; then
  echo "❌ Local Supabase is not running"
  echo "   Run: supabase start"
  exit 1
fi

# Connection strings
PROD_URL="postgresql://postgres.${PROD_REF}:${SUPABASE_PROD_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
LOCAL_URL="postgresql://postgres:postgres@localhost:54322/postgres"

SNAPSHOT_FILE="/tmp/tenpo-prod-snapshot.sql"

echo "📸 Dumping production database..."
pg_dump "$PROD_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  -f "$SNAPSHOT_FILE"

echo "🗑️  Restoring to local database..."
psql "$LOCAL_URL" -f "$SNAPSHOT_FILE"

echo "🧹 Cleaning up..."
rm -f "$SNAPSHOT_FILE"

echo "✅ Local database restored from production!"
