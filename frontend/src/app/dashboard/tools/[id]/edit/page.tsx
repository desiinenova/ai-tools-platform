import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolForm } from "@/components/tools/ToolForm";

export const metadata: Metadata = {
  title: "Edit Tool — AI Tools Platform",
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

  return <ToolForm mode="edit" toolId={toolId} />;
}
