import dynamic from "next/dynamic";

export const Dialog = dynamic(() => import("./DialogImplementation"), {
  ssr: false,
});
