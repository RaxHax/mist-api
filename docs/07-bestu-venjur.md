# Bestu venjur

Þetta eru venjur sem gera samstillingu ódýra, fyrirsjáanlega og auðvelda að
laga þegar eitthvað fer úrskeiðis.

## Ytra auðkenni og endurtakanleiki

`externalId` er hornsteinninn. Mist lyklar tilboðið á það, svo `PUT` á sama
auðkenni er endurtakanlegt (idempotent): fyrsta kallið stofnar, öll næstu uppfæra.

Veldu auðkenni sem er:

- **Stöðugt.** Sama vara ber sama auðkenni að eilífu. Breytirðu því stofnar
  Mist nýtt tilboð og það gamla situr eftir.
- **Einkvæmt innan fyrirtækisins.** Vörunúmerið þitt er yfirleitt rétta
  gildið.
- **Óháð verði og framboði.** Auðkennið á vöruna, ekki tilboðið á henni.

```text
Gott:   SKU-1042, 5690123456789, vara-8831
Slæmt:  ullarkapa-30-afslattur-oktober
```

Af endurtakanleikanum leiðir að þú mátt endurtaka hvaða kall sem er án þess að
óttast tvítekningu. Dettur skriftan út á miðri leið, keyrðu hana bara aftur
frá byrjun.

Þú þarft engan `Idempotency-Key` haus. Auðkennið í slóðinni gegnir því
hlutverki.

## Samstillingarmynstur

### Full samstilling, svo breytingar

Þetta mynstur hentar flestum.

**Full samstilling** sendir öll tilboð sem eiga að vera í birtingu, og afvirkjar
það sem á ekki að vera þar lengur. Keyrðu hana við uppsetningu og svo reglulega
til að leiðrétta rek, til dæmis aðfaranótt sunnudags.

```text
1. Sæktu núverandi stöðu:      GET /offers  (blaðaðu í gegn með bendlinum)
2. Reiknaðu hvað á að vera í birtingu úr þínu kerfi.
3. Sendu allt sem á að vera þar:  POST /offers/batch  (lotur af 100)
4. Afvirkjaðu það sem eftir stendur í Mist en ekki í þínu setti:
   DELETE /offers/{externalId}
```

**Breytingasamstilling** sendir aðeins það sem hefur breyst síðan síðast.
Keyrðu hana oft, til dæmis á klukkustundar fresti.

```text
1. Finndu vörur sem hafa breyst síðan síðasta keyrsla.
2. Sendu þær:                     POST /offers/batch
3. Afvirkjaðu þær sem fóru af afslætti eða seldust upp:
   DELETE /offers/{externalId}
```

Breytingasamstilling er miklu ódýrari, en hún rekur smám saman frá
raunveruleikanum: ein misheppnuð keyrsla skilur eftir sig gat sem lagast
aldrei af sjálfu sér. Full samstilling reglulega lokar þeim götum.

### Ráðlögð tíðni

| Verk | Tíðni | Hvers vegna |
| --- | --- | --- |
| Verðbreytingar og nýr afsláttur | Á klukkustundar fresti eða þegar breyting verður | Verð í Mist á að stemma við vefsíðuna þína. |
| Afvirkja uppseldar vörur | Eins fljótt og hægt er | Tilboð sem er ekki til fer illa í neytendur. |
| Full samstilling | Vikulega | Lokar götum eftir misheppnaðar keyrslur. |
| Tilvísunargögn | Daglega | Flokkar og verslanir breytast sjaldan. |

Ekki senda óbreytt tilboð aftur og aftur. Það eyðir kvótanum og gefur enga
mynd af því hvað breyttist í raun.

### Sendu aðeins það sem breyttist

Geymdu gátsummu (hash) af efninu sem þú sendir fyrir hvert `externalId`.
Reiknaðu hana aftur í næstu keyrslu og slepptu því sem er óbreytt.

```js
import { createHash } from 'node:crypto';

function gatsumma(tilbod) {
  // Raðaðu lyklunum svo sama efni gefi alltaf sömu summu.
  const radad = JSON.stringify(tilbod, Object.keys(tilbod).sort());
  return createHash('sha256').update(radad).digest('hex');
}
```

Verslun með 4000 vörur þar sem 40 breytast á dag fer þá úr 40 lotum niður í
eina.

### Uppseldar vörur

Notaðu `DELETE /offers/{externalId}`. Aðgerðin afvirkjar tilboðið en eyðir því
ekki: verðsagan og tölfræðin haldast, og `PUT` á sama auðkenni vekur það aftur
þegar varan kemur á lager.

Ekki senda `discountedPrice: 0` og ekki búa til afbrigði af auðkenninu til að
fela tilboð. Afvirkjun er til þess gerð.

## Verð og reglan um upphaflegt verð

`originalPrice` verður að vera verð sem varan var raunverulega seld á. Þetta er
lagaskylda: Neytendastofa hefur eftirlit með því að auglýstur afsláttur
endurspegli raunverulegt fyrra verð, og Mist byggir traust sitt á því að allt
sem birtist sé raunverulegur afsláttur.

