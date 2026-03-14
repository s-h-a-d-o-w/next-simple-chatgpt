import "@/styles/prism-theme.css";
import { fetchModels } from "@/lib/server/models";
import HomeClient from "./HomeClient";

export default async function Home() {
  return <HomeClient initialModels={await fetchModels()} />;
}
