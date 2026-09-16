# Breytingaskrá

Allar merkjanlegar breytingar á Mist merchant API og skjölun þess eru skráðar
hér.

Sniðið fylgir [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) og
útgáfunúmerin fylgja [Semantic Versioning](https://semver.org/lang/is/).

## [Óútgefið]

### v1 drög

Fyrstu drög að v1 viðmótinu. Samningurinn er ákveðinn, endapunktarnir eru ekki
komnir í loftið.

#### Bætt við

- Auðkenning með API-lykli: `Authorization: Bearer mist_live_<32 stafir>`.
  Lyklar eru gefnir út í stjórnborðinu, birtast einu sinni, og hvert fyrirtæki
  má eiga að hámarki 5 virka lykla.
- Heimildirnar `offers:read` og `offers:write`. Tilvísunargögn og `/me` taka
  við annarri hvorri.
- Endurnýjun lykla með 24 klukkustunda svigrúmi á gamla lyklinum, og
  afturköllun sem tekur gildi samstundis.
- Hraðatakmörkun: sjálfgefið 60 beiðnir á mínútu á hvern lykil, með hausunum
  `X-RateLimit-Limit` og `X-RateLimit-Remaining` og `Retry-After` á `429`.
- `GET /me` sem skilar fyrirtækinu og lýsigögnum lykilsins.
- `PUT /offers/{externalId}`: gagnvirk innsending lykluð á vörunúmer
  fyrirtækisins.
- `POST /offers/batch`: allt að 100 tilboð í einni beiðni, með niðurstöðu fyrir
  hverja færslu.
- `DELETE /offers/{externalId}`: afvirkjar tilboð án þess að eyða því.
- `GET /offers` með `cursor` og `limit` fyrir blaðsíður.
- `GET /brands`, `GET /stores` og `GET /categories` fyrir tilvísunargögn.
- `GET /openapi.json`, opinn og án lykils.
- Villusvör á forminu `application/problem+json` með stöðugu `code`:
  `unauthorized`, `api_key_invalid`, `api_key_revoked`, `api_key_expired`,
  `scope_missing`, `organization_inactive`, `validation_failed`, `not_found`,
  `rate_limited`, `batch_too_large` og `internal_error`.
- Verðsaga sem er skráð við hverja verðbreytingu, sem sönnun fyrir raunverulegu
  fyrra verði samkvæmt kröfum Neytendastofu.
- Stuðningur við veitingatilboð með `dealType` og `dealValue`.
- Skjölun á íslensku í [`docs/`](docs), OpenAPI 3.1 lýsing í
  [`openapi/`](openapi) og keyranleg dæmi í [`examples/`](examples).

#### Óákveðið

- Nákvæm grunnslóð er staðfest með lyklinum þegar hann er gefinn út.
  Skjölunin notar `https://mist.is/api/v1`.
- Útgáfudagur viðmótsins.

#### Síðar

Þetta er þekkt og vísvitandi utan v1: IP-hvítlistar, prófunarlyklar, undirritaðir
vefkrókar (webhooks), tengingar við Shopify og Google Merchant, innflutningur úr
CSV, og gildistími lykla sem fyrirtækið velur sjálft.
