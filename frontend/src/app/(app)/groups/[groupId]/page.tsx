"use client";

import { useParams } from "next/navigation";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";

export default function GroupWorkspacePage() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <div className="flex h-full w-full">
      <div className="absolute left-4 top-4 z-10 rounded bg-slate-800 px-3 py-1 text-xs text-white">
        Group: {groupId}
      </div>
      <WorkspaceLayout />
    </div>
  );
}
