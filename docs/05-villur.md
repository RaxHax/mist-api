# Villur

Allar villur úr Mist merchant API eru á sama formi: `application/problem+json`
samkvæmt RFC 9457. Þú þarft aldrei að lesa HTML eða texta sem er ætlaður fólki
til að vita hvað fór úrskeiðis.

## Form villusvars

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
```

```json
{
  "type": "https://mist.is/api/v1/errors/validation_failed",
  "title": "Beiðnin stóðst ekki staðfestingu",
  "status": 422,
  "code": "validation_failed",
  "detail": "Einn eða fleiri reitir eru ógildir.",
  "fields": [
    {
      "field": "discountedPrice",
      "code": "must_be_lower_than_original",
      "message": "Afsláttarverð verður að vera lægra en upphaflegt verð."
    }
  ]
}
```

| Reitur | Tegund | Skylda | Hvað hann er |
| --- | --- | --- | --- |
| `type` | strengur | Já | Slóð sem auðkennir villutegundina. |
| `title` | strengur | Já | Stutt lýsing, ætluð fólki. Textinn getur breyst. |
| `status` | heiltala | Já | HTTP stöðukóðinn, sá sami og í svarlínunni. |
| `code` | strengur | Já | Stöðugur villukóði. **Greindu á þennan reit.** |
| `detail` | strengur | Nei | Nánari skýring á þessu tiltekna tilviki. |
| `fields` | listi | Nei | Aðeins með `validation_failed`. |

`code` er eini reiturinn sem er stöðugur. `title` og `detail` eru orðalag sem
má laga hvenær sem er, svo forritið þitt á aldrei að treysta á þá.

## Villukóðar

| Kóði | Staða | Merking | Hvað á að gera |
| --- | --- | --- | --- |
| `unauthorized` | `401` | `Authorization` haus vantar eða er á röngu formi. | Lagaðu hausinn. Ekki reyna aftur óbreytt. |
| `api_key_invalid` | `401` | Enginn lykill svarar til þessa leyndarmáls. | Athugaðu hvort lykillinn afritaðist rétt. Ekki reyna aftur óbreytt. |
| `api_key_revoked` | `401` | Lykillinn hefur verið afturkallaður. | Fáðu nýjan lykil í stjórnborðinu. Láttu fólk vita. |
| `api_key_expired` | `401` | Svigrúm endurnýjaðs lykils er liðið. | Skiptu yfir í nýja lykilinn úr endurnýjuninni. |
| `scope_missing` | `403` | Lykilinn vantar heimild. | Stofnaðu lykil með réttum heimildum. Ekki reyna aftur óbreytt. |
| `organization_inactive` | `403` | Fyrirtækið er ekki virkt hjá Mist. | Athugaðu áskriftina. Stöðvaðu samstillingu og láttu fólk vita. |
| `validation_failed` | `422` eða `413` | Efnið stenst ekki reglur. | Lestu `fields`, lagaðu gögnin. Ekki reyna aftur óbreytt. |
| `not_found` | `404` | Tilboðið finnst ekki hjá fyrirtækinu. | Athugaðu `externalId`. Notaðu `PUT` til að stofna. |
| `rate_limited` | `429` | Hraðatakmörkunin er fullnýtt. | Bíddu eins og `Retry-After` segir og reyndu aftur. |
| `batch_too_large` | `413` | Fleiri en 100 færslur í lotu. | Skiptu lotunni upp. |
| `internal_error` | `500` | Óvænt villa hjá Mist. | Reyndu aftur með vaxandi bið. Hafðu samband haldi hún áfram. |

## Hvernig á að bregðast við

Villurnar falla í þrjá flokka, og það ræður öllu um hvernig kerfið þitt á að
haga sér.

### Reyndu aftur

`rate_limited` og `internal_error`. Vandinn er tímabundinn og sama beiðni gæti
gengið á eftir.

- Fyrir `rate_limited`, bíddu nákvæmlega eins lengi og `Retry-After` segir. Sjá
  [06-hradatakmarkanir.md](06-hradatakmarkanir.md).
- Fyrir `internal_error`, notaðu vaxandi bið með slembiþætti og hættu eftir
  nokkrar tilraunir.

### Lagaðu gögnin

`validation_failed`, `not_found` og `batch_too_large`. Sama beiðni mun aldrei
ganga. Að reyna aftur eyðir aðeins kvótanum þínum.

Skráðu villuna með `externalId` viðkomandi tilboðs og haltu áfram með hin.
Eitt gallað tilboð á ekki að stöðva heila samstillingu.

### Stöðvaðu og láttu vita

`unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired`,
`scope_missing` og `organization_inactive`. Þetta eru uppsetningar- eða
áskriftarvandamál sem enginn fjöldi endurtekninga lagar.

Stöðvaðu samstillinguna og láttu fólk vita. Sérstaklega á
`organization_inactive` erindi til þeirra sem sjá um áskriftina, ekki inn í
dagbók sem enginn les.

## Reitavillur: `fields`

Þegar `code` er `validation_failed` fylgir listi `fields` með einum hlut fyrir
hvern reit sem stóðst ekki reglu.

```json
{
  "field": "discountedPrice",
  "code": "must_be_lower_than_original",
  "message": "Afsláttarverð verður að vera lægra en upphaflegt verð."
}
```

| Reitur | Hvað hann er |
| --- | --- |
| `field` | Heiti reitsins sem brást. |
| `code` | Stöðugur kóði fyrir þessa tilteknu reglu. |
| `message` | Skýring ætluð fólki. Textinn getur breyst. |

Í lotum er vísað með punktaslóð svo þú vitir hvaða færsla brást:

```json
{
  "field": "offers.3.categoryPathKey",
  "code": "unknown_category",
  "message": "Flokkurinn clothing/women finnst ekki eða er ekki laufflokkur."
}
```

Talan er staða færslunnar í `offers`, talin frá núlli.

### Algengir reitakóðar

| Kóði | Reitur | Hvað er að |
| --- | --- | --- |
| `required` | hvaða sem er | Skyldureit vantar. |
| `must_be_lower_than_original` | `discountedPrice` | Afsláttarverð er ekki lægra en upphaflegt verð. |
| `must_be_positive_integer` | `originalPrice`, `discountedPrice` | Verð er ekki jákvæð heiltala. |
| `unknown_category` | `categoryPathKey` | Flokkurinn er ekki til, eða er ekki laufflokkur. |
| `category_offer_type_mismatch` | `categoryPathKey` | Flokkurinn á við aðra tegund tilboðs. |
| `unknown_store` | `storeIds` | Auðkenni verslunar tilheyrir ekki fyrirtækinu. |
| `too_many_items` | `imageUrls` | Fleiri en 6 myndaslóðir. |
| `must_be_https` | `imageUrls` | Myndaslóð er ekki yfir `https`. |
| `invalid_url` | `url`, `imageUrls` | Slóðin er ekki gild. |
| `invalid_datetime` | `startAt`, `endAt` | Tímastimpillinn er ekki gildur ISO 8601. |
| `end_before_start` | `endAt` | Lokatími er á undan upphafstíma. |
| `too_long` | `name`, `description`, `dealValue` | Lengri en hámarkið leyfir. |
| `required_for_offer_type` | `dealType`, `dealValue`, verðreitir | Reiturinn er skylda fyrir þessa tegund tilboðs. |

Listinn getur lengst. Meðhöndlaðu óþekktan reitakóða eins og almenna
staðfestingarvillu: skráðu `field` og `message` og haltu áfram.

## Villur inni í lotum

`POST /offers/batch` skilar `200` þótt einstakar færslur mistakist. Villan á
færslunni kemur inni í `results`, ekki sem villusvar.

```json
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
        "field": "discountedPrice",
        "code": "must_be_lower_than_original",
        "message": "Afsláttarverð verður að vera lægra en upphaflegt verð."
      }
    ]
  }
}
```

`error` er sami hlutur og villusvar, svo þú getur notað sama kóðann til að lesa
hann. **`200` þýðir ekki að allt hafi gengið.** Lestu alltaf `summary.failed`
og farðu í gegnum `results`.

## Dæmi um meðhöndlun

```js
// Skilar: 'retry' (reyna aftur), 'fix' (laga gögn), 'stop' (stöðva og láta vita).
function flokkaVillu(problem) {
  switch (problem.code) {
    case 'rate_limited':
    case 'internal_error':
      return 'retry';

    case 'validation_failed':
    case 'not_found':
    case 'batch_too_large':
      return 'fix';

    case 'unauthorized':
    case 'api_key_invalid':
    case 'api_key_revoked':
    case 'api_key_expired':
    case 'scope_missing':
    case 'organization_inactive':
      return 'stop';

    default:
      // Nýr kóði sem þessi útgáfa þekkir ekki: farðu varlega.
      return 'stop';
  }
}
```

Hafðu alltaf `default` grein. Nýir villukóðar geta bæst við innan v1, og
óþekktur kóði á að stöðva frekar en að lenda í þöglu falli.

## Hvað á að skrá

Skráðu þetta með hverri villu:

- `code`, `status` og `detail` úr svarinu.
- `externalId` tilboðsins eða staðsetninguna í lotunni.
- Aðferð og slóð beiðninnar.
- `hint` lykilsins, ef þú notar fleiri en einn.

**Skráðu aldrei lykilinn sjálfan**, hvorki í dagbækur né villuskýrslur.
