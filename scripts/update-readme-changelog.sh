#!/usr/bin/env bash
#
# Reads the latest entry from CHANGELOG.md (written by @semantic-release/changelog)
# and inserts it into readme.txt under the == Changelog == section in WordPress format.
#
# Usage: ./scripts/update-readme-changelog.sh <version>

set -euo pipefail

VERSION="$1"
CHANGELOG="CHANGELOG.md"
README="readme.txt"

# Extract the latest release section from CHANGELOG.md.
# It starts with "# [version]" or "## [version]" and ends before the next heading of equal or higher level.
latest_entry=$(sed -n "/^##* \[${VERSION}\]/,/^##* \[/{ /^##* \[${VERSION}\]/d; /^##* \[/d; p; }" "$CHANGELOG")

# Convert markdown to WordPress readme format:
# - "### Features" / "### Bug Fixes" etc. → remove (we flatten into a single list)
# - "* **scope:** description ([hash](url))" → "* description"
# - Strip leading/trailing whitespace and blank lines
wp_entry=$(echo "$latest_entry" \
  | grep -v '^###' \
  | grep -v '^$' \
  | sed 's/^\* \*\*[^:]*:\*\* /\* /' \
  | sed 's/ \[#[0-9]*\]([^)]*)//g' \
  | sed 's/ ([a-f0-9]\{7,\})//g' \
  | sed 's/ \[[a-f0-9]\{7,\}\]([^)]*)//g' \
  | sed 's/[[:space:]]*$//')

# Build the new changelog block
new_block="= ${VERSION} =
${wp_entry}"

# Insert after "== Changelog ==" line in readme.txt
sed -i "/^== Changelog ==$/a\\
\\
${new_block}" "$README"
