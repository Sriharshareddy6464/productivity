"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const user = JSON.parse(userParam);
        setUser(user, token);
      } catch {
        setUser({ id: "", email: "" }, token);
      }
    } else {
      setUser({ id: "", email: "" }, token);
    }

    router.push("/");
  }, [searchParams, router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <p className="text-white">Signing you in...</p>
    </div>
  );
}
