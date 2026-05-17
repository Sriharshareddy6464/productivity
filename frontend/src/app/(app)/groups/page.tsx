"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.get("/groups").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post("/groups", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setCreating(false);
      setName("");
    },
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Groups</h1>
        <Button onClick={() => setCreating(true)}>Create Group</Button>
      </div>
      {creating && (
        <div className="mb-4 flex gap-2">
          <input
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Group name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && createMutation.mutate(name)}
          />
          <Button size="sm" onClick={() => name.trim() && createMutation.mutate(name)}>Create</Button>
          <Button size="sm" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {groups?.map((group: any) => (
          <Card
            key={group.id}
            className="cursor-pointer p-4 transition-colors hover:bg-slate-50"
            onClick={() => router.push(`/groups/${group.id}`)}
          >
            <h3 className="font-medium text-slate-900">{group.name}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
