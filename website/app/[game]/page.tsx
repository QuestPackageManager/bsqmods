import { Metadata } from "next";
import Head from "next/head";
import Image from "next/image";
import { ModsCollection } from "../Types";
const mods: ModsCollection = require("../../public/mods.json")

type Params = { params: { game: string } }

export function generateStaticParams() {
  return Object.keys(mods).map(version => ({
    game: version
  }));
}

export function generateMetadata({ params }: Params): Metadata {
  return {
    title: `Quest Beat Saber Mods for ${params.game}`
  }
}

export default function Page({ params }: Params) {
  return (
    <>
      <ul>
        {mods[params.game].map((mod, index) => (
          <li key={index}>
            <a href={mod.download}>
            {mod.cover != null ? (<><img src={mod.cover} /><br /></>) : null}
              {mod.name} v{mod.version}
              </a>
            </li>
        ))}
      </ul>
    </>
  );
}
