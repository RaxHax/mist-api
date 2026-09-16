# Öryggi

## Ef API-lykill hefur lekið

Lykill sem hefur birst einhvers staðar sem hann átti ekki að birtast telst
lekinn: í kóða sem fór í útgáfustýringu, í dagbók, í skjámynd, í spjalli eða í
villuskýrslu.

**Gerðu þetta í þessari röð.**

1. **Afturkallaðu lykilinn strax** í stjórnborðinu, undir stillingum
   fyrirtækisins og API. Afturköllun tekur gildi samstundis. Ekki bíða eftir
   svari frá Mist og ekki bíða eftir því að finna út hvort einhver hafi
   raunverulega notað hann.
2. **Stofnaðu nýjan lykil** og settu hann inn í kerfið þitt.
3. **Farðu yfir nýlegar beiðnir** í stjórnborðinu og athugaðu hvort eitthvað
   sé þar sem þú kannast ekki við.
4. **Láttu Mist vita** á `api@mist.is` ef þú sérð merki um að lykillinn hafi
   verið misnotaður.
5. **Fjarlægðu lykilinn af staðnum þar sem hann lak.** Athugaðu að lykill sem
   hefur farið í git sögu hverfur ekki þótt þú eyðir línunni: hann er áfram í
   sögunni. Afturköllunin í fyrsta skrefi er það sem skiptir máli.

**Ekki opna issue með lykli í.** Issues eru opinber. Lykill sem birtist þar
verður lesinn af leitarvélum og sjálfvirkum söfnurum áður en þú nærð að eyða
honum. Afturkallaðu fyrst, segðu frá á eftir.

## Að tilkynna öryggisveilu

Finnirðu veilu í Mist merchant API, í skjöluninni eða í dæmunum hér, sendu
erindi á `api@mist.is` með efnislínunni `Öryggi`.

**Ekki opna issue** og ekki birta veiluna opinberlega fyrr en Mist hefur fengið
færi á að laga hana.

Láttu fylgja það sem þú getur:

- Lýsingu á veilunni og hvers vegna hún skiptir máli.
- Skref sem sýna hana, eða dæmi um beiðni.
- Hvaða áhrif hún gæti haft, til dæmis hvort gögn annars fyrirtækis komist í
  hendur rangs aðila.
- Hvernig Mist má hafa samband við þig.

**Ekki láta lykla, aðgangsorð né persónuupplýsingar fylgja erindinu.** Þeirra
er ekki þörf til að lýsa veilu.

Þú færð svar sem staðfestir að erindið hafi borist, og lætur vita þegar veilan
hefur verið lagfærð.

## Hvað telst ekki veila

- Að lykill með `offers:write` geti breytt tilboðum fyrirtækisins. Það er
  tilgangur hans.
- Að `GET /openapi.json` sé opinn án lykils. Það er vísvitandi.
- Að afsláttarverð birtist neytendum. Það er varan sjálf.

## Að fara vel með lykla

Flest tilvik sem berast eru lekinn lykill, ekki veila í viðmótinu. Þetta ver
þig gegn þeim:

- Geymdu lykilinn í umhverfisbreytu eða leyndarmálageymslu, aldrei í kóða sem
  fer í útgáfustýringu.
- Notaðu hann aðeins á þjóni. Lykill sem fer í vafra eða farsímaforrit er
  opinber um leið.
- Gefðu hverju kerfi sinn eigin lykil. Þá má afturkalla eitt án þess að fella
  hin.
- Veldu aðeins þær heimildir sem kerfið þarf. Kerfi sem les þarf ekki
  `offers:write`.
- Endurnýjaðu lykla reglulega, og alltaf þegar starfsmaður sem hafði aðgang
  hættir. Endurnýjun gefur gamla lyklinum 24 klukkustunda svigrúm, svo
  þjónustan dettur ekki út.
- Skráðu aldrei lykilinn í dagbækur eða villuskýrslur. Skráðu `hint` lykilsins
  úr `GET /me` ef þú þarft að vita hvaða lykill var notaður.
- Sendu lykilinn aldrei í slóðarfæribreytu. Slóðir enda í dagbókum
  vefþjóna og í vafrasögu.

Nánar í [02-audkenning.md](docs/02-audkenning.md).
