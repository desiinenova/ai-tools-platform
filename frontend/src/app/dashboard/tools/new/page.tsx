import type { Metadata } from "next";
import { ToolForm } from "@/components/tools/ToolForm";

export const metadata: Metadata = {
  title: "Add Tool — AI Tools Platform",
};

export default function Page() {
  return <ToolForm mode="create" />;
}