Mist skráir **verðsögu** í hvert sinn sem `originalPrice` eða
`discountedPrice` breytist. Sagan er sönnunargagnið ef spurt er.

Í reynd þýðir þetta:

- Sendu það verð sem stóð á vefsíðunni þinni áður en afslátturinn hófst.
- **Ekki hækka `originalPrice`** til að láta afsláttinn líta betur út. Sagan
  sýnir hækkunina.
- Sendu raunveruleg verð, ekki ávallt sama listaverðið óháð því sem varan
  seldist á.
- Breytist afslátturinn skaltu uppfæra `discountedPrice` og láta
  `originalPrice` standa óbreytt.
- Verð eru **heiltölur í krónum**: `34900`, ekki `34.900`, `"34900 kr."` eða
  `34900.00`.

## Myndir

Mist sækir myndirnar af slóðunum sem þú gefur, geymir þær og þjónar þeim á
neytendavefnum. Þú þarft ekki að hlaða neinu upp.

- **Að hámarki 6 slóðir** í `imageUrls`.
- **Aðeins `https`.**
- **Að minnsta kosti 800 px á styttri hlið.** Minni myndir verða loðnar á
  skjám með mikilli upplausn.
- **Notaðu stöðugar slóðir.** Slóð sem breytist í hvert sinn sem varan er
  uppfærð neyðir Mist til að sækja myndina aftur og aftur.
- **Fyrsta myndin er aðalmyndin.** Hún birtist í listum og leitarniðurstöðum,
  svo hafðu hana hreina og vel lýsta.
- Slóðin verður að svara án auðkenningar. Mynd á bak við innskráningu eða
  vísun (referer) sem er lokað á kemst ekki í gegn.

Myndaslóð sem svarar ekki fellir ekki tilboðið: tilboðið fer inn og myndin
vantar. Athugaðu því tilboðin þín á neytendavefnum eftir fyrstu samstillingu.

## Drög

`isDraft: true` vistar tilboðið án þess að það birtist neytendum. Notaðu það
þegar þú vilt undirbúa herferð eða staðfesta vörpunina þína áður en nokkuð fer
í loftið.

```json
{ "isDraft": true }
```

Fyrsta samstilling í dragaham er góð leið til að sjá að flokkar, vörumerki og
myndir komi rétt inn. Farðu yfir tilboðin í stjórnborðinu og keyrðu svo sömu
lotu aftur með `isDraft: false`.

Drög og tímasetning eru tvennt ólíkt:

- **Drög** birtast aldrei fyrr en þú fjarlægir `isDraft`.
- **`startAt`** birtir tilboðið sjálfkrafa á tilteknum tíma.

Notaðu `startAt` fyrir herferð sem hefst á ákveðnum degi. Notaðu drög fyrir það
sem þú ert ekki búinn að ákveða.

## Tími og tímabelti

`startAt` og `endAt` eru ISO 8601 tímastimplar og **eiga alltaf að bera
tímabelti**.

```json
{
  "startAt": "2026-11-29T00:00:00Z",
  "endAt": "2026-11-30T23:59:59Z"
}
```

Ísland er á UTC allt árið og skiptir ekki yfir í sumartíma, svo staðartími og
`Z` fara saman. Það sparar þér ekki að sleppa tímabeltinu: stimpill án þess er
tvíræður og er hafnað með `invalid_datetime`.

Athugaðu:

- `endAt` er sá tími sem tilboðið hverfur. Eigi það að gilda út daginn, notaðu
  `23:59:59` þess dags.
- `endAt` má ekki vera á undan `startAt`.
- Sleppirðu `startAt` birtist tilboðið strax. Sleppirðu `endAt` gildir það þar
  til þú afvirkjar það.
- Tilboð sem er runnið út hverfur af neytendavefnum en situr áfram í
  `GET /offers`.

Keyrirðu í öðru tímabelti skaltu umbreyta yfir í UTC áður en þú sendir, ekki
treysta á staðarstillingu þjónsins.

## Að fara í loftið

Gátlisti fyrir fyrstu alvöru samstillingu:

1. `GET /me` skilar rétta fyrirtækinu og `isActive` er `true`.
2. Flokkavörpunin þín er staðfest gegn `GET /categories` og allir lyklar eru
   lauf.
3. Verslanaauðkennin þín koma úr `GET /stores`, eða þú notar `"all"`.
4. Nokkur tilboð hafa farið í gegn með `isDraft: true` og líta rétt út í
   stjórnborðinu.
5. Lyklarnir eru í leyndarmálageymslu, ekki í kóða sem fer í útgáfustýringu.
6. Skriftan þín meðhöndlar `429` með `Retry-After` og hættir á
   `organization_inactive`.
7. Skráningin þín ber `externalId` og `code`, aldrei lykilinn sjálfan.
8. Þú átt leið til að afvirkja allt aftur ef eitthvað fer úrskeiðis.

## Sjá einnig

- [03-tilbod.md](03-tilbod.md) fyrir reitina sjálfa.
- [06-hradatakmarkanir.md](06-hradatakmarkanir.md) fyrir kvóta og bið.
- [08-daemi.md](08-daemi.md) fyrir heila ferð frá byrjun.
