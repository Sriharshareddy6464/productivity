"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useStore } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function TodoColumn() {
  const { activeTaskId } = useStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos", activeTaskId],
    queryFn: () => api.get(`/tasks/${activeTaskId}/todos`).then((r) => r.data),
    enabled: !!activeTaskId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ taskId, todoId, is_completed }: { taskId: string; todoId: string; is_completed: boolean }) =>
      api.patch(`/tasks/${taskId}/todos/${todoId}`, { is_completed }),
    onMutate: async ({ todoId, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", activeTaskId] });
      const previous = queryClient.getQueryData(["todos", activeTaskId]);
      queryClient.setQueryData(["todos", activeTaskId], (old: any) =>
        old?.map((t: any) => (t.id === todoId ? { ...t, is_completed } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["todos", activeTaskId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", activeTaskId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => api.post(`/tasks/${activeTaskId}/todos`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", activeTaskId] });
    },
  });

  const handleCreate = async () => {
    if (!content.trim() || !activeTaskId) return;
    await createMutation.mutateAsync(content);
    setContent("");
    setAdding(false);
  };

  if (!activeTaskId) {
    return (
      <div className="flex flex-col gap-2 p-4 opacity-40">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">To-Do</h2>
        <p className="text-xs text-slate-400">Select a task to view to-dos</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">To-Do</h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>+ Add</Button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Todo item..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {todos?.map((todo: any) => (
          <label
            key={todo.id}
            className={`flex items-center gap-3 rounded-md border border-slate-200 p-3 transition-colors hover:bg-slate-50 ${
              todo.is_completed ? "opacity-50" : ""
            }`}
          >
            <Checkbox
              checked={todo.is_completed}
              onCheckedChange={(checked) =>
                toggleMutation.mutate({
                  taskId: activeTaskId,
                  todoId: todo.id,
                  is_completed: !!checked,
                })
              }
            />
            <span
              className={`text-sm ${
                todo.is_completed ? "line-through text-slate-400" : "text-slate-700"
              }`}
            >
              {todo.content}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
