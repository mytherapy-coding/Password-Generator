// cli/random.ts
import { randomInt as nodeRandomInt } from "node:crypto";
import type { RandomIntFunction } from "../core/types.js";

export function randomInt(max: number): number {
  return nodeRandomInt(max);
}
