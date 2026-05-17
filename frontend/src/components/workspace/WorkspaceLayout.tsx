"use client";

import GoalsColumn from "./GoalsColumn";
import MilestonesColumn from "./MilestonesColumn";
import TasksColumn from "./TasksColumn";
import TodoColumn from "./TodoColumn";

export default function WorkspaceLayout() {
  return (
    <div className="flex h-full w-full divide-x divide-slate-200">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <GoalsColumn />
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto">
        <MilestonesColumn />
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto">
        <TasksColumn />
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto">
        <TodoColumn />
      </div>
    </div>
  );
}
