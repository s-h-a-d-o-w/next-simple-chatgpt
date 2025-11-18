import { getLocalIp } from "./getLocalIp.js";
import { spawn } from "node:child_process";

const localIp = getLocalIp();

const isE2E = process.argv.includes("--e2e");

const args = [
  "next",
  "dev",
  ...(isE2E ? [] : ["--port", "3030"]),
  "--turbopack",
  "-H",
  localIp,
  "--experimental-https",
  "--experimental-https-key",
  `certificates/${localIp}-key.pem`,
  "--experimental-https-cert",
  `certificates/${localIp}.pem`,
];

const child = spawn("pnpm", args as string[], {
  env: { ...process.env, CI: isE2E ? "true" : "false", FORCE_COLOR: "1" },
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

child.stdout?.pipe(process.stdout);
child.stderr?.pipe(process.stderr);

child.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
