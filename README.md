# Mist merchant API

**Staða: v1 forútgáfa.** Ekki komið í loftið.

Skjölun fyrir viðmótið sem samþykkt fyrirtæki nota til að senda tilboð sín inn
í Mist beint úr eigin kerfi.

Mist (Torgið) er íslenskur markaður sem safnar saman aðeins því sem er á
afslætti: vörum úr verslunum og tilboðum veitingastaða. Neytendur skoða úrvalið
á einum stað og er vísað á vefsíðu fyrirtækisins þegar þeir smella. Mist
afgreiðir aldrei sölu, greiðslur né birgðir.

## Hvað forútgáfa þýðir

Þetta safn lýsir v1 viðmótinu eins og það verður gefið út. Lýsingin er bindandi
samningur: reitaheiti, villukóðar og hegðun breytast ekki án þess að það komi
fram í [CHANGELOG.md](CHANGELOG.md).

Það sem er virkt í dag er stjórnborð Mist og fyrirtækjaaðgangar. API
endapunktarnir koma næst. Þangað til:

- **Köllin hér svara ekki.** Ekki setja vaktaða samstillingu í rekstur fyrr en
  Mist hefur staðfest að viðmótið sé komið í loftið.
- **Lyklar eru gefnir út af Mist** til samþykktra fyrirtækja gegnum
  stjórnborðið. Þeir eru ekki sjálfsafgreiðsla.
- **Nákvæm grunnslóð er staðfest með lyklinum.** Skjölunin notar
  `https://mist.is/api/v1`. Geymdu slóðina sem stillingu, ekki fast í kóðanum.

Þú getur samt undirbúið þig núna: lestu samninginn, byggðu vörpunina úr þínum
gögnum og prófaðu hana gegn OpenAPI lýsingunni.

## Fimm mínútna byrjun

Fjögur skref frá lykli að tilboði í birtingu.

**1. Geymdu lykilinn.** Eigandi fyrirtækisins stofnar hann í stjórnborðinu,
undir stillingum og API. Hann birtist aðeins einu sinni.

```bash
export MIST_API_KEY="mist_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**2. Staðfestu að hann virki.**

```bash
curl -s "https://mist.is/api/v1/me" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

Athugaðu að fyrirtækið sé rétt og að `isActive` sé `true`.

**3. Finndu flokkinn.** Tilboð verður að vísa í laufflokk.

```bash
curl -s "https://mist.is/api/v1/categories" \
  -H "Authorization: Bearer $MIST_API_KEY" > flokkar.json
```

**4. Sendu fyrsta tilboðið.** `externalId` í slóðinni er þitt eigið vörunúmer.
Kallið er endurtakanlegt: fyrsta skiptið stofnar, næstu uppfæra.

```bash
curl -s -X PUT "https://mist.is/api/v1/offers/SKU-1042" \
  -H "Authorization: Bearer $MIST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ullarkápa, dökkgrá",
    "originalPrice": 49900,
    "discountedPrice": 34900,
    "url": "https://nordurljos.is/vorur/ullarkapa-dokkgra",
    "imageUrls": ["https://cdn.nordurljos.is/vorur/1042/a.jpg"],
    "categoryPathKey": "clothing/women/outerwear",
    "brand": "Norðurljós",
    "storeIds": "all"
  }'
```

Það er allt og sumt. Heil ferð með lotum og afvirkjun er í
[08-daemi.md](docs/08-daemi.md).

## Það sem skiptir mestu máli

- **`originalPrice` verður að vera raunverulegt fyrra verð.** Neytendastofa
  hefur eftirlit með því, og Mist skráir verðsögu við hverja breytingu.
- **`externalId` er þitt eigið stöðuga vörunúmer.** Það gerir `PUT` endurtakanlegt,
  svo óhætt er að keyra sömu samstillingu aftur.
- **`DELETE` afvirkjar, eyðir ekki.** Rétta leiðin þegar vara selst upp.
- **Sendu í lotum.** Lota telst ein beiðni gagnvart hraðatakmörkuninni.
- **Greindu á `code`, ekki á texta villunnar.** Kóðarnir eru stöðugir, textinn
  ekki.

## Efnisyfirlit

| Skjal | Um hvað |
| --- | --- |
| [01-yfirlit.md](docs/01-yfirlit.md) | Hugtök, grunnslóð, útgáfustýring, endapunktar í stuttu máli. |
| [02-audkenning.md](docs/02-audkenning.md) | API-lyklar, geymsla, heimildir, endurnýjun, afturköllun. |
| [03-tilbod.md](docs/03-tilbod.md) | Endapunktar tilboða, reitatafla, vörur og veitingar. |
| [04-tilvisunargogn.md](docs/04-tilvisunargogn.md) | Vörumerki, verslanir, flokkar og flokkavörpun. |
| [05-villur.md](docs/05-villur.md) | Form villusvara, allir villukóðar, viðbrögð. |
| [06-hradatakmarkanir.md](docs/06-hradatakmarkanir.md) | Kvótar, hausar, uppskrift að bið. |
| [07-bestu-venjur.md](docs/07-bestu-venjur.md) | Gagnvirkni, samstilling, myndir, verð, drög, tími. |
| [08-daemi.md](docs/08-daemi.md) | Heil ferð frá fyrsta lykli að fyrstu lotu. |

Vélræn lýsing: [`openapi/mist-api.v1.yaml`](openapi/mist-api.v1.yaml)
(OpenAPI 3.1). Hún verður líka aðgengileg á `GET /openapi.json` þegar viðmótið
opnar.

Keyranleg dæmi: [`examples/`](examples). Öll lesa lykilinn úr `MIST_API_KEY`.

| Mappa | Hvað er þar |
| --- | --- |
| [`examples/curl`](examples/curl) | Ein skrifta á aðgerð. |
| [`examples/node`](examples/node) | Innsending og lotur með villumeðhöndlun, engin aðföng. |
| [`examples/python`](examples/python) | Innsending með staðalsafninu einu, engin aðföng. |

## Endapunktar

| Aðferð | Slóð | Heimild |
| --- | --- | --- |
| `GET` | `/me` | `offers:read` eða `offers:write` |
| `GET` | `/offers` | `offers:read` |
| `PUT` | `/offers/{externalId}` | `offers:write` |
| `DELETE` | `/offers/{externalId}` | `offers:write` |
| `POST` | `/offers/batch` | `offers:write` |
| `GET` | `/brands` | `offers:read` eða `offers:write` |
| `GET` | `/stores` | `offers:read` eða `offers:write` |
| `GET` | `/categories` | `offers:read` eða `offers:write` |
| `GET` | `/openapi.json` | Engin |

## Að vinna í þessu safni

```bash
npm install
npm run lint
```

`npm run lint` keyrir þrennt: markdownlint á skjölin, stílathugun sem bannar
þankastrik, og Redocly á OpenAPI lýsinguna. Sjá
[CONTRIBUTING.md](CONTRIBUTING.md).

## Aðstoð

- Villa eða óskýrt orðalag í skjölunum: opnaðu issue í þessu safni.
- Spurningar um aðgang, lykla eða áskrift: hafðu samband gegnum stjórnborðið
  eða á `api@mist.is`.
- Öryggisveilur og lykla sem hafa lekið: [SECURITY.md](SECURITY.md). Ekki opna
  issue.

Tengiliður er `api@mist.is` þar til annað er auglýst.

## Leyfi

[MIT](LICENSE).
