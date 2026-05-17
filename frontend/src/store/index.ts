import { create } from "zustand";
import { createAuthSlice, AuthSlice } from "./authSlice";
import { createWorkspaceSlice, WorkspaceSlice } from "./workspaceSlice";
import { createUiSlice, UiSlice } from "./uiSlice";

export type AppStore = AuthSlice & WorkspaceSlice & UiSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createWorkspaceSlice(...a),
  ...createUiSlice(...a),
}));
