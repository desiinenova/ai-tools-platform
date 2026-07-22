import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">AI Tools Platform</h1>
      <HealthStatus />
    </main>
  );
}
