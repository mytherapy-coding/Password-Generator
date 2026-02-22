#!/usr/bin/env python3
"""
Download EFF Long Wordlist and convert to JSON format
"""

import json
import urllib.request
import ssl
import sys

URL = "https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt"
OUTPUT = "data/diceware_words.json"

print("Downloading EFF Long Wordlist...")
try:
    # Create SSL context that doesn't verify certificates (for sandbox environments)
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    with urllib.request.urlopen(URL, context=ssl_context) as response:
        content = response.read().decode('utf-8')
    
    words = []
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        # Format: "11111	word" or "11111 word"
        parts = line.split()
        if len(parts) >= 2:
            word = parts[1].strip()
            if word:
                words.append(word)
    
    print(f"Downloaded {len(words)} words")
    
    if len(words) != 7776:
        print(f"Warning: Expected 7776 words, got {len(words)}")
    
    # Write JSON file
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully saved {len(words)} words to {OUTPUT}")
    print(f"First 5 words: {words[:5]}")
    print(f"Last 5 words: {words[-5:]}")
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
