#!/usr/bin/env bash
# Sækir tilvísunargögnin: vörumerki, verslanir og flokkatréð.
#
# Flokkatréð er langt, svo það er vistað í flokkar.json í stað þess að
# prentast. Keyrðu þetta einu sinni á sólarhring, ekki fyrir hvert tilboð.
#
# Notkun: MIST_API_KEY=mist_live_... ./reference-data.sh

source "$(dirname "$0")/_common.sh"

echo "Vörumerki:"
curl "${CURL_OPTS[@]}" \
  "$MIST_BASE_URL/brands" \
  -H "Authorization: Bearer $MIST_API_KEY"

echo
echo "Verslanir:"
curl "${CURL_OPTS[@]}" \
  "$MIST_BASE_URL/stores" \
  -H "Authorization: Bearer $MIST_API_KEY"

echo
echo "Flokkar (vistaðir í flokkar.json):"
curl "${CURL_OPTS[@]}" \
  "$MIST_BASE_URL/categories" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -o flokkar.json

echo "Tilbúið."
