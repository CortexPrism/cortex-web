import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import AdminClientLayout from "./AdminClientLayout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/admin` },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
