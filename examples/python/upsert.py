#!/usr/bin/env python3
"""Stofnar eða uppfærir eitt tilboð í Mist.

Engin aðföng: notar aðeins staðalsafn Python (urllib), svo hægt sé að keyra
þetta hvar sem er án þess að setja upp requests.

Notkun:
    MIST_API_KEY=mist_live_... python3 upsert.py

Forútgáfa: endapunktarnir svara ekki ennþá. Skriftan er tilbúin til að keyra
um leið og viðmótið opnar.
"""

import json
import os
import sys
import urllib.error
import urllib.request

API_KEY = os.environ.get("MIST_API_KEY")
BASE_URL = os.environ.get("MIST_BASE_URL", "https://mist.is/api/v1")

# Villukóðar sem borgar sig að reyna aftur við. Allt annað er annaðhvort
# gagnavilla sem þú verður að laga, eða uppsetningarvandi sem enginn fjöldi
# endurtekninga leysir.
REYNA_AFTUR = {"rate_limited", "internal_error"}
LAGA_GOGN = {"validation_failed", "not_found", "batch_too_large"}

# Þitt eigið stöðuga auðkenni vörunnar. Mist lyklar tilboðið á það, svo sama
# kall má endurtaka hættulaust: fyrsta kallið stofnar, næstu uppfæra.
EXTERNAL_ID = "SKU-1042"

# PUT lýsir tilboðinu eins og það á að líta út eftir kallið, ekki breytingunum
# einum. Reitur sem þú sleppir er hreinsaður, svo sendu alltaf allt tilboðið.
TILBOD = {
    "name": "Ullarkápa, dökkgrá",
    "description": "Kápa úr íslenskri ull, fóðruð.",
    "offerType": "product",
    # Verð eru heiltölur í krónum. Upphaflegt verð verður að vera raunverulegt
    # fyrra verð, sbr. kröfur Neytendastofu.
    "originalPrice": 49900,
    "discountedPrice": 34900,
    "url": "https://nordurljos.is/vorur/ullarkapa-dokkgra",
    "imageUrls": ["https://cdn.nordurljos.is/vorur/1042/a.jpg"],
    "categoryPathKey": "clothing/women/outerwear",
    "brand": "Norðurljós",
    "storeIds": "all",
    "isDraft": False,
}


def flokka_villu(kodi):
    """Segir hvað á að gera við villu: reyna aftur, laga gögn eða stöðva."""
    if kodi in REYNA_AFTUR:
        return "reyna_aftur"
    if kodi in LAGA_GOGN:
        return "laga_gogn"
    # Auðkenningar- og áskriftarvillur, og kóðar sem þessi útgáfa þekkir ekki.
    return "stodva"


def senda_tilbod():
    slod = "{}/offers/{}".format(BASE_URL, EXTERNAL_ID)
    beidni = urllib.request.Request(
        slod,
        method="PUT",
        data=json.dumps(TILBOD).encode("utf-8"),
        headers={
            "Authorization": "Bearer {}".format(API_KEY),
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(beidni) as svar:
            # Hraðatakmörkunin: lestu hana úr hverju svari og hægðu á þér í tíma.
            eftir = svar.headers.get("X-RateLimit-Remaining")
            if eftir is not None:
                print("Beiðnir eftir á þessari mínútu: {}".format(eftir))

            nidurstada = json.loads(svar.read().decode("utf-8"))
            adgerd = "stofnað" if svar.status == 201 else "uppfært"
            print("Tilboð {}: {} ({})".format(
                adgerd, nidurstada["externalId"], nidurstada["id"]
            ))
            return nidurstada

    except urllib.error.HTTPError as villusvar:
        # Villur eru application/problem+json með stöðugum code reit.
        villa = json.loads(villusvar.read().decode("utf-8"))
        kodi = villa.get("code", "unknown")

        print("Villa {}: {}".format(villusvar.status, kodi), file=sys.stderr)
        print("  {}".format(villa.get("detail") or villa.get("title")), file=sys.stderr)

        # Staðfestingarvillur bera lista yfir reitina sem brugðust.
        for reitur in villa.get("fields", []):
            print("  reitur {}: {} ({})".format(
                reitur["field"], reitur["message"], reitur["code"]
            ), file=sys.stderr)

        vidbrogd = flokka_villu(kodi)
        if vidbrogd == "reyna_aftur":
            bid = villusvar.headers.get("Retry-After", "60")
            print("  Reyndu aftur eftir {} sekúndur.".format(bid), file=sys.stderr)
        elif vidbrogd == "stodva":
            print("  Uppsetningin eða áskriftin er ekki í lagi. Láttu vita.",
                  file=sys.stderr)

        sys.exit(1)


def main():
    if not API_KEY:
        print("Settu MIST_API_KEY fyrst, til dæmis: export MIST_API_KEY=mist_live_...",
              file=sys.stderr)
        sys.exit(1)

    senda_tilbod()


if __name__ == "__main__":
    main()
