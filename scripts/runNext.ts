import { getLocalIp } from "./getLocalIp.js";
import { execSync } from "node:child_process";

const localIp = getLocalIp();

execSync(
  `pnpm next dev --turbopack -H ${localIp} --experimental-https --experimental-https-key certificates/${localIp}-key.pem --experimental-https-cert certificates/${localIp}.pem`,
  { stdio: "inherit" },
);
