import { v4 as uuidv4 } from "uuid";
import { isTest } from "./consts";

export function generateSessionId() {
  return isTest ? "e2e-" + uuidv4() : uuidv4();
}
