#!/usr/bin/env bash
# Afvirkjar tilboð, til dæmis þegar vara selst upp.
#
# Tilboðinu er ekki eytt. Verðsagan og tölfræðin haldast, og PUT á sama
# externalId vekur tilboðið aftur þegar varan kemur á lager.
#
# Notkun: MIST_API_KEY=mist_live_... ./disable-offer.sh [externalId]

source "$(dirname "$0")/_common.sh"

EXTERNAL_ID="${1:-SKU-1042}"

curl "${CURL_OPTS[@]}" -X DELETE \
  "$MIST_BASE_URL/offers/$EXTERNAL_ID" \
  -H "Authorization: Bearer $MIST_API_KEY"
