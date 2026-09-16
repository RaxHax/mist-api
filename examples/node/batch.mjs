// Sendir mörg tilboð í Mist í lotum.
//
// Sýnir þrennt sem raunveruleg samstilling þarf:
//   1. Skiptingu í lotur af 100, hámarkinu sem viðmótið tekur við.
//   2. Bið á 429 samkvæmt Retry-After hausnum.
//   3. Lestur á results, því svarið er 200 þótt færslur mistakist.
//
// Engin aðfong: notar innbyggða fetch í Node 18 og nýrri.
//
// Notkun:
//   MIST_API_KEY=mist_live_... node batch.mjs
//
// Forútgáfa: endapunktarnir svara ekki ennþá.

const API_KEY = process.env.MIST_API_KEY;
const BASE_URL = process.env.MIST_BASE_URL ?? 'https://mist.is/api/v1';

// Hámarksfjöldi færslna í lotu. Stærri lota er felld með batch_too_large.
const LOTUSTAERD = 100;

if (!API_KEY) {
  console.error('Settu MIST_API_KEY fyrst, til dæmis: export MIST_API_KEY=mist_live_...');
  process.exit(1);
}

// Í alvöru kerfi kæmi þetta úr vöruskránni þinni. Hér eru þrjú tilboð, og
// þriðja er viljandi rangt til að sýna hvernig villa í einni færslu lítur út.
const tilbod = [
  {
    externalId: 'SKU-1042',
    name: 'Ullarkápa, dökkgrá',
    originalPrice: 49900,
    discountedPrice: 34900,
    url: 'https://nordurljos.is/vorur/ullarkapa-dokkgra',
    categoryPathKey: 'clothing/women/outerwear',
    brand: 'Norðurljós',
    storeIds: 'all',
  },
  {
    externalId: 'SKU-1043',
    name: 'Ullarhúfa',
    originalPrice: 6900,
    discountedPrice: 4900,
    url: 'https://nordurljos.is/vorur/ullarhufa',
    categoryPathKey: 'clothing/unisex/accessories',
    brand: 'Norðurljós',
    storeIds: 'all',
  },
  {
    externalId: 'SKU-1044',
    name: 'Herraskór, brúnir',
    // Rangt: afsláttarverð má ekki vera hærra en upphaflegt verð.
    originalPrice: 32900,
    discountedPrice: 39900,
    url: 'https://nordurljos.is/vorur/herraskor-brunir',
    categoryPathKey: 'clothing/men/footwear',
    brand: 'Norðurljós',
    storeIds: 'all',
  },
];

function sofa(ms) {
  return new Promise((leysa) => setTimeout(leysa, ms));
}

/** Skiptir lista í búta af tiltekinni stærð. */
function skipta(listi, staerd) {
  const bitar = [];
  for (let i = 0; i < listi.length; i += staerd) {
    bitar.push(listi.slice(i, i + staerd));
  }
  return bitar;
}

/**
 * Sendir eina lotu og bíður sjálfkrafa þegar hraðatakmörkunin svarar 429.
 * Beiðni sem fékk 429 komst ekki í gegn, svo óhætt er að senda hana óbreytta.
 */
async function sendaLotu(lota, { maxTilraunir = 5 } = {}) {
  for (let tilraun = 0; tilraun < maxTilraunir; tilraun += 1) {
    const svar = await fetch(`${BASE_URL}/offers/batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offers: lota }),
    });

    if (svar.status === 429) {
      // Traustu hausnum. Að reyna fyrr skilar öðru 429 og eyðir næsta kvóta.
      const bid = Number(svar.headers.get('Retry-After')) || 60;
      console.warn(`Hraðatakmörkun fullnýtt, bíð í ${bid} sekúndur.`);
      await sofa(bid * 1000);
      continue;
    }

    if (svar.status >= 500) {
      // Vaxandi bið með slembiþætti, svo mörg kerfi komi ekki öll í sömu andrá.
      const bid = 2 ** tilraun * (1 + Math.random() * 0.3);
      console.warn(`Villa ${svar.status} hjá Mist, bíð í ${bid.toFixed(1)} sekúndur.`);
      await sofa(bid * 1000);
      continue;
    }

    if (!svar.ok) {
      const villa = await svar.json();
      throw new Error(`${villa.code}: ${villa.detail ?? villa.title}`);
    }

    return svar.json();
  }

  throw new Error('Lotan komst ekki í gegn eftir margar tilraunir.');
}

async function keyra() {
  const lotur = skipta(tilbod, LOTUSTAERD);
  let felld = 0;

  for (const [nr, lota] of lotur.entries()) {
    console.log(`Lota ${nr + 1} af ${lotur.length}: ${lota.length} tilboð.`);

    const nidurstada = await sendaLotu(lota);
    const { total, created, updated, failed } = nidurstada.summary;
    console.log(`  ${total} færslur: ${created} stofnaðar, ${updated} uppfærðar, ${failed} felldar.`);

    // 200 þýðir ekki að allt hafi gengið. Farðu alltaf í gegnum results.
    for (const faersla of nidurstada.results) {
      if (faersla.status !== 'failed') continue;

      felld += 1;
      console.error(`  ${faersla.externalId}: ${faersla.error.detail ?? faersla.error.title}`);
      for (const reitur of faersla.error.fields ?? []) {
        console.error(`    reitur ${reitur.field}: ${reitur.code}`);
      }
    }
  }

  if (felld > 0) {
    console.error(`Samtals ${felld} færslur féllu. Lagaðu gögnin og sendu þær aftur.`);
    process.exit(1);
  }

  console.log('Allar færslur komust í gegn.');
}

await keyra();
