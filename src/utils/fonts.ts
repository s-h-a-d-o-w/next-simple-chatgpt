import { Aleo, Roboto_Mono } from "next/font/google";

const aleo = Aleo({
  subsets: ["latin"],
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const fonts = {
  aleo,
  robotoMono,
};
