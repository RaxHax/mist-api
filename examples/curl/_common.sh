#!/usr/bin/env bash
# Sameiginlegar stillingar fyrir curl dæmin.
#
# Sæktu þessa skrá inn í hin dæmin með "source". Hún stöðvar keyrslu strax ef
# API-lykilinn vantar, svo þú fáir skýr skilaboð í stað 401 svars.

set -euo pipefail

: "${MIST_API_KEY:?Settu MIST_API_KEY fyrst, til dæmis: export MIST_API_KEY=mist_live_...}"

# Grunnslóðin er stillanleg, því nákvæm slóð er staðfest með lyklinum.
MIST_BASE_URL="${MIST_BASE_URL:-https://mist.is/api/v1}"

# Sameiginlegir valkostir: sýna villur, fella hljóðlaus 5xx svör ekki niður.
CURL_OPTS=(--silent --show-error --fail-with-body)
