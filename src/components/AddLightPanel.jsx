import { useLightStore } from '../stores/lightStore'

export function AddLightPanel() {
  const { addLight } = useLightStore()

  const lightTypes = [
    { type: 'point', label: 'Point Light', icon: '💡' },
    { type: 'spot', label: 'Spot Light', icon: '🔦' },
    { type: 'directional', label: 'Directional Light', icon: '☀️' },
    { type: 'area', label: 'Area Light', icon: '⬜' }
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add Light</h2>
      <div className="grid gap-4">
        {lightTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => addLight(type)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}