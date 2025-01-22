import { useEffect } from 'react'
import { useTransformStore } from '../stores/transformStore'
import { useHistoryStore } from '../stores/historyStore'

export function TransformControls() {
  const { transformMode, setTransformMode } = useTransformStore()
  const { undo, redo } = useHistoryStore()

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redo()
      }
      return
    }

    switch(e.key.toLowerCase()) {
      case 'g':
        setTransformMode('translate')
        break
      case 'r':
        setTransformMode('rotate')
        break
      case 's':
        setTransformMode('scale')
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="absolute bottom-4 left-4 flex gap-4">
      <div className="space-x-2">
        <button
          onClick={() => setTransformMode('translate')}
          className={`px-3 py-1 rounded ${
            transformMode === 'translate' ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}
          title="Shortcut: G"
        >
          Move (G)
        </button>
        <button
          onClick={() => setTransformMode('rotate')}
          className={`px-3 py-1 rounded ${
            transformMode === 'rotate' ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}
          title="Shortcut: R"
        >
          Rotate (R)
        </button>
        <button
          onClick={() => setTransformMode('scale')}
          className={`px-3 py-1 rounded ${
            transformMode === 'scale' ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}
          title="Shortcut: S"
        >
          Scale (S)
        </button>
      </div>

      <div className="space-x-2">
        <button
          onClick={undo}
          className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
          title="Shortcut: Ctrl+Z"
        >
          Undo
        </button>
        <button
          onClick={redo}
          className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
          title="Shortcut: Ctrl+Shift+Z"
        >
          Redo
        </button>
      </div>
    </div>
  )
}