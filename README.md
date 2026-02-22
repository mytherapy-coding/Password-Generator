# Password-Generator
A simple and customizable password generator that creates secure random passwords.

# 🔐 Password Generator

A clean, modern, customizable password generator built with HTML, CSS, and JavaScript.  
It allows users to generate secure passwords with adjustable length, character sets, custom symbols, and an optional iCloud‑style preset.

This project includes real‑time validation, entropy‑based strength calculation, and a polished UI that follows the original project design guidelines.

---

## ✨ Features

- Adjustable password length (4–64)
- Choose character types:
  - Lowercase (a–z)
  - Uppercase (A–Z)
  - Numbers (0–9)
  - Symbols (customizable)
- Custom symbol input with validation
- iCloud‑style preset mode (Apple‑like password format)
- Password strength meter (entropy‑based)
- **Password crack-time estimation** (offline attack, real hardware)
  - Multiple hardware profiles (CPU, RTX 4090, datacenter)
  - Shows entropy, keyspace, and estimated crack time
  - Educational tool to understand password security
- Copy‑to‑clipboard button
- Clear button to reset the UI
- Real‑time validation and disabled Generate button when inputs are invalid
- Clean, modern UI with smooth interactions

---

## 🧠 Password Strength

Strength is calculated using entropy:

entropy = length × log2(poolSize)


Strength levels:
- **Weak**: under 45 bits  
- **Medium**: 45–70 bits  
- **Strong**: 70+ bits

## 🔑 Passphrase Generator (Diceware-style)

The generator includes a **Passphrase (Diceware)** mode that creates secure, memorable passphrases using a fixed word list and uniform cryptographic randomness.

### What is Diceware?

Diceware is a method for creating strong passphrases by:
- Selecting multiple random words from a fixed list
- Each word is chosen uniformly at random (no patterns or weighting)
- Security comes from entropy, not complexity or symbols
- Widely recommended for master passwords and other high-security scenarios where memorability matters

### Word List

This generator uses the **EFF Long Wordlist** published by the Electronic Frontier Foundation:
- **Source**: https://www.eff.org/dice
- **Size**: 7,776 words
- **Design**: Curated to avoid offensive, ambiguous, or hard-to-type words
- **Purpose**: Designed specifically for Diceware-style passphrases

### Entropy Calculation

For Diceware passphrases, entropy is calculated as:

```
entropy = wordCount × log₂(wordListSize)
```

Where:
- **wordCount** = number of words in the passphrase (4–8)
- **wordListSize** = size of the word list (7,776 for EFF Long Wordlist)

**Example**: A 6-word passphrase from a 7,776-word list:
- Entropy = 6 × log₂(7,776) ≈ 6 × 12.92 ≈ **77.5 bits**

This provides strong security while remaining memorable.

### Optional Enhancements

The generator supports optional enhancements that add minimal entropy:
- **Capitalize one random word**: Adds log₂(wordCount) bits
- **Add digits at the end (2 digits)**: Adds log₂(100) ≈ 6.64 bits

### Why Not Use UserID Word Lists?

The UserID generator uses broader word lists (adjectives and nouns) that are:
- Not designed for uniform security guarantees
- May contain ambiguous or hard-to-type words
- Not optimized for passphrase generation

Diceware word lists are specifically curated for security and memorability, making them the correct choice for passphrase generation.

## ⏱️ Password Crack Time Estimation

The generator includes realistic offline password crack-time estimation based on:

- **Entropy (H)**: Calculated from password length and character pool size
- **Keyspace (K)**: Total possible passwords = 2^H
- **Expected crack time (T)**: Average time to crack = 0.5 × K / R
  - Where R = guesses per second (hardware-dependent)

### Hardware Profiles

You can select different attacker hardware profiles:
- **High-end CPU**: ~1×10⁹ guesses/sec
- **RTX 4090**: ~5×10¹¹ guesses/sec
- **8× RTX 4090 rig**: ~4×10¹² guesses/sec
- **Datacenter attacker**: ~1×10¹⁴ guesses/sec

### Assumptions (Worst-Case Scenario)

The crack-time estimate assumes:
- ✅ **Offline attack**: Attacker already has the password hash
- ✅ **Fast hashing**: Using fast algorithms (MD5, NTLM, SHA-1)
- ✅ **No rate limiting**: Unlimited guesses per second
- ✅ **No lockouts**: No account protection mechanisms
- ✅ **Modern hardware**: High-end CPU/GPU as selected

**Important Note**: This is *not* online login guessing. Real systems using slow hashing (bcrypt, Argon2id, PBKDF2) can increase attack time by orders of magnitude. This estimate is educational and demonstrates why stronger passwords matter.  

### How Crack Time is Estimated

Crack time is estimated assuming an offline attacker using fast password hashing. Real systems using Argon2id or bcrypt significantly slow down attacks.

#### Entropy Definition

