#!/usr/bin/env node
// Stílathugun fyrir skjölun Mist API.
//
// Reglan er hörð: hvergi í geymslunni má nota þankastrik (U+2014) eða
// stutt þankastrik (U+2013). Notaðu kommu, tvípunkt, sviga eða orðið
// "til" þegar þú lýsir bili milli talna. Skriftan les allar skrár sem
// git fylgist með (git ls-files), sleppir tvíundarskrám og prentar
// skrá:lína:dálkur fyrir hvert tilvik sem finnst.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FORBIDDEN = [
  { char: '\u2014', name: 'þankastrik (U+2014)' },
  { char: '\u2013', name: 'stutt þankastrik (U+2013)' },
];

// Skráarendingar sem eru ekki texti og því ekki lesnar.
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico',
  '.pdf', '.zip', '.gz', '.tgz', '.woff', '.woff2', '.ttf', '.otf',
  '.eot', '.mp4', '.mp3', '.wasm',
]);

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return output.split('\0').filter(Boolean);
}

function isTextFile(file) {
  return !BINARY_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function findingsFor(file) {
  let contents;
  try {
    contents = readFileSync(file, 'utf8');
  } catch {
    // Skrá sem git þekkir en er ekki á disknum (t.d. eydd skrá í vinnutrénu).
    return [];
  }

  const found = [];
  contents.split(/\r?\n/).forEach((line, index) => {
    for (const { char, name } of FORBIDDEN) {
      let column = line.indexOf(char);
      while (column !== -1) {
        found.push({
          file,
          line: index + 1,
          column: column + 1,
          name,
          excerpt: line.trim().slice(0, 100),
        });
        column = line.indexOf(char, column + 1);
      }
    }
  });
  return found;
}

function main() {
  const files = trackedFiles().filter(isTextFile);

  if (files.length === 0) {
    console.log('check-style: engin skrá er undir eftirliti git, ekkert var athugað.');
    console.log('Ábending: keyrðu "git add -A" áður en þú lintar nýjar skrár.');
    return 0;
  }

  const findings = files.flatMap(findingsFor);

  if (findings.length === 0) {
    console.log(`check-style: ${files.length} skrár athugaðar, engin bönnuð strik fundust.`);
    return 0;
  }

  console.error('check-style: bönnuð strik fundust:');
  for (const f of findings) {
    console.error(`${f.file}:${f.line}:${f.column}: ${f.name}: ${f.excerpt}`);
  }
  console.error('');
  console.error(`Samtals ${findings.length} tilvik. Notaðu kommu, tvípunkt, sviga eða "til".`);
  return 1;
}

process.exit(main());
