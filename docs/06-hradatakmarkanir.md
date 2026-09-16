# Hraðatakmarkanir

Hver API-lykill hefur kvóta á beiðnum. Takmörkunin ver Mist gegn óvæntu álagi
og heldur viðmótinu jafn hröðu fyrir alla.

## Mörkin

**Sjálfgefið 60 beiðnir á mínútu, á hvern lykil.**

Nokkur atriði sem skipta máli:

- Kvótinn er **á lykil, ekki á fyrirtæki**. Tveir lyklar hjá sama fyrirtæki
  hafa sinn kvótann hvor.
- Kvótinn nær yfir **allar beiðnir**, líka `GET /me`, `GET /categories` og
  aðrar sem breyta engu.
- Glugginn er ein mínúta. Í upphafi hverrar mínútu byrjar talningin upp á nýtt.
- Lota telst **ein beiðni**, hversu mörg tilboð sem hún ber. Þetta er
  meginástæðan fyrir því að nota `POST /offers/batch` þegar þú sendir margt.
- **Beiðni sem mistekst telur samt í kvótann.** Fáir þú `422 validation_failed`,
  `404 not_found`, `403 scope_missing` eða aðra `4xx` eða `5xx` villu (nema
  `429`), er hún samt talin með. Aðeins `429` sjálft er undanskilið: það væri
  að refsa þér tvisvar fyrir sömu of-notkunina.

Þarf kerfið þitt meira en 60 beiðnir á mínútu að staðaldri, hafðu samband við
Mist áður en þú byggir kringum það. Lestu núverandi mörk þín úr
`rateLimitPerMinute` í svari `GET /me`.

## Hausar

Svarið ber stöðuna á kvótanum um leið og lykillinn hefur náð auðkenningu, það
er, um leið og `Authorization` hausinn er á gildu formi (`Bearer mist_live_`
og 32 stafir) og leyndarmálið svarar til lykils sem er til í Mist. Það gildir
um öll svör: `200`, hvaða `4xx` sem er (líka `429`) og `500`.

| Haus | Hvað hann segir |
| --- | --- |
| `X-RateLimit-Limit` | Leyfður fjöldi beiðna á mínútu fyrir þennan lykil. |
| `X-RateLimit-Remaining` | Beiðnir sem eftir eru af kvótanum á yfirstandandi mínútu. |

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
```

Tvö tilvik bera enga hausa, af því beiðnin komst aldrei nógu langt til að
Mist viti hvaða lykil er verið að tala um:

- `401 unauthorized`: `Authorization` hausinn vantar eða er á röngu formi.
- `401 api_key_invalid`: leyndarmálið er á réttu formi en svarar ekki til
  neins lykils hjá Mist. Að skila `0` hér myndi ljóstra því upp að lykillinn
  sé raunverulega til, svo Mist þegir alveg í staðinn.

Athugaðu að `api_key_revoked` og `api_key_expired` eru ekki í þessum hópi:
lykillinn er þar til, aðeins ógildur núna, svo hausarnir fylgja með eins og
venjulega. `GET /openapi.json` krefst ekki lykils og ber því aldrei þessa
hausa heldur.

Lestu `X-RateLimit-Remaining` úr hverju svari. Nálgist hann núll skaltu hægja á
þér af sjálfsdáðum í stað þess að keyra á vegginn.

## Þegar kvótinn er fullnýttur

Svarið er `429` með kóðanum `rate_limited` og hausnum `Retry-After`.

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 23
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
```

```json
{
  "type": "https://mist.is/api/v1/errors/rate_limited",
  "title": "Of margar beiðnir",
  "status": 429,
  "code": "rate_limited",
  "detail": "Reyndu aftur eftir 23 sekúndur."
}
```

