#!/usr/bin/env node

/**
 * Download and convert EFF Long Wordlist to JavaScript format
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt';
const OUTPUT_FILE = path.resolve(__dirname, '../data/diceware_words.js');

console.log('Downloading EFF Long Wordlist...');

https.get(URL, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: ${res.statusCode}`);
    process.exit(1);
  }

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Processing wordlist...');
    
    // Parse the wordlist (format: 11111 word)
    const words = [];
    const lines = data.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Extract word (everything after the number and space)
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const word = parts.slice(1).join(' ').toLowerCase();
        if (word) {
          words.push(word);
        }
      }
    }

    console.log(`Found ${words.length} words`);

    if (words.length < 7000) {
      console.error(`Warning: Expected ~7,776 words, got ${words.length}`);
    }

    // Generate JavaScript file
    const jsContent = `// EFF Long Wordlist for Diceware-style passphrases
// Source: https://www.eff.org/dice
// Full list: ${words.length} words
const DICEWARE_WORDS = ${JSON.stringify(words, null, 2)};
`;

    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
    console.log(`✓ Saved to ${OUTPUT_FILE}`);
    console.log(`✓ Total words: ${words.length}`);
  });
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
  process.exit(1);
});
