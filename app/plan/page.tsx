import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { PlanView } from "@/components/plan/PlanView";

export const metadata: Metadata = { title: "Edit plan · Pram's home gym log" };

export default function PlanPage() {
  return <Page dayBar><PlanView /></Page>;
}
