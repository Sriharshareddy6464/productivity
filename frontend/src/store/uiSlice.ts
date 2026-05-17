import { StateCreator } from "zustand";

export type ActiveView = "home" | "goals" | "teams" | "groups" | "settings";

export interface UiSlice {
  navOpen: boolean;
  activeView: ActiveView;
  toggleNav: () => void;
  setView: (view: ActiveView) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  navOpen: false,
  activeView: "home",
  toggleNav: () => set((state) => ({ navOpen: !state.navOpen })),
  setView: (view) => set({ activeView: view, navOpen: false }),
});
