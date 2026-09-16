# Tilvísunargögn

Tilboð vísa í þrennt sem er skilgreint utan þeirra: vörumerki, verslanir og
flokka. Þessir þrír endapunktar segja þér hvað er í boði.

Allir þrír taka við **annarri hvorri** heimildinni, `offers:read` eða
`offers:write`. Gildur lykill dugir.

> **Forútgáfa.** Endapunktarnir svara ekki ennþá. Flokkatréð sjálft er hins
> vegar það sem Mist notar í dag, svo vörpunin sem þú byggir núna heldur.

## `GET /brands`

Skilar vörumerkjum sem eru skráð á fyrirtækið.

```bash
curl -s "https://mist.is/api/v1/brands" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "data": [
    {
      "id": "71b0c4e9-3d5a-4f88-a2c6-9e17b3d05f42",
      "name": "Norðurljós",
      "slug": "nordurljos"
    }
  ]
}
```

| Reitur | Tegund | Hvað hann er |
| --- | --- | --- |
| `id` | strengur | Auðkenni vörumerkisins hjá Mist. |
| `name` | strengur | Heitið. Þetta er gildið sem þú sendir í `brand`. |
| `slug` | strengur eða `null` | Slóðarhluti vörumerkisins á neytendavefnum. |

Í tilboði er vísað í vörumerki **með nafni**, ekki auðkenni:

```json
{ "brand": "Norðurljós" }
```

Mist leitar að vörumerki með þessu nafni innan fyrirtækisins og stofnar það ef
það finnst ekki. Vörumerki eru bundin fyrirtækinu: tvö fyrirtæki mega bæði eiga
vörumerki sem heitir `Norðurljós` án þess að þau ruglist saman.

Þetta þýðir að **stafsetning skiptir máli**. `Norðurljós` og `Nordurljos` verða
að tveimur aðskildum vörumerkjum. Sæktu listann og notaðu nákvæmlega þau nöfn
sem eru þar, frekar en að treysta á að vörpunin þín skili alltaf sama streng.

## `GET /stores`

Skilar verslunum (staðsetningum) fyrirtækisins.

```bash
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

| Reitur | Tegund | Hvað hann er |
| --- | --- | --- |
| `id` | strengur | Auðkennið sem fer í `storeIds`. |
| `name` | strengur | Heiti verslunarinnar. |
| `address` | strengur eða `null` | Heimilisfang. |
| `city` | strengur eða `null` | Sveitarfélag eða bær. |

Ólíkt vörumerkjum er vísað í verslanir **með auðkenni**, því nöfn verslana eru
sjaldan einkvæm. Verslanir eru stofnaðar í stjórnborðinu, ekki gegnum þetta
viðmót.

Í tilboði áttu tvo kosti:

```json
{ "storeIds": "all" }
```

Tilboðið gildir í öllum verslunum fyrirtækisins, líka þeim sem bætast við
seinna. Þetta er rétti kosturinn fyrir vefverslun og fyrir keðju sem keyrir
sama afslátt alls staðar.

```json
{ "storeIds": ["5a8e3b21-77cc-4f10-9b2d-1e6f0a4c8d33"] }
```

Tilboðið gildir aðeins í tilteknum verslunum. Notaðu þetta þegar afsláttur er
bundinn við staðsetningu.

Óþekkt auðkenni í `storeIds` fellir beiðnina með `validation_failed`.

## `GET /categories`

Skilar flokkatré Mist.

```bash
curl -s "https://mist.is/api/v1/categories" \
  -H "Authorization: Bearer $MIST_API_KEY"
```

```json
{
  "data": [
    {
      "pathKey": "clothing/women",
      "name": "Dömufatnaður",
      "offerType": "product",
      "isLeaf": false,
      "parentPathKey": "clothing"
    },
    {
      "pathKey": "clothing/women/outerwear",
      "name": "Yfirhafnir",
      "offerType": "product",
      "isLeaf": true,
      "parentPathKey": "clothing/women"
    }
  ]
}
```

| Reitur | Tegund | Hvað hann er |
| --- | --- | --- |
| `pathKey` | strengur | Slóðarlykillinn. Þetta er gildið sem fer í `categoryPathKey`. |
| `name` | strengur | Heiti flokksins. |
| `offerType` | `product` eða `restaurant` | Hvaða tegund tilboða flokkurinn á við. |
| `isLeaf` | gildisreitur | Hvort flokkurinn er laufflokkur. |
| `parentPathKey` | strengur eða `null` | Yfirflokkurinn, eða `null` á efsta stigi. |

### Hvernig slóðarlyklar virka

Slóðarlykill er leiðin niður tréð, aðgreind með skástriki:

```text
clothing / women / outerwear
   ^         ^        ^
 aðalflokkur undirflokkur laufflokkur
