"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useStore } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function MilestonesColumn() {
  const { activeGoalId, activeMilestoneId, selectMilestone } = useStore();
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones", activeGoalId],
    queryFn: () => api.get(`/goals/${activeGoalId}/milestones`).then((r) => r.data),
    enabled: !!activeGoalId,
  });

  const handleCreate = async () => {
    if (!title.trim() || !activeGoalId) return;
    await api.post(`/goals/${activeGoalId}/milestones`, { title });
    setTitle("");
    setAdding(false);
  };

  if (!activeGoalId) {
    return (
      <div className="flex flex-col gap-2 p-4 opacity-40">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Milestones</h2>
        <p className="text-xs text-slate-400">Select a goal to view milestones</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Milestones</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>+ Add</Button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Milestone title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {milestones?.map((ms: any) => (
          <Card
            key={ms.id}
            className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 ${
              activeMilestoneId === ms.id ? "ring-2 ring-slate-900" : ""
            }`}
            onClick={() => selectMilestone(ms.id)}
          >
            <p className="text-sm font-medium">{ms.title}</p>
            {ms.due_date && (
              <p className="mt-1 text-xs text-slate-500">Due: {ms.due_date}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
