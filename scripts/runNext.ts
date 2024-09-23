import { getLocalIp } from "./getLocalIp.js";
import { $ } from "execa";

const localIp = getLocalIp();

await $({ stdout: "inherit", stderr: "inherit" })(
  `pnpm next dev -H ${localIp} --experimental-https --experimental-https-key certificates/${localIp}-key.pem --experimental-https-cert certificates/${localIp}.pem`,
);
