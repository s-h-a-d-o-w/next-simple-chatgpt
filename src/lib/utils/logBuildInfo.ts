import { isDev } from "./consts";

if (!isDev) {
  const buildInfo = process.env["NEXT_PUBLIC_BUILD_INFO"]?.split(",");
  if (buildInfo?.[0]) {
    console.log(
      new Date(Number.parseInt(buildInfo[0], 10)).toLocaleString(),
      buildInfo[1],
    );
  }
}
