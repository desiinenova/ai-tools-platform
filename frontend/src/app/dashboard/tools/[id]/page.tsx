import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolDetailsPage } from "@/components/tools/ToolDetailsPage";

export const metadata: Metadata = {
  title: "Tool Details — AI Tools Platform",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const toolId = Number(id);

  if (!Number.isInteger(toolId) || toolId <= 0) {
    notFound();
  }

  return <ToolDetailsPage toolId={toolId} />;
}
