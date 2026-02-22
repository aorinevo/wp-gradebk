#!/usr/bin/env bash
#
# Bumps the version string in all plugin files.
#
# Usage: ./scripts/bump-version.sh <version>

set -euo pipefail

VERSION="$1"

# GradeBook.php — plugin header
sed -i "s/^Version: .*/Version: ${VERSION}/" GradeBook.php

# GradeBook.php — PHP constant
sed -i "s/AN_GRADEBOOK_VERSION', '[^']*'/AN_GRADEBOOK_VERSION', '${VERSION}'/" GradeBook.php

# readme.txt — Stable tag
sed -i "s/^Stable tag: .*/Stable tag: ${VERSION}/" readme.txt

# package.json — version field
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" package.json
