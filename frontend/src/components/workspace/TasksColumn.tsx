"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useStore } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const priorityLabels: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
};

export default function TasksColumn() {
  const { activeMilestoneId, activeTaskId, selectTask } = useStore();
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", activeMilestoneId],
    queryFn: () => api.get(`/milestones/${activeMilestoneId}/tasks`).then((r) => r.data),
    enabled: !!activeMilestoneId,
  });

  const handleCreate = async () => {
    if (!title.trim() || !activeMilestoneId) return;
    await api.post(`/milestones/${activeMilestoneId}/tasks`, { title });
    setTitle("");
    setAdding(false);
  };

  if (!activeMilestoneId) {
    return (
      <div className="flex flex-col gap-2 p-4 opacity-40">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tasks</h2>
        <p className="text-xs text-slate-400">Select a milestone to view tasks</p>
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
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tasks</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>+ Add</Button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Task title..."
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
        {tasks?.map((task: any) => (
          <Card
            key={task.id}
            className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 ${
              activeTaskId === task.id ? "ring-2 ring-slate-900" : ""
            }`}
            onClick={() => selectTask(task.id)}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{task.title}</p>
              <Badge variant="outline" className="text-xs">
                {priorityLabels[task.priority] || "Low"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