```

Þrjár reglur:

1. **Tilboð verður að vísa í laufflokk**, það er flokk þar sem `isLeaf` er
   `true`. `clothing/women` er ekki gild, `clothing/women/outerwear` er gild.
2. **Lykillinn er nákvæmur strengur.** Hann er alltaf á ensku, með litlum
   stöfum og bandstriki milli orða (`underwear-socks`, `beauty-care`). Heiti
   flokkanna eru á íslensku, lyklarnir ekki.
3. **`offerType` verður að stemma.** Vörutilboð notar flokk undir `clothing`,
   `cosmetics`, `beauty-care` eða `other`. Veitingatilboð notar flokk undir
   `restaurant`.

Ógildur eða óþekktur lykill fellir beiðnina með `validation_failed` og
`fields` bendir á `categoryPathKey`.

### Dæmi um lykla

Vörur:

```text
clothing/men/footwear
clothing/women/outerwear
clothing/kids/tops
clothing/unisex/accessories
cosmetics/eyes/mascara
beauty-care/skincare/serum
beauty-care/hair-care/shampoo
other/home
other/electronics
```

Veitingar:

```text
restaurant/meal/breakfast
restaurant/meal/lunch
restaurant/meal/dinner
restaurant/meal/snacks
restaurant/meal/drinks
```

Listinn hér er stytt sýnishorn. Sæktu `GET /categories` fyrir tréð eins og það
stendur.

### Að varpa þínum eigin flokkum

Vöruskráin þín notar næstum örugglega aðra flokkun en Mist. Vörpunin er þitt
verk, og þetta virkar best:

1. **Sæktu tréð einu sinni og geymdu það.** Flokkatréð breytist sjaldan.
   Sæktu það við ræsingu eða einu sinni á sólarhring og haltu því í minni. Ekki
   kalla á `/categories` fyrir hvert tilboð.
2. **Byggðu fasta vörpunartöflu.** Eitt gildi úr þínu kerfi vísar á einn
   `pathKey`. Tafla sem þú átt sjálfur er betri en ágiskun í keyrslu, því hún
   er endurskoðanleg þegar eitthvað lendir í röngum flokki.

   ```text
   "Dömukápur"      ->  clothing/women/outerwear
   "Herraskór"      ->  clothing/men/footwear
   "Barnabolir"     ->  clothing/kids/tops
   "Serum"          ->  beauty-care/skincare/serum
   ```

3. **Veldu nákvæmasta laufflokkinn sem á við.** Ef þú ert í vafa milli tveggja,
   veldu þann sem neytandi myndi leita í.
4. **Notaðu `other` sparlega.** Flokkar undir `other` eru fyrir vörur sem eiga
   hvergi annars staðar heima. Tilboð í of víðum flokki finnst verr.
5. **Láttu vita þegar vörpun vantar.** Betra er að fella tilboð í þinni eigin
   skriftu og skrá viðvörun en að setja allt sem þú þekkir ekki í einn safnflokk.
6. **Staðfestu vörpunina áður en þú keyrir fulla samstillingu.** Berðu
   lyklana í töflunni þinni saman við `pathKey` úr `/categories` og gakktu úr
   skugga um að allir séu til og allir séu lauf.

## Hve oft á að sækja tilvísunargögn

| Endapunktur | Ráðlögð tíðni |
| --- | --- |
| `GET /categories` | Einu sinni á sólarhring, eða við ræsingu. |
| `GET /stores` | Einu sinni á sólarhring. Oftar ef þú opnar verslanir ört. |
| `GET /brands` | Eftir þörfum. Vörumerki verða til sjálfkrafa við innsendingu. |

Öll þrjú telja inn í hraðatakmörkunina, svo þau eiga ekki heima inni í lykkju
sem gengur í gegnum vörulistann. Sjá
[06-hradatakmarkanir.md](06-hradatakmarkanir.md).
