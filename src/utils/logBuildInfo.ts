import { isDev } from "./consts";

if (!isDev) {
  const buildInfo = process.env["NEXT_PUBLIC_BUILD_INFO"]?.split(",");
  if (buildInfo && buildInfo[0]) {
    console.log(
      new Date(parseInt(buildInfo[0], 10)).toLocaleString(),
      buildInfo[1],
    );
  }
}
