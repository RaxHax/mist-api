# Að leggja til breytingar

Takk fyrir að vilja bæta þessa skjölun. Hér er hvernig það gengur fyrir sig.

## Hvað á heima hér

Þetta safn geymir **skjölun**, ekki útfærslu viðmótsins. Hingað eiga erindi:

- Leiðréttingar á villum, óskýru orðalagi eða ósamræmi.
- Betri dæmi, og dæmi á fleiri málum.
- Lagfæringar á OpenAPI lýsingunni þegar hún stemmir ekki við skjölunina.
- Íslenska sem má vanda betur.

Þetta á **ekki** erindi hingað:

- Tillögur um nýja endapunkta eða breytt viðmót. Sendu þær á `api@mist.is`.
- Vandamál með þinn eigin aðgang, lykla eða áskrift. Hafðu samband gegnum
  stjórnborðið.
- Öryggisveilur eða lyklar sem hafa lekið. Sjá [SECURITY.md](SECURITY.md).

## Áður en þú byrjar

Viðmótið er í **forútgáfu**. Samningurinn í þessum skjölum er ákveðinn, og
breyting á honum er ekki ritstjórnarleg breyting heldur ákvörðun um vöruna.
Finnirðu eitthvað sem virðist rangt í samningnum sjálfum, opnaðu issue og
spurðu áður en þú skrifar breytinguna.

## Hvernig þú leggur til breytingu

1. **Opnaðu issue fyrst** ef breytingin er stærri en stafsetning eða orðalag.
   Það sparar okkur báðum vinnu.
2. **Greinaðu út frá `main`.** Nefndu greinina eftir því sem hún gerir, til
   dæmis `docs/skyra-flokkavorpun`.
3. **Haltu breytingunni afmarkaðri.** Ein breyting á hverja beiðni.
4. **Keyrðu athuganirnar** áður en þú sendir.
5. **Lýstu breytingunni** í beiðninni: hvað breyttist og hvers vegna.
6. **Uppfærðu [CHANGELOG.md](CHANGELOG.md)** þegar breytingin snertir
   samninginn sjálfan.

## Að keyra athuganir

```bash
npm install
npm run lint
```

Þrjár athuganir keyra:

| Skipun | Hvað hún athugar |
| --- | --- |
| `npm run lint:md` | markdownlint á öll skjöl. |
| `npm run lint:style` | Bannar þankastrik í öllum skrám undir eftirliti git. |
| `npm run lint:openapi` | Redocly á OpenAPI lýsinguna. |

Þú getur keyrt hverja fyrir sig. Sömu þrjár keyra í CI á hverri beiðni, svo
beiðni sem fellur hér fellur líka þar.

**Stílathugunin les aðeins skrár sem git fylgist með.** Keyrðu því
`git add -A` áður en þú lintar nýjar skrár, annars sér hún þær ekki.

Breytirðu OpenAPI lýsingunni skaltu ganga úr skugga um að hún stemmi enn við
skjölin í `docs/`. Þau tvö eiga alltaf að segja það sama.

## Stílreglur

### Íslenska í texta, enska í kóða

Allur texti er á íslensku, með réttri stafsetningu og íslenskum sérstöfum
(`ð`, `þ`, `æ`, `ö`). Málsniðið er formlegt en einfalt, og ávarpið er `þú`.

Á ensku standa: heiti reita í JSON, hausar í HTTP, villukóðar, slóðir,
breytuheiti í kóða og slóðarlyklar flokka. Ekki þýða `originalPrice` eða
`offers:write` inni í dæmi. Skýrðu þau á íslensku í textanum í kring.

### Engin þankastrik

**Hvergi má nota þankastrik (U+2014) eða stutt þankastrik (U+2013)**, hvorki í
texta, YAML, kóða né athugasemdum. `npm run lint:style` fellir beiðnina ef þau
finnast, og prentar skrá, línu og dálk.

Notaðu í staðinn:

| Í stað þess að nota strik | Notaðu |
| --- | --- |
| Innskot í setningu | kommu, eða sviga |
| Skýringu á eftir setningu | tvípunkt |
| Bil milli talna | orðið `til`, til dæmis `frá 1 til 100` |
| Efri mörk | `að hámarki`, til dæmis `að hámarki 6` |

Venjulegt bandstrik (`-`) er í fullu lagi, bæði í orðum eins og `API-lykill` og
í punktalistum.

### Hugtakanotkun

Þessi orð eru notuð eins alls staðar. Ekki nota samheiti.

| Rétt | Á ensku í kóða |
| --- | --- |
| API-lykill | `apiKey` |
| tilboð | `offer` |
| vörumerki | `brand` |
| verslun | `store` |
| flokkur | `category` |
| fyrirtæki | `organization` |
| heimild | `scope` |
| lota | `batch` |
| bendill | `cursor` |
| hraðatakmörkun | rate limit |
| upphaflegt verð | `originalPrice` |
| afsláttarverð | `discountedPrice` |
| forútgáfa | pre-release |
| villa | error |

Passaðu sérstaklega muninn á **fyrirtæki** (áskrifandinn) og **verslun**
(staðsetning). Þau eru ekki samheiti.

### Tónn

Rólegur og nákvæmur. Engar upphrópanir, engar ýkjur, engin sölumennska. Segðu
hvað gerist og hvers vegna, og slepptu því að segja hversu einfalt eða öflugt
það sé.

Þar sem endapunktarnir eru ekki komnir í loftið skal það koma skýrt fram.
Aldrei skrifa eins og eitthvað sé virkt sem er það ekki, og aldrei nefna dagsetningu
sem hefur ekki verið ákveðin.

### Uppbygging skjala

- Ein fyrirsögn á fyrsta stigi í hverri skrá, og hún fyrst.
- Haltu skrám afmörkuðum. Verði kafli of stór á hann sennilega heima í eigin
  skrá.
- Hver endapunktur ber aðferð, slóð, heimild, dæmi um beiðni, dæmi um svar og
  töflu yfir villurnar sem hann getur skilað.
- Töflur bera íslenskar fyrirsagnir: `Reitur`, `Tegund`, `Skylda`, `Reglur`.
- Kóðablokkir bera tungumál: ```bash```, ```json```, ```js```, ```http```,
  ```text```.
- Tenglar milli skjala eru afstæðir, til dæmis `[05-villur.md](05-villur.md)`.

### Dæmi

- Dæmin eiga að vera keyranleg eins og þau standa, að lyklinum frátöldum.
- Lykillinn kemur alltaf úr `MIST_API_KEY`. Aldrei skrifa lykil inn í skrá.
- Notaðu tilbúna fyrirtækið `Norðurljós ehf.` og auðkennin úr hinum dæmunum,
  svo allt safnið segi eina samfellda sögu.
- Dæmi í Node og Python eru án aðfanga: `fetch` og `urllib` duga.
- Athugasemdir í kóða eru á íslensku.

## Stílathugunin

[`scripts/check-style.mjs`](scripts/check-style.mjs) les allar skrár sem git
fylgist með, sleppir tvíundarskrám og prentar `skrá:lína:dálkur` fyrir hvert
bannað strik. Hún skilar `1` þegar eitthvað finnst, annars `0`.

Þurfi hún að sleppa fleiri skráarendingum, bættu þeim í `BINARY_EXTENSIONS`.
Ekki slökkva á athuguninni fyrir einstaka skrá: reglan gildir alls staðar.
