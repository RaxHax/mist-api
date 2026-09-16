# Dæmi

Heil ferð, frá fyrsta lykli að fyrstu lotu. Dæmin nota `curl`, en það sama
gildir um hvaða biðlara sem er. Keyranlegar útgáfur eru í
[`examples/`](../examples).

> **Forútgáfa.** Endapunktarnir svara ekki ennþá. Þú getur byggt og prófað
> vörpunina þína núna, en köllin komast ekki í gegn fyrr en Mist opnar viðmótið
> og afhendir þér lykil.

Fyrirtækið í dæmunum er `Norðurljós ehf.`, fataverslun með tvær verslanir og
vefverslun.

## 1. Fáðu lykil

Eigandi fyrirtækisins stofnar lykilinn í stjórnborðinu, undir stillingum
fyrirtækisins og API. Gefðu honum nafn sem lýsir notkuninni, til dæmis
`Vöruskrá, framleiðsla`, og veldu báðar heimildirnar, `offers:read` og
`offers:write`.

Lykillinn birtist einu sinni. Afritaðu hann strax.

```bash
export MIST_API_KEY="mist_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

Í framleiðslu kemur lykillinn úr leyndarmálageymslu, ekki úr skrá á disknum.
Sjá [02-audkenning.md](02-audkenning.md).

## 2. Staðfestu að lykillinn virki

```bash
curl -s "https://mist.is/api/v1/me" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "organization": {
    "id": "3f1c2a64-8f0e-4b6a-9c31-2d5f8b7a1e90",
    "name": "Norðurljós ehf.",
    "status": "active",
    "isActive": true
  },
  "apiKey": {
    "name": "Vöruskrá, framleiðsla",
    "hint": "a1b2c3d4",
    "scopes": ["offers:read", "offers:write"],
    "rateLimitPerMinute": 60,
    "createdAt": "2026-10-01T09:14:00Z",
    "lastUsedAt": null,
    "expiresAt": null
  }
}
```

Athugaðu þrennt: að fyrirtækið sé það rétta, að `isActive` sé `true`, og að
heimildirnar séu þær sem þú þarft.

## 3. Sæktu tilvísunargögnin

Þú þarft að vita hvaða flokka og verslanir þú mátt vísa í.

```bash
curl -s "https://mist.is/api/v1/categories" \
  -H "Authorization: Bearer $MIST_API_KEY" > flokkar.json

curl -s "https://mist.is/api/v1/stores" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "data": [
    {
      "id": "5a8e3b21-77cc-4f10-9b2d-1e6f0a4c8d33",
      "name": "Norðurljós, Kringlan",
      "address": "Kringlan 4, 103 Reykjavík",
      "city": "Reykjavík"
    },
    {
      "id": "c07f9a13-42b8-4de6-8f51-b3a9d6e2074c",
      "name": "Norðurljós, Akureyri",
      "address": "Hafnarstræti 91, 600 Akureyri",
      "city": "Akureyri"
    }
  ]
}
```

Byggðu vörpunina þína úr flokkunum áður en þú sendir nokkuð. Sjá
[04-tilvisunargogn.md](04-tilvisunargogn.md).

## 4. Sendu fyrsta tilboðið, sem drög

Byrjaðu á einu tilboði með `isDraft: true`. Þá sérðu hvernig það kemur út án
þess að nokkur neytandi sjái það.

```bash
curl -s -X PUT "https://mist.is/api/v1/offers/SKU-1042" \
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
    "isDraft": true
  }'
```

Svarið er `201`, því tilboðið var stofnað:

```json
{
  "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
  "externalId": "SKU-1042",
  "name": "Ullarkápa, dökkgrá",
  "offerType": "product",
  "originalPrice": 49900,
  "discountedPrice": 34900,
  "categoryPathKey": "clothing/women/outerwear",
  "brand": "Norðurljós",
  "storeIds": [
    "5a8e3b21-77cc-4f10-9b2d-1e6f0a4c8d33",
    "c07f9a13-42b8-4de6-8f51-b3a9d6e2074c"
  ],
  "isDraft": true,
  "isDisabled": false,
  "source": "api",
  "createdAt": "2026-10-01T10:00:00Z",
  "updatedAt": "2026-10-01T10:00:00Z"
}
```

Taktu eftir að `"all"` var leyst upp í bæði verslanaauðkennin, og að vörumerkið
`Norðurljós` var stofnað sjálfkrafa. Farðu nú í stjórnborðið og skoðaðu
tilboðið: flokkinn, myndina og verðin.

## 5. Birtu tilboðið

Sama kall, með `isDraft: false`. Svarið er `200` í þetta sinn, því tilboðið var
uppfært en ekki stofnað.

```bash
curl -s -X PUT "https://mist.is/api/v1/offers/SKU-1042" \
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
```

Mundu að `PUT` lýsir tilboðinu eins og það á að líta út eftir kallið. Hefðum
við sent aðeins `{"isDraft": false}` hefðu hinir reitirnir verið hreinsaðir.

## 6. Sendu lotu

Þegar eitt tilboð virkar, sendu afganginn í lotum af 100.

```bash
curl -s -X POST "https://mist.is/api/v1/offers/batch" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "offers": [
      {
        "externalId": "SKU-1043",
        "name": "Ullarhúfa",
        "originalPrice": 6900,
        "discountedPrice": 4900,
        "url": "https://nordurljos.is/vorur/ullarhufa",
        "imageUrls": ["https://cdn.nordurljos.is/vorur/1043/a.jpg"],
        "categoryPathKey": "clothing/unisex/accessories",
        "brand": "Norðurljós",
        "storeIds": "all"
      },
      {
        "externalId": "SKU-1044",
        "name": "Herraskór, brúnir",
        "originalPrice": 32900,
        "discountedPrice": 39900,
        "url": "https://nordurljos.is/vorur/herraskor-brunir",
        "categoryPathKey": "clothing/men/footwear",
        "brand": "Norðurljós",
        "storeIds": ["5a8e3b21-77cc-4f10-9b2d-1e6f0a4c8d33"]
      }
    ]
  }'
