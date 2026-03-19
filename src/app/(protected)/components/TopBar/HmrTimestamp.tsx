import dynamic from "next/dynamic";

export const HmrTimestamp = dynamic(
  () => import("./HmrTimestampImplementation"),
  {
    ssr: false,
  },
);
