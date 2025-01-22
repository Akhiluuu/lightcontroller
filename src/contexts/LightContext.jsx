import { createContext, useContext } from 'react'
import { useLightStore } from '../stores/lightStore'

const LightContext = createContext(null)

export function LightProvider({ children }) {
  const lightStore = useLightStore()
  
  return (
    <LightContext.Provider value={lightStore}>
      {children}
    </LightContext.Provider>
  )
}

export function useLightContext() {
  const context = useContext(LightContext)
  if (!context) {
    throw new Error('useLightContext must be used within a LightProvider')
  }
  return context
}