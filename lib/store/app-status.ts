import { create } from "zustand";

// Flips to true once persisted stores have been read from localStorage on the client.
export const useAppStatus = create<{ hydrated: boolean }>(() => ({ hydrated: false }));

export const useHydrated = () => useAppStatus((state) => state.hydrated);
