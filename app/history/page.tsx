import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { HistoryView } from "@/components/history/HistoryView";

export const metadata: Metadata = { title: "History · Pram's home gym log" };

export default function HistoryPage() {
  return <Page><HistoryView /></Page>;
}
