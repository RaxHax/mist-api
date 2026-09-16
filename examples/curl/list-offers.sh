#!/usr/bin/env bash
# Blaðar í gegnum öll tilboð fyrirtækisins.
#
# Svarið ber nextCursor. Sé hann strengur er önnur síða til, og þá er hann
# sendur aftur sem cursor. Lykkjan hættir þegar hann kemur til baka sem null.
#
# Krefst jq. Notkun: MIST_API_KEY=mist_live_... ./list-offers.sh

source "$(dirname "$0")/_common.sh"

command -v jq >/dev/null || {
  echo "Þetta dæmi þarf jq. Sjá https://jqlang.github.io/jq/" >&2
  exit 1
}

CURSOR=""
SIDA=1

while true; do
  if [ -z "$CURSOR" ]; then
    SLOD="$MIST_BASE_URL/offers?limit=50"
  else
    SLOD="$MIST_BASE_URL/offers?limit=50&cursor=$CURSOR"
  fi

  SVAR="$(curl "${CURL_OPTS[@]}" "$SLOD" -H "Authorization: Bearer $MIST_API_KEY")"

  echo "Síða $SIDA:"
  echo "$SVAR" | jq -r '.data[] | "  \(.externalId)  \(.name)"'

  CURSOR="$(echo "$SVAR" | jq -r '.nextCursor // empty')"
  [ -z "$CURSOR" ] && break

  SIDA=$((SIDA + 1))
done

echo "Engar fleiri síður."
