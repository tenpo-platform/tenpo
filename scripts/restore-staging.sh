#!/bin/bash
# Restore staging database from production snapshot
#
# Prerequisites:
#   - Set SUPABASE_PROD_DB_PASSWORD in your environment or .env.scripts
#   - Set SUPABASE_STAGING_DB_PASSWORD in your environment or .env.scripts
#
# Usage:
#   ./scripts/restore-staging.sh

set -e

# Load env vars from .env.scripts if it exists
if [ -f .env.scripts ]; then
  export $(grep -v '^#' .env.scripts | xargs)
fi

# Project references
PROD_REF="ifsjdiuheciwxuwrjsst"
STAGING_REF="zqyjrsjjdmiapyablbzv"

# Check for required env vars
if [ -z "$SUPABASE_PROD_DB_PASSWORD" ]; then
  echo "❌ SUPABASE_PROD_DB_PASSWORD is not set"
  echo "   Add it to .env.scripts or export it"
  exit 1
fi

if [ -z "$SUPABASE_STAGING_DB_PASSWORD" ]; then
  echo "❌ SUPABASE_STAGING_DB_PASSWORD is not set"
  echo "   Add it to .env.scripts or export it"
  exit 1
fi

# Connection strings
PROD_URL="postgresql://postgres.${PROD_REF}:${SUPABASE_PROD_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
STAGING_URL="postgresql://postgres.${STAGING_REF}:${SUPABASE_STAGING_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

SNAPSHOT_FILE="/tmp/tenpo-prod-snapshot.sql"

echo "📸 Dumping production database..."
pg_dump "$PROD_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  -f "$SNAPSHOT_FILE"

echo "🗑️  Restoring to staging..."
psql "$STAGING_URL" -f "$SNAPSHOT_FILE"

echo "🧹 Cleaning up..."
rm -f "$SNAPSHOT_FILE"

echo "✅ Staging restored from production!"
