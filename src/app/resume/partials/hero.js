import { getContent } from "@/lib/content";
import HeroClient from "./heroClient";

export default async function Hero(props) {
  const technologies = await getContent("technologies");
  return <HeroClient {...props} technologies={technologies} />;
}
