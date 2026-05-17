"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.get("/groups").then((r) => r.data),
  });

  const { data: members } = useQuery({
    queryKey: ["members", selectedGroup],
    queryFn: () => api.get(`/groups/${selectedGroup}/members`).then((r) => r.data),
    enabled: !!selectedGroup,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      api.post(`/groups/${groupId}/members`, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", selectedGroup] });
      setInviteEmail("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      api.delete(`/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", selectedGroup] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Teams</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Groups</h2>
          <div className="flex flex-col gap-2">
            {groups?.map((group: any) => (
              <Card
                key={group.id}
                className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 ${
                  selectedGroup === group.id ? "ring-2 ring-slate-900" : ""
                }`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <p className="font-medium">{group.name}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Members</h2>
          {selectedGroup ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Invite by email..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    inviteEmail.trim() &&
                    inviteMutation.mutate({ groupId: selectedGroup, email: inviteEmail })
                  }
                />
                <Button
                  size="sm"
                  onClick={() =>
                    inviteEmail.trim() &&
                    inviteMutation.mutate({ groupId: selectedGroup, email: inviteEmail })
                  }
                >
                  Invite
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {members?.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{member.user_id.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user_id}</p>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
                      </div>
                    </div>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => removeMutation.mutate({ groupId: selectedGroup, userId: member.user_id })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Select a group to manage members</p>
          )}
        </div>
      </div>
    </div>
  );
}
