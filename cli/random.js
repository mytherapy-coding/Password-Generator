// cli/random.js
import { randomInt as nodeRandomInt } from "node:crypto";

export function randomInt(max) {
  return nodeRandomInt(max);
}
