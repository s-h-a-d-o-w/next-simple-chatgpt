import os from "os";

if (
  Boolean(process.env.WSL_DISTRO_NAME) ||
  os.release().toLowerCase().includes("microsoft")
) {
  console.log("WSL is not supported.");
  process.exit(1);
}
