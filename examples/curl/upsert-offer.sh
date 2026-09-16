#!/usr/bin/env bash
# Stofnar eða uppfærir eitt tilboð.
#
# Aðgerðin er endurtakanleg (idempotent): fyrsta kallið stofnar tilboðið (201), næstu kall
# uppfæra það (200). Óhætt er að keyra þetta eins oft og þú vilt.
#
# Athugaðu að PUT lýsir tilboðinu eins og það á að líta út eftir kallið.
# Reitur sem þú sleppir er hreinsaður, svo sendu alltaf allt tilboðið.
#
# Notkun: MIST_API_KEY=mist_live_... ./upsert-offer.sh [externalId]

source "$(dirname "$0")/_common.sh"

EXTERNAL_ID="${1:-SKU-1042}"

curl "${CURL_OPTS[@]}" -X PUT \
  "$MIST_BASE_URL/offers/$EXTERNAL_ID" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ullarkápa, dökkgrá",
    "description": "Kápa úr íslenskri ull, fóðruð.",
    "offerType": "product",
    "originalPrice": 49900,
    "discountedPrice": 34900,
    "url": "https://nordurljos.is/vorur/ullarkapa-dokkgra",
    "imageUrls": ["https://cdn.nordurljos.is/vorur/1042/a.jpg"],
    "categoryPathKey": "clothing/women/outerwear",
    "brand": "Norðurljós",
    "storeIds": "all",
    "isDraft": false
  }'
