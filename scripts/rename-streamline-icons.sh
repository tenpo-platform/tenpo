#!/bin/bash
# Renames Streamline Platinum SVGs to kebab-case
cd "$(dirname "$0")/../src/icons/svg"

for f in *.svg; do
  if [[ "$f" == *"--Streamline-Platinum"* ]]; then
    newname=$(echo "$f" | sed 's/--Streamline-Platinum//' | tr '[:upper:]' '[:lower:]')
    mv "$f" "$newname"
    echo "Renamed: $f -> $newname"
  fi
done

echo "Done!"
