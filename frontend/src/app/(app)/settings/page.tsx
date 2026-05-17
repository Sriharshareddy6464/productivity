"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const sections = [
  { title: "Profile", description: "Manage your display name and avatar" },
  { title: "Notifications", description: "Configure email and push notifications" },
  { title: "Display", description: "Theme, layout, and accessibility preferences" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Settings</h1>
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium text-slate-900">{section.title}</h3>
              <p className="text-sm text-slate-500">{section.description}</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
