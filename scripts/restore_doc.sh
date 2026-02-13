#!/bin/bash

# ==============================================
# restore_doc.sh — Restore archived documentation
# ==============================================
#
# Usage:
#   bash scripts/restore_doc.sh FILENAME
#
# Example:
#   bash scripts/restore_doc.sh TAREFAS_FUTURAS.md
#
# What it does:
# 1. Checks if file exists in archive
# 2. Looks up original path in index.csv
# 3. Moves file back to repo root (or original location)
# 4. Stages the change in git
# 5. Suggests commit message
#
# ==============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FILENAME="$1"
ARCHIVE_DIR="docs/archive"
INDEX_CSV="$ARCHIVE_DIR/index.csv"

# Validate input
if [ -z "$FILENAME" ]; then
    echo -e "${RED}❌ Error: No filename provided${NC}"
    echo ""
    echo "Usage: bash scripts/restore_doc.sh FILENAME"
    echo ""
    echo "Available archived files:"
    cat "$INDEX_CSV" | tail -n +2 | cut -d',' -f1 | sed 's/^/  - /'
    exit 1
fi

# Check if archive exists
if [ ! -f "$INDEX_CSV" ]; then
    echo -e "${RED}❌ Error: Archive index not found at $INDEX_CSV${NC}"
    exit 1
fi

# Find file in archive (check all subdirectories)
ARCHIVE_PATH=$(find "$ARCHIVE_DIR" -name "$FILENAME" -type f | head -n 1)

if [ -z "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Error: File '$FILENAME' not found in archive${NC}"
    echo ""
    echo "Available archived files:"
    cat "$INDEX_CSV" | tail -n +2 | cut -d',' -f1 | sed 's/^/  - /'
    exit 1
fi

# Look up original path from CSV
ORIGINAL_PATH=$(grep "^$FILENAME," "$INDEX_CSV" | cut -d',' -f2 | sed 's|^\./||')

if [ -z "$ORIGINAL_PATH" ]; then
    # If not in CSV, restore to repo root
    ORIGINAL_PATH="$FILENAME"
    echo -e "${YELLOW}⚠️  Original path not found in index. Restoring to repo root: ./$FILENAME${NC}"
fi

# Check if destination already exists
if [ -f "$ORIGINAL_PATH" ]; then
    echo -e "${YELLOW}⚠️  Warning: '$ORIGINAL_PATH' already exists${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Restore cancelled${NC}"
        exit 1
    fi
    rm "$ORIGINAL_PATH"
fi

# Create destination directory if needed
DEST_DIR=$(dirname "$ORIGINAL_PATH")
if [ ! -d "$DEST_DIR" ] && [ "$DEST_DIR" != "." ]; then
    mkdir -p "$DEST_DIR"
    echo -e "${GREEN}✓ Created directory: $DEST_DIR${NC}"
fi

# Move file using git (preserves history)
echo -e "${GREEN}📦 Restoring: $ARCHIVE_PATH → $ORIGINAL_PATH${NC}"
git mv "$ARCHIVE_PATH" "$ORIGINAL_PATH"

echo -e "${GREEN}✓ File restored successfully!${NC}"
echo ""
echo "📝 Suggested commit message:"
echo ""
echo -e "${YELLOW}chore(docs): restore $FILENAME from archive${NC}"
echo ""
echo "To commit:"
echo "  git commit -m \"chore(docs): restore $FILENAME from archive\""
echo ""
echo "To undo (before commit):"
echo "  git mv $ORIGINAL_PATH $ARCHIVE_PATH"
