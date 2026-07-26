import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Log in — AI Tools Platform",
};

export default function Page() {
  return <LoginPage />;
}
