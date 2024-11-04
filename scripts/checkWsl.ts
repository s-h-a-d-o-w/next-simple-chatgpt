import os from "os";

if (
  Boolean(process.env.WSL_DISTRO_NAME) ||
  os.release().toLowerCase().includes("microsoft")
) {
  console.log("===============================");
  console.log("WSL is not supported.");
  console.log("===============================");
  process.exit(1);
}
