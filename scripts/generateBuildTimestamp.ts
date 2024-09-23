import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const envPath = ".env.local";
const buildInfoKey = "NEXT_PUBLIC_BUILD_INFO";
const commitSha = execSync("git rev-parse HEAD").toString().trim();
const buildInfo = `\n\n${buildInfoKey}=${Date.now().toString()},${commitSha}\n`;

let content = "";
if (existsSync(envPath)) {
  content = readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => !line.startsWith(buildInfoKey))
    .join("\n")
    .trim();
}
content += buildInfo;

writeFileSync(envPath, content);
