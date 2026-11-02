# Tilboð

Þessir endapunktar eru kjarni viðmótsins. Þeir stofna tilboð, uppfæra þau,
sækja þau og afvirkja.

> **Forútgáfa.** Dæmin hér sýna viðmótið eins og það verður gefið út.
> Endapunktarnir svara ekki ennþá.

Allar slóðir eru afstæðar við grunnslóðina `https://mist.is/api/v1`.

## Reitir tilboðs

Þetta eru reitir `OfferInput`, efnisins sem þú sendir.

| Reitur | Tegund | Skylda | Reglur |
| --- | --- | --- | --- |
| `name` | strengur | Já | 1 til 200 stafir. Heitið eins og það birtist neytendum. |
| `description` | strengur | Nei | Að hámarki 2000 stafir. |
| `offerType` | `product` eða `restaurant` | Nei | Sjálfgefið `product`. |
| `originalPrice` | heiltala | Já fyrir vörur | Heilar krónur, stærri en 0. Verður að vera raunverulegt fyrra verð. |
| `discountedPrice` | heiltala | Já fyrir vörur | Heilar krónur, lægra en `originalPrice`. |
| `url` | strengur | Nei, en eindregið mælt með | Slóð á vörusíðu fyrirtækisins. Mist vísar neytendum þangað með UTM merkingum. |
| `imageUrls` | listi strengja | Nei | Að hámarki 6 slóðir, allar yfir `https`. |
| `categoryPathKey` | strengur | Nei, en eindregið mælt með | Slóðarlykill laufflokks, til dæmis `clothing/men/footwear`. |
| `brand` | strengur | Já | Heiti vörumerkis. Mist stofnar það innan fyrirtækisins ef það er ekki til. |
| `storeIds` | listi strengja eða `"all"` | Já | Auðkenni verslana úr `GET /stores`, eða `"all"` fyrir allar verslanir. |
| `startAt` | strengur | Nei | ISO 8601 tímastimpill. Tilboðið birtist ekki fyrr. |
| `endAt` | strengur | Nei | ISO 8601 tímastimpill. Tilboðið hverfur eftir þennan tíma. |
| `isDraft` | gildisreitur | Nei | Sjálfgefið `false`. Drög birtast ekki neytendum. |
| `dealType` | `percent_off`, `fixed_price` eða `custom` | Já fyrir veitingar | Aðeins með `offerType: restaurant`. |
| `dealValue` | strengur | Já fyrir veitingar | Aðeins með `offerType: restaurant`. Að hámarki 120 stafir. |

`PUT` lýsir tilboðinu eins og það á að líta út eftir kallið, ekki breytingunum
einum: valkvæður reitur sem þú sleppir er **hreinsaður**. Sendu alltaf allt
tilboðið.

Í svari ber `imageUrls` **aðeins þær myndaslóðir sem þú sjálfur sendir gegnum
þetta viðmót**. Mynd sem einhver hleður upp beint í stjórnborði Mist kemur
ekki fram hér, jafnvel þótt tilboðið eigi mynd þar í reynd: þá skilar
`imageUrls` tómum lista (`[]`), ekki slóð á þá mynd.

Tilboð verður alltaf að bera vörumerki (`brand`) og segja til um hvaða
verslanir það á við (`storeIds`, eða `"all"` fyrir allar). `url` og
`categoryPathKey` eru ekki skylda, en tilboð án slóðar fær enga tilvísun og
tilboð án flokks finnst illa á neytendavefnum. Sendu þau bæði.

### Vörur og veitingar

**Vörutilboð** (`offerType: product`) byggja á verði. Bæði `originalPrice` og
`discountedPrice` eru skylda og afsláttarverðið verður að vera lægra. Mist
reiknar afsláttarhlutfallið sjálft.

**Veitingatilboð** (`offerType: restaurant`) lýsa tilboðinu í orðum í stað þess
að bera saman tvö verð, því hádegisseðill á fast verð á sér sjaldnast fyrra
verð:

| `dealType` | Hvað `dealValue` ber | Dæmi |
| --- | --- | --- |
| `percent_off` | Hlutfall | `"20%"` |
| `fixed_price` | Verð í krónum, með eða án krónutákns | `"2.990 kr."` |
| `custom` | Frjáls texti | `"Tveir fyrir einn eftir kl. 21"` |

Veitingatilboð nota flokka undir `restaurant/`, til dæmis
`restaurant/meal/lunch`. Sjá [04-tilvisunargogn.md](04-tilvisunargogn.md).

### Upphaflegt verð

`originalPrice` verður að vera verð sem varan var raunverulega seld á. Þetta er
ekki stílkrafa heldur lagaskylda: Neytendastofa hefur eftirlit með því að
auglýstur afsláttur endurspegli raunverulegt fyrra verð.

