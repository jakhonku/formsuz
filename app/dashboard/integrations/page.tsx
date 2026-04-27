import { IntegrationsClient } from "@/components/dashboard/IntegrationsClient";

export const metadata = {
  title: "Google integratsiyalar — Gway",
};

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google integratsiyalar</h1>
        <p className="text-slate-500">
          Google akkauntingizdagi 7+ ta xizmatni ulang va botingizdagi javoblardan foydalaning.
        </p>
      </div>
      <IntegrationsClient />
    </div>
  );
}
