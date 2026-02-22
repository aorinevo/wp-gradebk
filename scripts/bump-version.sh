#!/usr/bin/env bash
#
# Bumps the version string in all plugin files.
#
# Usage: ./scripts/bump-version.sh <version>

set -euo pipefail

VERSION="$1"

# GradeBook.php — plugin header
perl -pi -e "s/^Version: .*/Version: ${VERSION}/" GradeBook.php

# GradeBook.php — PHP constant
perl -pi -e "s/(AN_GRADEBOOK_VERSION', ')[^']*/${1}${VERSION}/" GradeBook.php

# readme.txt — Stable tag
perl -pi -e "s/^Stable tag: .*/Stable tag: ${VERSION}/" readme.txt

# package.json — version field
perl -pi -e "s/(\"version\": \")[^\"]*/${1}${VERSION}/" package.json
