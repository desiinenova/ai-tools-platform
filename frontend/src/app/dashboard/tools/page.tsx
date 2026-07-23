import type { Metadata } from "next";
import { ToolsPage } from "@/components/tools/ToolsPage";

export const metadata: Metadata = {
  title: "AI Tools — AI Tools Platform",
};

export default function Page() {
  return <ToolsPage />;
}
