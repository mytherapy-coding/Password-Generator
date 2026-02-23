/**
 * Minimal argument parser for CLI
 * Supports --key value and --key=value formats
 */

export interface ParsedArgs {
  command: string | null;
  flags: Record<string, boolean>;
  options: Record<string, string>;
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: null,
    flags: {},
    options: {}
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg.startsWith("--")) {
      // Check for --key=value format
      if (arg.includes("=")) {
        const [key, value] = arg.slice(2).split("=", 2);
        result.options[key] = value;
        i += 1;
      } else {
        const key = arg.slice(2);
        // Check if next arg is a value (not a flag and not starting with --)
        if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
          result.options[key] = args[i + 1];
          i += 2;
        } else {
          result.flags[key] = true;
          i += 1;
        }
      }
    } else if (!result.command) {
      result.command = arg;
      i += 1;
    } else {
      i += 1;
    }
  }

  return result;
}
