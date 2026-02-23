import { formatCrackTime, CRACK_HARDWARE_PROFILES } from "../core/index.js";

/**
 * Format output as text
 */
export function formatText(result, hardwareProfile = "rtx4090") {
  const lines = [];
  
  if (Array.isArray(result)) {
    // Multiple results (e.g., user IDs)
    lines.push("Generated:");
    result.forEach((item, idx) => {
      lines.push(`  ${idx + 1}. ${item.value}`);
      if (item.entropy !== undefined) {
        lines.push(`     Entropy: ${item.entropy.toFixed(1)} bits`);
        if (item.crackTime) {
          const time = item.crackTime[hardwareProfile] || item.crackTime.rtx4090;
          lines.push(`     Est. crack time (${hardwareProfile}): ${formatCrackTime(time)}`);
        }
      }
    });
  } else {
    // Single result
    lines.push(`Generated: ${result.value}`);
    if (result.entropy !== undefined) {
      lines.push(`Entropy: ${result.entropy.toFixed(1)} bits`);
      if (result.crackTime) {
        const time = result.crackTime[hardwareProfile] || result.crackTime.rtx4090;
        lines.push(`Est. crack time (${hardwareProfile}): ${formatCrackTime(time)}`);
      }
    }
  }
  
  return lines.join("\n");
}

/**
 * Format output as JSON
 */
export function formatJSON(result) {
  return JSON.stringify(result, null, 2);
}
