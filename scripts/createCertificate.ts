import { rename } from "node:fs/promises";
import { getLocalIp } from "./getLocalIp.js";
import { existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const localIp = getLocalIp();

execSync(`mkcert ${localIp}`);

if (!existsSync("certificates")) {
  mkdirSync("certificates");
}

const keyFile = localIp + "-key.pem";
const certFile = localIp + ".pem";
await rename(keyFile, "./certificates/" + keyFile);
await rename(certFile, "./certificates/" + certFile);
