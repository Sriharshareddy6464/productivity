"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useStore } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function GoalsColumn() {
  const { activeGoalId, selectGoal } = useStore();
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get("/goals").then((r) => r.data),
  });

  const handleCreate = async () => {
    if (!title.trim()) return;
    await api.post("/goals", { title });
    setTitle("");
    setAdding(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Goals</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>+ Add</Button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Goal title..."
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
        {goals?.map((goal: any) => (
          <Card
            key={goal.id}
            className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 ${
              activeGoalId === goal.id ? "ring-2 ring-slate-900" : ""
            }`}
            onClick={() => selectGoal(goal.id)}
          >
            <p className="text-sm font-medium">{goal.title}</p>
            {goal.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{goal.description}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
