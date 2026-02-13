#!/bin/bash
# Runs prettier + eslint --fix on files after Claude edits them

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Skip node_modules, .next, out, build
if [[ "$FILE_PATH" =~ (node_modules|\.next/|/out/|/build/) ]]; then
  exit 0
fi

# Run prettier on all supported file types
npx prettier --write "$FILE_PATH" 2>/dev/null

# Run eslint --fix on JS/TS files only
if [[ "$FILE_PATH" =~ \.(js|ts|jsx|tsx|mjs)$ ]]; then
  npx eslint --fix "$FILE_PATH" 2>/dev/null
fi

exit 0
