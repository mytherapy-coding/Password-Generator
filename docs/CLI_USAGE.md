# CLI Tool Usage Guide

## Prerequisites

1. **Build the project first**:
   ```bash
   npm run build
   ```

   This creates `dist/cli/index.js` from the TypeScript source.

## Running the CLI

### Method 1: Direct Node Execution (Recommended)

Run the built CLI directly with Node:

```bash
node dist/cli/index.js <command> [options]
```

### Method 2: Using npm link (Global Command)

1. **Link the package**:
   ```bash
   npm link
   ```

2. **Run using the command name**:
   ```bash
   securegen <command> [options]
   ```

## Available Commands

### 1. Generate Password (`pwd`)

**Basic usage:**
```bash
node dist/cli/index.js pwd --len 16
```

**With options:**
```bash
node dist/cli/index.js pwd --len 20 --mode strong --lowercase --uppercase --digits --symbols
```

**Options:**
- `--len <number>` - Password length (required)
- `--mode <mode>` - Mode: `strong`, `icloud`, `easyWrite`, `easySay`, `passphrase`
- `--lowercase` - Include lowercase letters
- `--uppercase` - Include uppercase letters
- `--digits` - Include digits
- `--symbols` - Include symbols
- `--symbols-set <string>` - Custom symbol set
- `--json` - Output in JSON format

**Examples:**
```bash
# Strong password
node dist/cli/index.js pwd --len 16 --mode strong --lowercase --uppercase --digits --symbols

# iCloud-style password
node dist/cli/index.js pwd --mode icloud

# Easy to write password
node dist/cli/index.js pwd --mode easyWrite --len 12

# Easy to say password
node dist/cli/index.js pwd --mode easySay --syllables 3
```

### 2. Generate Passphrase (`passphrase`)

**Usage:**
```bash
node dist/cli/index.js passphrase --words 6 --sep "-"
```

**Options:**
- `--words <number>` - Number of words (default: 6)
- `--sep <string>` - Separator (default: " ")
- `--capitalize` - Capitalize first letter of each word
- `--add-digits` - Add digits at the end
- `--json` - Output in JSON format

**Examples:**
```bash
# Basic passphrase
node dist/cli/index.js passphrase --words 6

# With separator and capitalization
node dist/cli/index.js passphrase --words 6 --sep "-" --capitalize

# With digits
node dist/cli/index.js passphrase --words 6 --add-digits
```

### 3. Generate iCloud Password (`icloud`)

**Usage:**
```bash
node dist/cli/index.js icloud --count 5
```

**Options:**
- `--count <number>` - Number of passwords to generate (default: 1)
- `--json` - Output in JSON format

**Example:**
```bash
node dist/cli/index.js icloud --count 5
```

### 4. Generate User ID (`userid`)

**CVC Mode:**
```bash
node dist/cli/index.js userid --mode cvc --syllables 2 --count 10
```

**Words Mode:**
```bash
node dist/cli/index.js userid --mode words --words-count 2 --count 10
```

**Options:**
- `--mode <mode>` - Mode: `cvc` or `words` (required)
- `--syllables <number>` - Number of syllables (CVC mode, default: 2)
- `--words-count <number>` - Number of words (Words mode, default: 2)
- `--add-digits` - Add digits
- `--digits-count <number>` - Number of digits (default: 2)
- `--add-suffix` - Add suffix
- `--suffix <string>` - Suffix text
- `--max-length <number>` - Maximum length (default: 20)
- `--count <number>` - Number of IDs to generate (default: 10)
- `--json` - Output in JSON format

**Examples:**
```bash
# CVC user IDs
node dist/cli/index.js userid --mode cvc --syllables 2 --count 10

# Words user IDs
node dist/cli/index.js userid --mode words --words-count 2 --count 10

# With digits and suffix
node dist/cli/index.js userid --mode cvc --syllables 2 --add-digits --digits-count 3 --add-suffix --suffix "dev" --count 5
```

## JSON Output

Add `--json` flag to any command for machine-readable output:

```bash
node dist/cli/index.js pwd --len 16 --json
```

Output:
```json
{
  "value": "xK9#mP2$vL8@nQ4",
  "entropy": 95.3,
  "crackTime": {
    "cpu": 1234567890,
    "rtx4090": 123456,
    "rig8x4090": 12345,
    "datacenter": 1234
  }
}
```

## Hardware Profile for Crack Time

The CLI uses the default hardware profile for crack time estimation. The output shows crack time for:
- CPU
- RTX 4090
- Rig (8x RTX 4090)
- Datacenter

## Quick Test

After building, test the CLI:

```bash
# Test password generation
node dist/cli/index.js pwd --len 16

# Test passphrase
node dist/cli/index.js passphrase --words 6

# Test iCloud
node dist/cli/index.js icloud

# Test user ID
node dist/cli/index.js userid --mode cvc --count 5
```

## Troubleshooting

### "Cannot find module" error
- Make sure you've run `npm run build` first
- Check that `dist/cli/index.js` exists

### "Permission denied" error
- The CLI file should have execute permissions (added by build script)
- If not, run: `chmod +x dist/cli/index.js`

### "Command not found" (when using securegen)
- Make sure you've run `npm link` first
- Or use `node dist/cli/index.js` directly

## Examples

```bash
# Generate a strong 20-character password
node dist/cli/index.js pwd --len 20 --mode strong --lowercase --uppercase --digits --symbols

# Generate 5 passphrases with dashes
node dist/cli/index.js passphrase --words 6 --sep "-" --count 5

# Generate 10 CVC user IDs with 3 digits
node dist/cli/index.js userid --mode cvc --syllables 2 --add-digits --digits-count 3 --count 10

# Get JSON output
node dist/cli/index.js pwd --len 16 --json
```