Mist skráir verðsögu við hverja breytingu á `originalPrice` eða
`discountedPrice`. Sjá [07-bestu-venjur.md](07-bestu-venjur.md).

## `PUT /offers/{externalId}`

Stofnar tilboð eða uppfærir það sem fyrir er. Krefst heimildarinnar
`offers:write`.

`externalId` er þitt eigið stöðuga auðkenni vörunnar, til dæmis vörunúmer úr
vöruskránni þinni. Mist lyklar tilboðið á það, svo sama kall má endurtaka
hættulaust: fyrsta kallið stofnar, næstu uppfæra.

### Beiðni

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
    "endAt": "2026-11-30T23:59:59Z"
  }'
```

### Svar

`201` þegar tilboðið var stofnað, `200` þegar því var breytt.

```json
{
  "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
  "externalId": "SKU-1042",
  "name": "Ullarkápa, dökkgrá",
  "description": "Kápa úr íslenskri ull, fóðruð.",
  "offerType": "product",
  "originalPrice": 49900,
  "discountedPrice": 34900,
  "url": "https://nordurljos.is/vorur/ullarkapa-dokkgra",
  "imageUrls": ["https://cdn.nordurljos.is/vorur/1042/a.jpg"],
  "categoryPathKey": "clothing/women/outerwear",
  "brand": "Norðurljós",
  "storeIds": ["5a8e3b21-77cc-4f10-9b2d-1e6f0a4c8d33"],
  "startAt": null,
  "endAt": "2026-11-30T23:59:59Z",
  "isDraft": false,
  "isDisabled": false,
  "dealType": null,
  "dealValue": null,
  "source": "api",
  "createdAt": "2026-10-01T10:00:00Z",
  "updatedAt": "2026-10-04T08:30:00Z"
}
```

Veitingatilboð lítur eins út nema `offerType` er `restaurant`, verðreitirnir
eru `null` og `dealType` og `dealValue` bera tilboðið:

```bash
curl -s -X PUT "https://mist.is/api/v1/offers/HADEGI-2" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hádegisseðill, tveir réttir",
    "offerType": "restaurant",
    "dealType": "fixed_price",
    "dealValue": "2.990 kr.",
    "url": "https://sjavarbarinn.is/hadegi",
    "categoryPathKey": "restaurant/meal/lunch",
    "brand": "Sjávarbarinn",
    "storeIds": "all"
  }'
