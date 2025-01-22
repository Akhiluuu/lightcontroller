import { create } from 'zustand'
import { useLightStore } from './lightStore'
import { cloneDeep } from 'lodash'

export const useHistoryStore = create((set, get) => ({
  past: [],
  future: [],
  
  pushState: () => {
    const currentLights = useLightStore.getState().lights
    set(state => ({
      past: [...state.past.slice(-9), cloneDeep(currentLights)],
      future: []
    }))
  },

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return

    const newPast = [...past]
    const previousState = newPast.pop()
    const currentState = useLightStore.getState().lights

    useLightStore.setState({ lights: previousState })
    set({
      past: newPast,
      future: [currentState, ...future]
    })
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return

    const newFuture = [...future]
    const nextState = newFuture.shift()
    const currentState = useLightStore.getState().lights

    useLightStore.setState({ lights: nextState })
    set({
      past: [...past, currentState],
      future: newFuture
    })
  }
}))