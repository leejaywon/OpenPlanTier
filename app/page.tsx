import type { Metadata } from "next";
import { CatalogApp } from "./catalog-app";

export const metadata: Metadata = {
  title: "OpenPlanTier — Open-source platform builder",
  description:
    "Discover, compare, combine, and download open-source projects for building a Palantir-like platform.",
};

export default function Home() {
  return <CatalogApp />;
}
