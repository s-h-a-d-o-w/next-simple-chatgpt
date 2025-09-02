import { getLocalIp } from "./getLocalIp.js";
import { execSync } from "node:child_process";

const localIp = getLocalIp();

const isE2E = process.argv.includes("--e2e");

execSync(
  `cross-env CI=${isE2E} pnpm next dev ${isE2E ? "" : "--port 3030"} --turbopack -H ${localIp} --experimental-https --experimental-https-key certificates/${localIp}-key.pem --experimental-https-cert certificates/${localIp}.pem`,
  { stdio: "inherit" },
);
