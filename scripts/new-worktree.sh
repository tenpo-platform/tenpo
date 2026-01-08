#!/bin/bash
# Create a new git worktree branched from latest origin/dev
#
# Features:
#   - Fetches latest dev from remote
#   - Creates worktree with new branch from origin/dev
#   - Copies .env.local to the new worktree
#
# Usage:
#   ./scripts/new-worktree.sh

set -e

# Get the root of the main worktree
MAIN_WORKTREE="$(git rev-parse --show-toplevel)"
WORKTREES_DIR="$(dirname "$MAIN_WORKTREE")"

# Interactive: ask for branch name
echo "Enter the name for your new branch:"
read -r BRANCH_NAME

if [ -z "$BRANCH_NAME" ]; then
  echo "Branch name cannot be empty"
  exit 1
fi

# Validate branch name (no spaces, basic git branch name rules)
if [[ ! "$BRANCH_NAME" =~ ^[a-zA-Z0-9_/-]+$ ]]; then
  echo "Invalid branch name. Use only letters, numbers, underscores, hyphens, and slashes."
  exit 1
fi

WORKTREE_PATH="${WORKTREES_DIR}/${BRANCH_NAME}"

# Check if worktree already exists
if [ -d "$WORKTREE_PATH" ]; then
  echo "Directory already exists: $WORKTREE_PATH"
  exit 1
fi

# Fetch latest from remote
echo "Fetching latest from origin..."
git fetch origin dev

# Create the worktree with a new branch from origin/dev
echo "Creating worktree at: $WORKTREE_PATH"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" origin/dev

# Copy .env.local if it exists
if [ -f "${MAIN_WORKTREE}/.env.local" ]; then
  echo "Copying .env.local to new worktree..."
  cp "${MAIN_WORKTREE}/.env.local" "${WORKTREE_PATH}/.env.local"
else
  echo "No .env.local found in main worktree, skipping copy"
fi

echo ""
echo "Worktree created successfully!"
echo "  Path: $WORKTREE_PATH"
echo "  Branch: $BRANCH_NAME (from origin/dev)"
echo ""
echo "To start working:"
echo "  cd $WORKTREE_PATH"
