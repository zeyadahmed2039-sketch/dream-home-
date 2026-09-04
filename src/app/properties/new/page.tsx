"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/agent-shell";

export default function NewPropertyPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Add New Property</h1>
      <PropertyForm onSaved={() => router.push("/agent")} isApproved />
    </div>
  );
}