```

### Villur

| Staða | Kóði | Hvenær |
| --- | --- | --- |
| `401` | `unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired` | Lykillinn gengur ekki upp. |
| `403` | `scope_missing` | Lykilinn vantar `offers:write`. |
| `403` | `organization_inactive` | Fyrirtækið er ekki virkt. |
| `413` | `validation_failed` | Beiðnihlutinn er stærri en 1 MB. |
| `422` | `validation_failed` | Reitur stenst ekki reglu. `fields` segir hverjir. |
| `429` | `rate_limited` | Hraðatakmörkunin er fullnýtt. |
| `500` | `internal_error` | Óvænt villa hjá Mist. |

## `POST /offers/batch`

Sendir allt að **100 tilboð** í einni beiðni. Krefst heimildarinnar
`offers:write`.

Hver færsla er meðhöndluð sjálfstætt og fær sína eigin niðurstöðu. Ein ógild
færsla fellir ekki hinar, og svarið er `200` þótt einhverjar mistakist. Þú
verður að lesa `results` til að vita hvað gekk eftir.

Í lotu er `externalId` skyldureitur inni í hverri færslu, því slóðin ber
ekkert auðkenni.

### Beiðni

```bash
curl -s -X POST "https://mist.is/api/v1/offers/batch" \
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
```

### Svar

```json
{
  "summary": { "total": 2, "created": 1, "updated": 0, "failed": 1 },
  "results": [
    {
      "externalId": "SKU-1042",
      "status": "created",
      "offerId": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11"
    },
    {
      "externalId": "SKU-1043",
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

`status` hverrar færslu er `created`, `updated` eða `failed`. Færslurnar koma
í sömu röð og þær voru sendar.

### Villur

| Staða | Kóði | Hvenær |
| --- | --- | --- |
| `401` | `unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired` | Lykillinn gengur ekki upp. |
| `403` | `scope_missing` | Lykilinn vantar `offers:write`. |
| `403` | `organization_inactive` | Fyrirtækið er ekki virkt. |
| `413` | `batch_too_large` | Fleiri en 100 færslur í lotunni. |
| `422` | `validation_failed` | Lotan sjálf er ógild, til dæmis `offers` vantar. Villur í einstökum færslum koma hins vegar í `results`. |
| `429` | `rate_limited` | Hraðatakmörkunin er fullnýtt. |
| `500` | `internal_error` | Óvænt villa hjá Mist. |

## `DELETE /offers/{externalId}`

Afvirkjar tilboð. Krefst heimildarinnar `offers:write`.

Þessi aðgerð **eyðir engu**. Tilboðið hverfur af neytendavefnum en verðsagan og
tölfræðin haldast, og `PUT` á sama `externalId` vekur það aftur. Það er rétta
leiðin þegar vara selst upp eða tilboð rennur sitt skeið.

Tilboði sem er eytt í stjórnborði Mist er svarað með `404` og kóðanum
`not_found`, og það kemur ekki fram í `GET /offers`, þar til næsta `PUT` á sama
`externalId` vekur það aftur, með verðsögunni og vistunum.

### Beiðni

```bash
curl -s -X DELETE "https://mist.is/api/v1/offers/SKU-1042" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

### Svar

`200` með tilboðinu eins og það stendur eftir aðgerðina:

```json
{
  "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
  "externalId": "SKU-1042",
  "name": "Ullarkápa, dökkgrá",
  "offerType": "product",
  "isDraft": false,
  "isDisabled": true,
  "source": "api",
  "updatedAt": "2026-10-05T07:12:00Z"
}
```

Að afvirkja tilboð sem er þegar afvirkt breytir engu og skilar sama `200`.

### Villur

| Staða | Kóði | Hvenær |
| --- | --- | --- |
| `401` | `unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired` | Lykillinn gengur ekki upp. |
| `403` | `scope_missing` | Lykilinn vantar `offers:write`. |
| `403` | `organization_inactive` | Fyrirtækið er ekki virkt. |
| `404` | `not_found` | Ekkert tilboð með þessu `externalId` hjá fyrirtækinu, eða því var eytt í stjórnborðinu. |
| `429` | `rate_limited` | Hraðatakmörkunin er fullnýtt. |
| `500` | `internal_error` | Óvænt villa hjá Mist. |

## `GET /offers`

Sækir tilboð fyrirtækisins í síðum. Krefst heimildarinnar `offers:read`.

Listinn ber **aðeins tilboð sem urðu til gegnum þetta viðmót**, það er tilboð
með `externalId`. Tilboð sem er stofnað beint í stjórnborði Mist kemur ekki
fram hér, því það ber ekkert `externalId` og þetta viðmót hefur enga leið til
að vísa í það.

| Færibreyta | Tegund | Sjálfgefið | Reglur |
| --- | --- | --- | --- |
| `cursor` | strengur | Ekkert | `nextCursor` úr fyrra svari. Sleppt í fyrstu beiðni. |
| `limit` | heiltala | `50` | Frá 1 til 100. |

### Beiðni

```bash
curl -s "https://mist.is/api/v1/offers?limit=50" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

### Svar

```json
{
  "data": [
    {
      "id": "9c4b1d70-1f2a-4d55-8b0c-6a3e9f2d4c11",
      "externalId": "SKU-1042",
      "name": "Ullarkápa, dökkgrá",
      "offerType": "product",
      "originalPrice": 49900,
      "discountedPrice": 34900,
      "categoryPathKey": "clothing/women/outerwear",
      "brand": "Norðurljós",
      "isDraft": false,
      "isDisabled": false,
      "source": "api",
      "updatedAt": "2026-10-04T08:30:00Z"
    }
  ],
  "nextCursor": "eyJvIjoiMjAyNi0xMC0wNCJ9"
}
```

Sæktu næstu síðu með bendlinum úr `nextCursor` og haltu áfram þar til hann
kemur til baka sem `null`:

```bash
curl -s "https://mist.is/api/v1/offers?limit=50&cursor=eyJvIjoiMjAyNi0xMC0wNCJ9" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

Listinn ber bæði virk tilboð og afvirk. Síaðu á `isDisabled` þegar þú vilt
aðeins það sem er í birtingu.

### Villur

| Staða | Kóði | Hvenær |
| --- | --- | --- |
| `401` | `unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired` | Lykillinn gengur ekki upp. |
| `403` | `scope_missing` | Lykilinn vantar `offers:read`. |
| `403` | `organization_inactive` | Fyrirtækið er ekki virkt. |
| `422` | `validation_failed` | `limit` utan marka eða `cursor` ógildur. |
| `429` | `rate_limited` | Hraðatakmörkunin er fullnýtt. |
| `500` | `internal_error` | Óvænt villa hjá Mist. |

## Sjá einnig

- [04-tilvisunargogn.md](04-tilvisunargogn.md) fyrir vörumerki, verslanir og
  flokka.
- [05-villur.md](05-villur.md) fyrir form villusvara.
- [07-bestu-venjur.md](07-bestu-venjur.md) fyrir samstillingu, myndir og verð.
