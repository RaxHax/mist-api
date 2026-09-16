#!/usr/bin/env bash
# Staðfestir API-lykilinn og skilar fyrirtækinu sem hann tilheyrir.
#
# Notkun: MIST_API_KEY=mist_live_... ./me.sh

source "$(dirname "$0")/_common.sh"

curl "${CURL_OPTS[@]}" \
  "$MIST_BASE_URL/me" \
  -H "Authorization: Bearer $MIST_API_KEY"
