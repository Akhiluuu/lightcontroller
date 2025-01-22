import { useLightStore } from '../stores/lightStore'

export function TransformPanel() {
  const { selectedLight, lights, updateLightTransform } = useLightStore()
  const light = lights.find(l => l.id === selectedLight)

  if (!light) return null

  const handleChange = (property, axis, value) => {
    const numValue = parseFloat(value) || 0
    const newTransform = { [property]: [...light[property]] }
    newTransform[property][axis] = numValue
    updateLightTransform(light.id, newTransform)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        Transform
      </h3>
      
      <div className="space-y-6">
        {[
          { label: 'Location', property: 'position', icon: '📍' },
          { label: 'Rotation', property: 'rotation', icon: '🔄' },
          { label: 'Scale', property: 'scale', icon: '⚖️' }
        ].map(({ label, property, icon }) => (
          <div key={property} className="bg-gray-800 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-300">
              <span>{icon}</span>
              {label}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['X', 'Y', 'Z'].map((axis, i) => (
                <div key={axis} className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">{axis}</label>
                  <input
                    type="number"
                    value={light[property][i] || (property === 'scale' ? 1 : 0)}
                    onChange={(e) => handleChange(property, i, e.target.value)}
                    className="bg-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm transition-shadow"
                    step={property === 'rotation' ? '0.1' : '0.5'}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}