**Entropy (H)** measures the randomness and unpredictability of a password. It's calculated as:

```
H = length × log₂(poolSize)
```

Where:
- **length** = number of characters in the password
- **poolSize** = number of possible characters at each position (e.g., 26 for lowercase only, 62 for alphanumeric, 94 for full ASCII)

Higher entropy means more possible password combinations, making it harder to guess.

#### Expected-Time Formula

The estimated crack time uses the following formula:

```
T = 0.5 × K / R
```

Where:
- **T** = Expected crack time (in seconds)
- **K** = Keyspace = 2^H (total possible password combinations)
- **R** = Guesses per second (hardware-dependent attack rate)
- **0.5** = Average case factor (on average, an attacker needs to try 50% of the keyspace)

The keyspace grows exponentially with entropy: each additional bit of entropy doubles the number of possible passwords.

#### Offline vs Online Attacks

**Offline Attack** (what this tool estimates):
- Attacker has already obtained the password hash from a compromised database
- Can make unlimited guesses per second without rate limiting
- Uses fast hashing algorithms (MD5, SHA-1, NTLM) for speed
- This is the worst-case scenario for password security

**Online Attack** (not estimated here):
- Attacker tries to guess passwords through login interfaces
- Rate limited by the system (e.g., 3 attempts per minute)
- Account lockouts after failed attempts
- Much slower and less effective than offline attacks

#### Disclaimer About Hashing Algorithms

The crack-time estimates assume **fast hashing algorithms** like MD5, SHA-1, or NTLM, which allow attackers to test billions of password guesses per second.

**Real-world systems** use **slow password hashing** algorithms designed to resist brute-force attacks:
- **bcrypt**: Configurable work factor, slows down hashing
- **Argon2id**: Memory-hard function, winner of Password Hashing Competition
- **PBKDF2**: Key derivation function with iteration count

These algorithms can increase attack time by **orders of magnitude** (100x to 1,000,000x slower), making even moderate-strength passwords practically uncrackable in offline attacks.

**Example**: A password that might be cracked in 1 day with MD5 could take 100+ years with Argon2id, even with the same hardware.

---

## 📦 Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Crypto API** for secure random generation

---

## 🚀 How to Use

1. Choose your desired password length.
2. Select the character types you want to include.
3. (Optional) Enter custom symbols if the Symbols option is enabled.
4. (Optional) Enable the iCloud preset for an Apple‑style password.
5. Click **Generate** to create a password.
6. Click **Copy** to copy it to your clipboard.
7. Click **Clear** to reset the interface.

### User ID Generator
1. Choose syllables (2 or 3).
2. Enable/disable digits and suffix.
3. Set max length.
4. Choose how many IDs to generate.
5. Click **Generate User IDs**.
6. Copy any ID using its button.

---


## 🖼️ Screenshot

*(Add a screenshot of your app here once deployed)*

---

## 🌐 Live Demo

Once published with GitHub Pages, your live link will go here:


https://mytherapy-coding.github.io/Password-Generator/

---

## 📄 License

This project is open‑source and available under the MIT License.

---
## 🖼️ Screenshot

![Password Generator Screenshot](./screenshot.png)

## 🆔 User ID Generator 

This project includes a fully featured **User ID / handle generator** that creates readable, pronounceable usernames using a secure CVC (consonant–vowel–consonant) pattern.

### ✨ Features

- Generates usernames using **2 or 3 CVC syllables**
  - Examples: `mivako`, `tovemi`, `geratosi`
- Optional **digits** appended at the end (2 or 3)
  - Example: `mivako27`
- Optional **suffix** with underscore
  - Example: `mivako_dev`
- User‑controlled **maximum length** with validation
- Generates **multiple suggestions at once** (5, 10, or 20)
- Each suggestion includes a **Copy** button
- Uses **crypto.getRandomValues()** for secure randomness
- Inline error handling:
  - Invalid suffix characters
  - Max length too small
  - Safety cap when valid IDs cannot be generated

### 🧠 How It Works

The generator builds usernames using this pattern:

CVC + CVC (+ CVC) + digits? + _suffix?


Where:

- **C** = consonant  
- **V** = vowel  
- Digits and suffix are optional  
- The final username must:
  - Start with a letter  
  - Fit within the max length  
  - Contain only allowed characters  

### 🎛️ UI Behavior

- Digits count input enables/disables automatically  
- Suffix input enables/disables automatically  
- Pressing **Enter** inside the User ID section regenerates suggestions  
- Results are displayed in a styled list with monospace usernames and copy buttons  

### 📋 Example Output

mivako
tovemi
geratosi
mivako27
mivako_dev

### 🧩 Technologies Used

- Vanilla JavaScript  
- Secure randomness via `crypto.getRandomValues()`  
- DOM manipulation for dynamic UI updates  
- CSS for layout and styling  

### ✔ Status


User ID generator fully implemented, validated, styled, and documented.
