import { Metadata } from "next";
import Link from "next/link";
import { ModsCollection } from "./Types";
const mods: ModsCollection = require("../public/mods.json");

export const metadata: Metadata = {
  title: "Beat Saber Mods",
};

export default function Home() {
  return (
    <ul>
      {Object.keys(mods).map((version) => (
        <li key={version}>
          <Link href={`/${version}/`}>{version}</Link>
        </li>
      ))}
    </ul>
  );
}
