"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function GoalsTreeView() {
  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get("/goals").then((r) => r.data),
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Goals Overview</h1>
      <Accordion type="multiple" className="space-y-2">
        {goals?.map((goal: any) => (
          <GoalNode key={goal.id} goal={goal} />
        ))}
      </Accordion>
    </div>
  );
}

function GoalNode({ goal }: { goal: any }) {
  const { data: milestones } = useQuery({
    queryKey: ["milestones", goal.id],
    queryFn: () => api.get(`/goals/${goal.id}/milestones`).then((r) => r.data),
  });

  return (
    <AccordionItem value={goal.id} className="rounded-lg border border-slate-200">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="font-medium">{goal.title}</span>
          <Badge variant="secondary" className="text-xs">{milestones?.length || 0} milestones</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-3">
        {goal.description && (
          <p className="mb-3 text-sm text-slate-500">{goal.description}</p>
        )}
        <Accordion type="multiple" className="space-y-1">
          {milestones?.map((ms: any) => (
            <MilestoneNode key={ms.id} milestone={ms} />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

function MilestoneNode({ milestone }: { milestone: any }) {
  const { data: tasks } = useQuery({
    queryKey: ["tasks", milestone.id],
    queryFn: () => api.get(`/milestones/${milestone.id}/tasks`).then((r) => r.data),
  });

  const todoCount = tasks?.reduce((sum: number, t: any) => sum + (t.todo_count || 0), 0) || 0;

  return (
    <AccordionItem value={milestone.id} className="rounded-md border border-slate-100">
      <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
        <div className="flex items-center gap-2">
          <span>{milestone.title}</span>
          <Badge variant="outline" className="text-xs">{tasks?.length || 0} tasks</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-2">
        <ul className="space-y-1">
          {tasks?.map((task: any) => (
            <li key={task.id} className="flex items-center justify-between rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">
              <span>{task.title}</span>
              <Badge variant="outline" className="text-xs">{task.todo_count || 0} todos</Badge>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