```

Seinni færslan er viljandi röng: afsláttarverðið er hærra en upphaflega verðið.

```json
{
  "summary": { "total": 2, "created": 1, "updated": 0, "failed": 1 },
  "results": [
    {
      "externalId": "SKU-1043",
      "status": "created",
      "offerId": "b2e7f019-5c3d-4a1e-9f82-0d6c4b8a3e57"
    },
    {
      "externalId": "SKU-1044",
      "status": "failed",
      "offerId": null,
      "error": {
        "type": "https://mist.is/api/v1/errors/validation_failed",
        "title": "Beiðnin stóðst ekki staðfestingu",
        "status": 422,
        "code": "validation_failed",
        "detail": "Afsláttarverð verður að vera lægra en upphaflegt verð.",
        "fields": [
          {
            "field": "offers.1.discountedPrice",
            "code": "must_be_lower_than_original",
            "message": "Afsláttarverð verður að vera lægra en upphaflegt verð."
          }
        ]
      }
    }
  ]
}
```

Svarið er `200` þótt önnur færslan hafi fallið. **Lestu alltaf `summary.failed`
og farðu í gegnum `results`.** Lagaðu færsluna og sendu hana aftur: gagnvirknin
sér til þess að `SKU-1043` verði ekki tvítekið.

## 7. Farðu yfir stöðuna

```bash
curl -s "https://mist.is/api/v1/offers?limit=50" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "data": [
    {
      "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
      "externalId": "SKU-1042",
      "name": "Ullarkápa, dökkgrá",
      "originalPrice": 49900,
      "discountedPrice": 34900,
      "isDraft": false,
      "isDisabled": false,
      "source": "api",
      "updatedAt": "2026-10-01T10:05:00Z"
    },
    {
      "id": "b2e7f019-5c3d-4a1e-9f82-0d6c4b8a3e57",
      "externalId": "SKU-1043",
      "name": "Ullarhúfa",
      "originalPrice": 6900,
      "discountedPrice": 4900,
      "isDraft": false,
      "isDisabled": false,
      "source": "api",
      "updatedAt": "2026-10-01T10:07:00Z"
    }
  ],
  "nextCursor": null
}
```

`nextCursor` er `null`, svo þetta var eina síðan. Væri hann strengur myndirðu
senda hann aftur sem `?cursor=` þar til hann yrði `null`.

## 8. Afvirkjaðu það sem seldist upp

Ullarkápan er uppseld. Afvirkjaðu tilboðið.

```bash
curl -s -X DELETE "https://mist.is/api/v1/offers/SKU-1042" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
  "externalId": "SKU-1042",
  "name": "Ullarkápa, dökkgrá",
  "isDraft": false,
  "isDisabled": true,
  "source": "api",
  "updatedAt": "2026-10-05T07:12:00Z"
}
```

Tilboðið hverfur af neytendavefnum. Því var ekki eytt: kemur kápan aftur á
lager vekur `PUT` á `SKU-1042` tilboðið aftur, með verðsöguna óskerta.

## 9. Settu þetta í rekstur

Nú er ferðin á enda og eftir stendur að gera hana sjálfvirka.

1. Skrifaðu vörpun úr vöruskránni þinni í `OfferInput`.
2. Keyrðu breytingasamstillingu á klukkustundar fresti og fulla samstillingu
   vikulega. Sjá [07-bestu-venjur.md](07-bestu-venjur.md).
3. Meðhöndlaðu `429` með `Retry-After` og stöðvaðu á `organization_inactive`.
   Sjá [05-villur.md](05-villur.md).
4. Vaktaðu `summary.failed` úr lotunum þínum og láttu einhvern vita þegar
   talan er ekki núll.

## Keyranleg dæmi

| Skrá | Hvað hún gerir |
| --- | --- |
| [`examples/curl/me.sh`](../examples/curl/me.sh) | Staðfestir lykilinn. |
| [`examples/curl/upsert-offer.sh`](../examples/curl/upsert-offer.sh) | Stofnar eða uppfærir eitt tilboð. |
| [`examples/curl/batch-offers.sh`](../examples/curl/batch-offers.sh) | Sendir lotu. |
| [`examples/curl/disable-offer.sh`](../examples/curl/disable-offer.sh) | Afvirkjar tilboð. |
| [`examples/curl/list-offers.sh`](../examples/curl/list-offers.sh) | Blaðar í gegnum öll tilboð. |
| [`examples/curl/reference-data.sh`](../examples/curl/reference-data.sh) | Sækir vörumerki, verslanir og flokka. |
| [`examples/node/upsert.mjs`](../examples/node/upsert.mjs) | Eitt tilboð, með villumeðhöndlun. |
| [`examples/node/batch.mjs`](../examples/node/batch.mjs) | Lotur með bið á `429`. |
| [`examples/python/upsert.py`](../examples/python/upsert.py) | Eitt tilboð, aðeins staðalsafnið. |

Öll dæmin lesa lykilinn úr `MIST_API_KEY`.
