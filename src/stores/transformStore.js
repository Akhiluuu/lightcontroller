import { create } from 'zustand'

export const useTransformStore = create((set) => ({
  transformMode: 'translate',
  setTransformMode: (mode) => set({ transformMode: mode })
}))