# Auðkenning

Hver beiðni ber einn API-lykil. Lykillinn segir Mist hvaða fyrirtæki á í hlut
og hvað kerfið þitt má gera.

> **V1 í loftinu.** Lyklar eru gefnir út til samþykktra fyrirtækja gegnum
> stjórnborðið, undir Forritaskil.

## Hausinn

```http
Authorization: Bearer mist_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Lykillinn er á forminu `mist_live_` og 32 stafir á eftir. Ekkert annað form er
tekið gilt. Vantar hausinn, eða er hann á öðru formi, er svarið `401` með
kóðanum `unauthorized`.

## Að fá lykil

Lyklar eru ekki sjálfsafgreiðsla. Fyrirtækið verður fyrst að vera samþykkt hjá
Mist og með virka áskrift. Eigandi fyrirtækisins stofnar lykilinn í
stjórnborðinu:

1. Farðu í stillingar fyrirtækisins og veldu API.
2. Veldu **Stofna lykil**, gefðu honum nafn sem lýsir notkuninni (til dæmis
   `Vöruskrá, framleiðsla`) og veldu heimildir.
3. Afritaðu lykilinn úr glugganum sem birtist.

**Lykillinn birtist aðeins einu sinni.** Mist geymir hann ekki í læsilegu formi
og getur ekki sýnt hann aftur. Týnirðu honum stofnarðu nýjan. Eftir stofnun sér
stjórnborðið aðeins nafnið, fyrstu 8 stafina (`hint`), heimildirnar, hvenær
lykillinn var stofnaður og hvenær hann var síðast notaður.

Hvert fyrirtæki má eiga **að hámarki 5 virka lykla**. Sé reynt að stofna þann
sjötta þarf fyrst að afturkalla einhvern hinna.

## Að geyma lykilinn

Lykillinn veitir skrifaðgang að tilboðum fyrirtækisins. Farðu með hann eins og
lykilorð.

- Geymdu hann í umhverfisbreytu eða leyndarmálageymslu, aldrei í kóða sem fer
  í útgáfustýringu.
- Notaðu hann aðeins á þjóni. Lykill sem fer í vafra eða farsímaforrit er
  opinber um leið.
- Gefðu hverju kerfi sinn eigin lykil. Þá má afturkalla eitt kerfi án þess að
  fella hin.
- Ekki senda hann í slóðarfæribreytu, ekki í villuskýrslur og ekki í dagbækur.

Dæmin í þessu safni lesa lykilinn úr `MIST_API_KEY`:

```bash
export MIST_API_KEY="mist_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

Hafi lykill lekið út, sjáðu [SECURITY.md](../SECURITY.md). Afturkallaðu fyrst,
segðu frá á eftir.

## Heimildir

Lykill ber eina eða báðar þessara heimilda.

| Heimild | Hvað hún leyfir |
| --- | --- |
| `offers:read` | Lesa tilboð fyrirtækisins. |
| `offers:write` | Stofna, uppfæra og afvirkja tilboð. |

Reglurnar eru þessar:

- `GET /offers` krefst `offers:read`.
- `PUT /offers/{externalId}`, `DELETE /offers/{externalId}` og
  `POST /offers/batch` krefjast `offers:write`.
- Tilvísunargögnin (`/brands`, `/stores`, `/categories`) og `/me` taka við
  **annarri hvorri** heimildinni. Gildur lykill dugir.
- `GET /openapi.json` krefst einskis lykils.

`offers:write` felur ekki sjálfkrafa í sér `offers:read`. Þarf kerfið þitt bæði
að lesa og skrifa, veldu báðar heimildirnar þegar lykillinn er stofnaður.

Vanti heimild er svarið `403` með kóðanum `scope_missing`. Heimildir lykils
breytast ekki eftir á: þú stofnar nýjan lykil með réttum heimildum og
afturkallar þann gamla.

## Að staðfesta uppsetningu

`GET /me` er ódýrasta leiðin til að ganga úr skugga um að lykillinn virki.

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
    "lastUsedAt": "2026-10-04T11:02:31Z",
    "expiresAt": null
  }
}
```

Berðu `hint` saman við lykilinn í stjórnborðinu til að vita hvaða lykil kerfið
er í raun að nota.

## Endurnýjun

Endurnýjun (rotation) skiptir um leyndarmál án þess að þjónustan detti út.
Þegar þú velur **Endurnýja** í stjórnborðinu gerist þetta:

1. Nýr lykill er stofnaður með sama nafni og sömu heimildum og birtur einu
   sinni.
2. Gamli lykillinn fær **24 klukkustunda svigrúm**. Hann heldur áfram að virka
   þangað til, og rennur þá út.

Þannig endurnýjarðu:

1. Endurnýjaðu í stjórnborðinu og afritaðu nýja lykilinn.
2. Settu hann inn í kerfið þitt og keyrðu köllin á honum.
3. Staðfestu með `GET /me` að `hint` svari til nýja lykilsins.
4. Láttu gamla lykilinn renna út af sjálfu sér, eða afturkallaðu hann strax
   þegar þú ert viss.

Sé gamli lykillinn notaður eftir að svigrúmið rennur út er svarið `401` með
kóðanum `api_key_expired`.

Endurnýjaðu reglulega, og alltaf þegar starfsmaður sem hafði aðgang að
lyklinum hættir eða þegar lykill gæti hafa lekið.

## Afturköllun

Afturköllun (revocation) tekur gildi **samstundis**, án svigrúms. Notaðu hana
þegar lykill hefur lekið eða kerfi er tekið úr notkun.

Eftir afturköllun er svarið `401` með kóðanum `api_key_revoked`. Afturköllun
verður ekki tekin til baka: stofnaðu nýjan lykil ef á þarf að halda.

## Þegar fyrirtækið er óvirkt

Lyklar hætta að virka þegar fyrirtækið sjálft er ekki lengur virkt hjá Mist,
óháð því hvort lykillinn er gildur. Það gerist þegar:

- áskriftin er í bið (`suspended`),
- fyrirtækinu hefur verið lokað (`closed`),
- eða prufutímabilið er runnið út.

Þá er svarið `403` með kóðanum `organization_inactive`. Tilboðin sem þegar eru
í Mist hverfa af neytendavefnum á meðan, en þeim er ekki eytt: um leið og
áskriftin er komin í lag byrja lyklarnir og tilboðin að virka aftur.

Kerfið þitt ætti að meðhöndla `organization_inactive` sem viðvörun til fólks,
ekki sem villu til að reyna aftur í lykkju. Enginn fjöldi endurtekninga lagar
áskrift.

## Villur við auðkenningu

| Staða | Kóði | Merking |
| --- | --- | --- |
| `401` | `unauthorized` | `Authorization` haus vantar eða er á röngu formi. |
| `401` | `api_key_invalid` | Enginn lykill svarar til þessa leyndarmáls. |
| `401` | `api_key_revoked` | Lykillinn hefur verið afturkallaður. |
| `401` | `api_key_expired` | Svigrúm endurnýjaðs lykils er liðið. |
| `403` | `scope_missing` | Lykilinn vantar heimild fyrir þessari aðgerð. |
| `403` | `organization_inactive` | Fyrirtækið er ekki virkt hjá Mist. |

Nánar um form villusvara í [05-villur.md](05-villur.md).
