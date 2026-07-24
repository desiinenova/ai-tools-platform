import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Profile — AI Tools Platform",
};

export default function Page() {
  return <ProfilePage />;
}
