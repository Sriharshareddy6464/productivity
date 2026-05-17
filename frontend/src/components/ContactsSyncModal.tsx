"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactsSyncModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSync = async (granted: boolean) => {
    setLoading(true);
    try {
      await api.post("/auth/contacts-permission", { granted });
    } catch {
      // Silently handle
    }
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Google Contacts?</DialogTitle>
          <DialogDescription>
            Grant permission to sync your Google Contacts for team collaboration features.
            You can skip this and enable it later in Settings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleSync(false)} disabled={loading}>
            Skip
          </Button>
          <Button onClick={() => handleSync(true)} disabled={loading}>
            Sync Contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
