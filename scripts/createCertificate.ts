import { rename } from "node:fs/promises";
import { getLocalIp } from "./getLocalIp.js";
import { $ } from "execa";
import { existsSync, mkdirSync } from "node:fs";

const localIp = getLocalIp();

await $(`mkcert ${localIp}`);

if (!existsSync("certificates")) {
  mkdirSync("certificates");
}

const keyFile = localIp + "-key.pem";
const certFile = localIp + ".pem";
await rename(keyFile, "./certificates/" + keyFile);
await rename(certFile, "./certificates/" + certFile);
