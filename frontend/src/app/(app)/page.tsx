"use client";

import NavDrawer from "@/components/NavDrawer";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import GoalsTreeView from "@/components/GoalsTreeView";
import { useStore } from "@/store";

export default function AppPage() {
  const activeView = useStore((s) => s.activeView);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <NavDrawer />
      <main className="flex-1 overflow-hidden">
        {activeView === "home" && <WorkspaceLayout />}
        {activeView === "goals" && <GoalsTreeView />}
        {activeView === "teams" && <TeamsPlaceholder />}
        {activeView === "groups" && <GroupsPlaceholder />}
        {activeView === "settings" && <SettingsPlaceholder />}
      </main>
    </div>
  );
}

function TeamsPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-slate-400">Teams view — coming soon</p>
    </div>
  );
}

function GroupsPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-slate-400">Groups view — coming soon</p>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-slate-400">Settings — coming soon</p>
    </div>
  );
}
