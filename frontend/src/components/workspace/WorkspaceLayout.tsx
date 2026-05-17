"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import GoalsColumn from "./GoalsColumn";
import MilestonesColumn from "./MilestonesColumn";
import TasksColumn from "./TasksColumn";
import TodoColumn from "./TodoColumn";

const columns = [
  { key: "goals", Component: GoalsColumn, label: "Goals" },
  { key: "milestones", Component: MilestonesColumn, label: "Milestones" },
  { key: "tasks", Component: TasksColumn, label: "Tasks" },
  { key: "todo", Component: TodoColumn, label: "To-Do" },
];

export default function WorkspaceLayout() {
  const [mobileIndex, setMobileIndex] = useState(0);
  const CurrentCol = columns[mobileIndex].Component;
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (desktopRef.current) {
      gsap.fromTo(
        desktopRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <>
      {/* Mobile: single column with swipe */}
      <div className="flex h-full w-full flex-col md:hidden">
        <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-slate-50 p-2">
          {columns.map((col, i) => (
            <button
              key={col.key}
              onClick={() => setMobileIndex(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mobileIndex === i
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={columns[mobileIndex].key}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentCol />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Tablet: 2 columns */}
      <div className="hidden h-full w-full md:flex xl:hidden divide-x divide-slate-200">
        {columns.slice(0, 2).map(({ key, Component }) => (
          <div key={key} className="flex-1 min-w-0 overflow-y-auto">
            <Component />
          </div>
        ))}
        <div className="flex-1 min-w-0 overflow-y-auto opacity-40">
          <p className="p-4 text-xs text-slate-400">Open on desktop for full view</p>
        </div>
      </div>

      {/* Desktop: 4 columns */}
      <div ref={desktopRef} className="hidden h-full w-full xl:flex divide-x divide-slate-200">
        {columns.map(({ key, Component }) => (
          <div key={key} className="flex-1 min-w-0 overflow-y-auto">
            <Component />
          </div>
        ))}
      </div>
    </>
  );
}