`Retry-After` er fjöldi sekúndna þar til glugginn opnast aftur. **Bíddu eins
lengi og hausinn segir.** Að reyna aftur fyrr skilar aðeins öðru `429`: sjálft
`429` svarið er undanskilið talningunni, hvorki í þessum glugga né þeim næsta,
svo endurtekin tilraun kostar þig engan kvóta. Hún er samt til einskis og
hlaðir álagi á netið þitt og á Mist að óþörfu, svo bíddu eftir hausnum.

Beiðnin sem fékk `429` komst ekki í gegn: ekkert var stofnað og engu breytt.
Óhætt er að senda hana óbreytta aftur.

## Uppskrift að biðlara

Þrjú lög, hvert þeirra einfalt.

### 1. Virtu `Retry-After`

```js
async function sendaMedBid(url, options, { maxTilraunir = 5 } = {}) {
  for (let tilraun = 0; tilraun < maxTilraunir; tilraun += 1) {
    const svar = await fetch(url, options);

    if (svar.status !== 429) {
      return svar;
    }

    // Traustu hausnum. Sjálfgefið 60 sekúndur ef hann vantar.
    const bid = Number(svar.headers.get('Retry-After')) || 60;
    await sofa(bid * 1000);
  }

  throw new Error('Hraðatakmörkunin gaf ekki eftir eftir margar tilraunir.');
}

function sofa(ms) {
  return new Promise((leysa) => setTimeout(leysa, ms));
}
```

### 2. Vaxandi bið fyrir `500`

`internal_error` ber engan `Retry-After`. Notaðu vaxandi bið með slembiþætti,
svo mörg kerfi sem detta út á sama tíma komi ekki öll aftur í sömu andrá.

```js
// 1s, 2s, 4s, 8s, 16s, hvert með allt að 30% slembiálagi.
function bidSekundur(tilraun) {
  const grunnur = 2 ** tilraun;
  return grunnur * (1 + Math.random() * 0.3);
}
```

Hættu eftir fjórar til fimm tilraunir og skráðu villuna. Viðvarandi `500` er
eitthvað sem Mist þarf að laga, ekki eitthvað sem biðlarinn þinn leysir.

### 3. Haltu þér undir mörkunum

Best er að lenda aldrei í `429`:

- **Sendu í lotum.** 1000 tilboð í lotum af 100 eru 10 beiðnir. Sömu 1000
  tilboð eitt og eitt eru 1000 beiðnir, eða rúmar 16 mínútur af kvótanum.
- **Settu jafnt bil á milli.** Ein beiðni á sekúndu heldur þér við 60 á mínútu
  án þess að þú þurfir nokkurn tíma að hugsa um gluggann.
- **Ein samstilling í einu.** Tvær samhliða skriftur á sama lykli deila
  kvótanum og lenda báðar í `429`.
- **Geymdu tilvísunargögn.** `GET /categories` og `GET /stores` eiga ekki heima
  inni í lykkju sem gengur í gegnum vörulistann. Sjá
  [04-tilvisunargogn.md](04-tilvisunargogn.md).
- **Sendu aðeins það sem hefur breyst.** Sjá
  [07-bestu-venjur.md](07-bestu-venjur.md).

## Dæmi um áætlun

Verslun með 4000 vörur, þar af 600 á afslætti hverju sinni:

| Verk | Beiðnir | Innan kvótans |
| --- | --- | --- |
| Full samstilling: 600 tilboð í lotum af 100 | 6 | Ein mínúta dugir vel. |
| Dagleg breytingasamstilling: um 40 tilboð | 1 | Ein beiðni. |
| Tilvísunargögn einu sinni á sólarhring | 2 | Hverfandi. |

Þetta er dæmigert. Rekstur af þessari stærð snertir aldrei 60 beiðnir á mínútu
nema eitthvað sé í lykkju sem ætti ekki að vera það.

## Sjá einnig

- [05-villur.md](05-villur.md) fyrir aðra villukóða.
- [07-bestu-venjur.md](07-bestu-venjur.md) fyrir samstillingu sem heldur
  beiðnafjöldanum niðri.
