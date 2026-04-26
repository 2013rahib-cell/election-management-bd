// ============================================================
// Election Management System – Bangladesh
// Global State Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { Role, TabId, Officer, ElectionData } from './types';
import { initializeData, saveData, resetData, getDefaultOfficer, ROLE_TABS } from './storage';

interface ElectionStore {
  // Data
  data: ElectionData;

  // UI State
  currentRole: Role;
  currentTab: TabId;
  currentOfficer: Officer | null;

  // Actions
  setRole: (role: Role) => void;
  setTab: (tab: TabId) => void;
  setData: (data: ElectionData) => void;
  updateData: (updater: (data: ElectionData) => ElectionData) => void;
  resetAllData: () => void;

  // Initialization
  init: () => void;
}

export const useElectionStore = create<ElectionStore>((set, get) => ({
  data: {} as ElectionData,
  currentRole: 'Voter',
  currentTab: 'home',
  currentOfficer: null,

  setRole: (role: Role) => {
    const { data } = get();
    const officer = role === 'Voter' ? null : getDefaultOfficer(data, role) || null;
    const allowedTabs = ROLE_TABS[role];
    const currentTab = get().currentTab;
    const newTab = allowedTabs.includes(currentTab) ? currentTab : ('home' as TabId);
    set({ currentRole: role, currentOfficer: officer, currentTab: newTab });
  },

  setTab: (tab: TabId) => set({ currentTab: tab }),

  setData: (data: ElectionData) => {
    saveData(data);
    set({ data });
  },

  updateData: (updater: (data: ElectionData) => ElectionData) => {
    const currentData = get().data;
    const newData = updater({ ...currentData });
    saveData(newData);
    set({ data: newData });
  },

  resetAllData: () => {
    const freshData = resetData();
    const role = get().currentRole;
    const officer = role === 'Voter' ? null : getDefaultOfficer(freshData, role) || null;
    set({ data: freshData, currentOfficer: officer, currentTab: 'home' });
  },

  init: () => {
    const data = initializeData();
    set({ data });
  },
}));
