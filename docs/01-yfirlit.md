# Yfirlit

Mist merchant API gerir samþykktu fyrirtæki kleift að senda tilboð sín inn í
Mist beint úr eigin kerfi: vefverslun, vöruskrá eða skriftu sem keyrir á
nóttunni. Þú heldur vörugögnunum þínum þar sem þau eiga heima og lætur Mist
vita þegar eitthvað fer á afslátt.

## Staða: v1 forútgáfa

Þetta skjalasafn lýsir v1 viðmótinu eins og það verður gefið út. Lýsingin er
bindandi samningur: reitaheiti, villukóðar og hegðun breytast ekki án þess að
það komi fram í [CHANGELOG.md](../CHANGELOG.md).

Það sem er virkt í dag er stjórnborðið og fyrirtækjaaðgangar. API
endapunktarnir koma næst. Þangað til gildir þetta:

- Engin köll ná í gegn ennþá. Ekki byggja vaktaða samstillingu á þessu viðmóti
  fyrr en Mist hefur staðfest að það sé komið í loftið.
- Mist gefur út API-lykla til samþykktra fyrirtækja gegnum stjórnborðið.
  Lyklar eru ekki sjálfsafgreiðsla.
- Nákvæm grunnslóð er staðfest með lyklinum þegar hann er afhentur.

Þú getur samt undirbúið þig núna: lestu samninginn, smíðaðu vörpunina úr þínum
gögnum yfir í `OfferInput` og prófaðu hana gegn
[OpenAPI lýsingunni](../openapi/mist-api.v1.yaml).

## Hvað Mist er

Mist (Torgið) er íslenskur markaður sem safnar saman aðeins því sem er á
afslætti: vörum úr verslunum og tilboðum veitingastaða. Neytendur skoða úrvalið
á neytendavefnum, og þegar þeir smella á tilboð er þeim vísað á vefsíðu
fyrirtækisins með UTM merkingum. Mist afgreiðir aldrei sölu, greiðslur né
birgðir. Mist er uppgötvun og tilvísun, ekki verslun.

Fyrirtæki greiða áskrift fyrir aðganginn, tilboðin og mælaborðið. Tilvísanir
eru innifaldar.

## Hugtök

Þessi orð eru notuð eins alls staðar í skjölunum.

| Hugtak | Á ensku í kóða | Hvað það er |
| --- | --- | --- |
| Fyrirtæki | `organization` | Áskrifandinn hjá Mist. Öll gögn tilheyra einu fyrirtæki og fara aldrei á milli fyrirtækja. |
| API-lykill | `apiKey` | Leyndarmálið sem auðkennir kerfið þitt. Tilheyrir einu fyrirtæki og ber heimildir. |
| Heimild | `scope` | Hvað lykillinn má gera: `offers:read` eða `offers:write`. |
| Tilboð | `offer` | Ein vara eða einn veitingaréttur á afslætti. |
| Vörumerki | `brand` | Merkið sem tilboðið tilheyrir. Vísað til með nafni. |
| Verslun | `store` | Ein staðsetning fyrirtækisins. Fyrirtæki getur átt margar verslanir. |
| Flokkur | `category` | Hnútur í flokkatré Mist. Tilboð vísa í laufflokk með slóðarlykli. |
| Upphaflegt verð | `originalPrice` | Fyrra verð vörunnar, í heilum krónum. |
| Afsláttarverð | `discountedPrice` | Verðið sem er í boði núna, í heilum krónum. |
| Ytra auðkenni | `externalId` | Þitt eigið stöðuga vörunúmer. Mist lyklar tilboðið á það. |
| Lota | `batch` | Margar tilboðsfærslur sendar í einni beiðni, að hámarki 100. |
| Bendill | `cursor` | Merki sem sækir næstu síðu í listaköllum. |
| Hraðatakmörkun | `rate limit` | Hámarksfjöldi beiðna á mínútu fyrir lykilinn. |

Athugaðu greinarmuninn á **fyrirtæki** og **verslun**. Fyrirtækið er
áskrifandinn, verslunin er staðsetning. Tilboð tilheyrir alltaf fyrirtæki og á
við eina eða fleiri verslanir þess.

## Grunnslóð

```text
https://mist.is/api/v1
```

Þetta er skjalfest grunnslóð fyrir v1. Nákvæm grunnslóð er staðfest með
lyklinum þegar hann er gefinn út, svo geymdu hana sem stillingu í kerfinu þínu
frekar en fast í kóðanum.

Allar slóðir í þessum skjölum eru afstæðar við grunnslóðina. Þegar skrifað er
`GET /offers` er átt við `GET https://mist.is/api/v1/offers`.

## Form beiðna og svara

- Aðeins JSON. Sendu `Content-Type: application/json` með beiðnum sem bera efni.
- Kóðun er UTF-8. Íslenskir stafir þurfa enga sérmeðferð.
- Hámarksstærð beiðnihluta (body) er 1 MB.
- Tímastimplar eru ISO 8601 með tímabelti, til dæmis `2026-11-30T23:59:59Z`.
- Verð eru heiltölur í íslenskum krónum, án aukastafa og án gjaldmiðilstákns.
- Villur eru `application/problem+json`. Sjá [05-villur.md](05-villur.md).

## Endapunktar í stuttu máli

| Aðferð | Slóð | Heimild | Hvað hún gerir |
| --- | --- | --- | --- |
| `GET` | `/me` | `offers:read` eða `offers:write` | Staðfestir lykil og skilar fyrirtækinu. |
| `GET` | `/offers` | `offers:read` | Sækir tilboð fyrirtækisins í síðum. |
| `PUT` | `/offers/{externalId}` | `offers:write` | Stofnar eða uppfærir tilboð. |
| `DELETE` | `/offers/{externalId}` | `offers:write` | Afvirkjar tilboð. |
| `POST` | `/offers/batch` | `offers:write` | Stofnar eða uppfærir allt að 100 tilboð. |
| `GET` | `/brands` | `offers:read` eða `offers:write` | Sækir vörumerki fyrirtækisins. |
| `GET` | `/stores` | `offers:read` eða `offers:write` | Sækir verslanir fyrirtækisins. |
| `GET` | `/categories` | `offers:read` eða `offers:write` | Sækir flokkatréð. |
| `GET` | `/openapi.json` | Engin | Sækir vélræna lýsingu viðmótsins. |

Nánar í [03-tilbod.md](03-tilbod.md) og
[04-tilvisunargogn.md](04-tilvisunargogn.md).

## Útgáfustýring

Útgáfan er hluti af slóðinni: `/api/v1`. Innan v1 gildir þetta:

- **Afturvirkar breytingar** eru leyfðar og geta komið hvenær sem er: nýir
  reitir í svörum, ný valkvæð gildi, nýir endapunktar, nýir villukóðar á nýjum
  aðstæðum. Biðlarinn þinn á að hunsa reiti sem hann þekkir ekki.
- **Rofnandi breytingar** fá nýja útgáfu í slóðinni. Núverandi reitir hverfa
  ekki og skipta ekki um merkingu innan v1.
- Villukóðarnir í [05-villur.md](05-villur.md) eru stöðugir. Greindu á `code`,
  aldrei á texta villunnar.

Allar breytingar eru skráðar í [CHANGELOG.md](../CHANGELOG.md).

## Næstu skref

1. [Auðkenning](02-audkenning.md): fáðu lykil og geymdu hann rétt.
2. [Tilboð](03-tilbod.md): endapunktarnir og reitirnir.
3. [Dæmi](08-daemi.md): heil ferð frá fyrsta lykli að fyrstu lotu.
