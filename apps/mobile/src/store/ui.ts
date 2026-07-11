/**
 * STORE_ui (TDD Part 4 §4.2). Transient UI flags; not persisted EXCEPT the
 * ritual-resume pointer, which is persisted so an app-kill resumes today's ritual
 * (PDD AC-RIT-03). Persistence is wired with MMKV in the offline/ritual task.
 */
import { create } from 'zustand';

export interface RitualResume {
  ritual_id: string;
  step: number;
  local_date: string;
}

interface UiState {
  ritualResume: RitualResume | null;
  setRitualResume: (r: RitualResume | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  ritualResume: null,
  setRitualResume: (r) => set({ ritualResume: r }),
}));
