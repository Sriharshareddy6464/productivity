"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStore, ActiveView } from "@/store";
import { motion } from "framer-motion";

const navItems: { label: string; view: ActiveView }[] = [
  { label: "Home", view: "home" },
  { label: "Goals View", view: "goals" },
  { label: "Teams", view: "teams" },
  { label: "Groups", view: "groups" },
  { label: "Settings", view: "settings" },
];

export default function NavDrawer() {
  const { navOpen, toggleNav, setView, activeView } = useStore();

  return (
    <Sheet open={navOpen} onOpenChange={toggleNav}>
      <SheetTrigger asChild>
        <motion.button
          className="fixed left-0 top-0 z-50 flex h-full w-2 cursor-pointer items-center justify-center bg-slate-800/50 hover:bg-slate-700/50"
          whileHover={{ width: 12 }}
        >
          <div className="flex flex-col gap-1">
            <span className="block h-0.5 w-3 bg-white" />
            <span className="block h-0.5 w-3 bg-white" />
            <span className="block h-0.5 w-3 bg-white" />
          </div>
        </motion.button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col gap-1 p-4 pt-12">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeView === item.view
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
