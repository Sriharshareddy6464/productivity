import { StateCreator } from "zustand";

export interface WorkspaceSlice {
  activeGoalId: string | null;
  activeMilestoneId: string | null;
  activeTaskId: string | null;
  selectGoal: (id: string | null) => void;
  selectMilestone: (id: string | null) => void;
  selectTask: (id: string | null) => void;
}

export const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set) => ({
  activeGoalId: null,
  activeMilestoneId: null,
  activeTaskId: null,
  selectGoal: (id) => set({ activeGoalId: id, activeMilestoneId: null, activeTaskId: null }),
  selectMilestone: (id) => set({ activeMilestoneId: id, activeTaskId: null }),
  selectTask: (id) => set({ activeTaskId: id }),
});
