import { useLightStore } from '../stores/lightStore'
import { LightProperties } from './LightProperties'
import { TransformPanel } from './TransformPanel'
import { useCallback } from 'react'

export function UI() {
  const { lights, removeLight, selectedLight, selectLight, duplicateLight } = useLightStore()

  const handleDragStart = useCallback((e, id) => {
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')
    if (sourceId === targetId) return
    
    const sourceIndex = lights.findIndex(l => l.id === sourceId)
    const targetIndex = lights.findIndex(l => l.id === targetId)
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newLights = [...lights]
      const [removed] = newLights.splice(sourceIndex, 1)
      newLights.splice(targetIndex, 0, removed)
      useLightStore.setState({ lights: newLights })
    }
  }, [lights])

  return (
    <div className="w-1/4 bg-gray-900 text-gray-100 p-6 overflow-y-auto border-l border-gray-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Scene Lights
        </h2>
        <div className="space-y-4">
          {lights.map(light => (
            <div
              key={light.id}
              draggable
              onDragStart={(e) => handleDragStart(e, light.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, light.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                selectedLight === light.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20' 
                  : 'bg-gray-800 hover:bg-gray-750 hover:shadow-md'
              }`}
              onClick={() => selectLight(light.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedLight === light.id ? 'bg-white/10' : 'bg-gray-700'
                  }`}>
                    <span className="text-2xl">
                      {light.type === 'point' && '💡'}
                      {light.type === 'spot' && '🔦'}
                      {light.type === 'directional' && '☀️'}
                      {light.type === 'area' && '⬜'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium capitalize text-lg">
                      {light.name || `${light.type} Light`}
                    </span>
                    <div className="text-sm text-gray-400">
                      Power: {light.power}% • Color: {light.color}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateLight(light.id)
                    }}
                    className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Duplicate Light"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLight(light.id)
                    }}
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove Light"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {light.shadow && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                    Shadows
                  </span>
                )}
                {light.softFalloff && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                    Soft Falloff
                  </span>
                )}
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                  Radius: {light.radius}
                </span>
                {light.type === 'spot' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
                    Angle: {(light.angle * 180 / Math.PI).toFixed(0)}°
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedLight && (
        <div className="space-y-8">
          <TransformPanel />
          <LightProperties />
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 p-4 bg-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">Move</div>
          <div className="text-gray-300">G</div>
          <div className="text-gray-400">Rotate</div>
          <div className="text-gray-300">R</div>
          <div className="text-gray-400">Scale</div>
          <div className="text-gray-300">S</div>
          <div className="text-gray-400">Undo</div>
          <div className="text-gray-300">Ctrl + Z</div>
          <div className="text-gray-400">Redo</div>
          <div className="text-gray-300">Ctrl + Shift + Z</div>
        </div>
      </div>
    </div>
  )
}