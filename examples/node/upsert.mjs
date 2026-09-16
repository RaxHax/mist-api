// Stofnar eða uppfærir eitt tilboð í Mist.
//
// Engin aðfong: notar innbyggða fetch í Node 18 og nýrri.
//
// Notkun:
//   MIST_API_KEY=mist_live_... node upsert.mjs
//
// Forútgáfa: endapunktarnir svara ekki ennþá. Skriftan er tilbúin til að
// keyra um leið og viðmótið opnar.

const API_KEY = process.env.MIST_API_KEY;
const BASE_URL = process.env.MIST_BASE_URL ?? 'https://mist.is/api/v1';

if (!API_KEY) {
  console.error('Settu MIST_API_KEY fyrst, til dæmis: export MIST_API_KEY=mist_live_...');
  process.exit(1);
}

// Tilboðið eins og það á að líta út eftir kallið.
//
// PUT lýsir lokastöðunni, ekki breytingunum einum: reitur sem þú sleppir er
// hreinsaður. Sendu því alltaf allt tilboðið.
const externalId = 'SKU-1042';

const tilbod = {
  name: 'Ullarkápa, dökkgrá',
  description: 'Kápa úr íslenskri ull, fóðruð.',
  offerType: 'product',
  // Verð eru heiltölur í krónum. Upphaflegt verð verður að vera raunverulegt
  // fyrra verð, sbr. kröfur Neytendastofu.
  originalPrice: 49900,
  discountedPrice: 34900,
  url: 'https://nordurljos.is/vorur/ullarkapa-dokkgra',
  imageUrls: ['https://cdn.nordurljos.is/vorur/1042/a.jpg'],
  categoryPathKey: 'clothing/women/outerwear',
  brand: 'Norðurljós',
  storeIds: 'all',
  isDraft: false,
};

/**
 * Flokkar villu í það sem á að gera við hana.
 * Skilar 'retry' (reyna aftur), 'fix' (laga gögn) eða 'stop' (stöðva).
 */
function flokkaVillu(code) {
  switch (code) {
    case 'rate_limited':
    case 'internal_error':
      return 'retry';
    case 'validation_failed':
    case 'not_found':
    case 'batch_too_large':
      return 'fix';
    default:
      // Auðkenningar- og áskriftarvillur, og allir kóðar sem þessi útgáfa
      // þekkir ekki. Enginn fjöldi endurtekninga lagar þá.
      return 'stop';
  }
}

async function sendaTilbod() {
  const svar = await fetch(`${BASE_URL}/offers/${encodeURIComponent(externalId)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tilbod),
  });

  // Hraðatakmörkunin: lestu hana úr hverju svari og hægðu á þér í tíma.
  const eftir = svar.headers.get('X-RateLimit-Remaining');
  if (eftir !== null) {
    console.log(`Beiðnir eftir á þessari mínútu: ${eftir}`);
  }

  if (svar.ok) {
    const nidurstada = await svar.json();
    const adgerd = svar.status === 201 ? 'stofnað' : 'uppfært';
    console.log(`Tilboð ${adgerd}: ${nidurstada.externalId} (${nidurstada.id})`);
    return nidurstada;
  }

  // Villur eru application/problem+json með stöðugum code reit.
  const villa = await svar.json();
  console.error(`Villa ${svar.status}: ${villa.code}`);
  console.error(`  ${villa.detail ?? villa.title}`);

  // Staðfestingarvillur bera lista yfir reitina sem brugðust.
  for (const reitur of villa.fields ?? []) {
    console.error(`  reitur ${reitur.field}: ${reitur.message} (${reitur.code})`);
  }

  const vidbrogd = flokkaVillu(villa.code);
  if (vidbrogd === 'retry') {
    const bid = Number(svar.headers.get('Retry-After')) || 60;
    console.error(`  Reyndu aftur eftir ${bid} sekúndur.`);
  } else if (vidbrogd === 'stop') {
    console.error('  Uppsetningin eða áskriftin er ekki í lagi. Láttu vita.');
  }

  process.exit(1);
}

await sendaTilbod();
