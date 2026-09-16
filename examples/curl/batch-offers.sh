#!/usr/bin/env bash
# Sendir lotu af tilboðum, að hámarki 100 í einu.
#
# Lotan telst ein beiðni gagnvart hraðatakmörkuninni, svo þetta er langódýrasta
# leiðin til að senda margt. Svarið er 200 þótt einstakar færslur mistakist:
# lestu summary.failed og farðu í gegnum results.
#
# Notkun: MIST_API_KEY=mist_live_... ./batch-offers.sh

source "$(dirname "$0")/_common.sh"

curl "${CURL_OPTS[@]}" -X POST \
  "$MIST_BASE_URL/offers/batch" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "offers": [
      {
        "externalId": "SKU-1042",
        "name": "Ullarkápa, dökkgrá",
        "originalPrice": 49900,
        "discountedPrice": 34900,
        "url": "https://nordurljos.is/vorur/ullarkapa-dokkgra",
        "categoryPathKey": "clothing/women/outerwear",
        "brand": "Norðurljós",
        "storeIds": "all"
      },
      {
        "externalId": "SKU-1043",
        "name": "Ullarhúfa",
        "originalPrice": 6900,
        "discountedPrice": 4900,
        "url": "https://nordurljos.is/vorur/ullarhufa",
        "categoryPathKey": "clothing/unisex/accessories",
        "brand": "Norðurljós",
        "storeIds": "all"
      }
    ]
  }'
