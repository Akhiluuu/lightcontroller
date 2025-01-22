import { useLightStore } from '../stores/lightStore'

export function LightProperties() {
  const { selectedLight, lights, updateLightProperties } = useLightStore()
  const light = lights.find(l => l.id === selectedLight)

  if (!light) return null

  const handleChange = (property, value) => {
    updateLightProperties(light.id, { [property]: value })
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Light Properties
      </h3>
      
      <div className="space-y-6">
        {/* Name field */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Name</label>
          <input
            type="text"
            value={light.name || `${light.type} Light`}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            placeholder="Enter light name"
          />
        </div>

        {/* Color with presets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Color</label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="color"
                value={light.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={light.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1 bg-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['#FF5F6D', '#FFC371', '#FFFFFF', '#64B5F6', '#81C784', '#FFB74D'].map(color => (
                <button
                  key={color}
                  onClick={() => handleChange('color', color)}
                  className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Power with presets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Power</label>
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <input
                type="range"
                value={light.power}
                onChange={(e) => handleChange('power', parseFloat(e.target.value))}
                className="flex-1 accent-purple-500"
                step="100"
                min="0"
                max="2000"
              />
              <input
                type="number"
                value={light.power}
                onChange={(e) => handleChange('power', parseFloat(e.target.value))}
                className="w-20 bg-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                step="100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000, 1500, 2000].map(power => (
                <button
                  key={power}
                  onClick={() => handleChange('power', power)}
                  className={`px-3 py-1 rounded text-sm ${
                    light.power === power ? 'bg-purple-500' : 'bg-gray-700'
                  } hover:bg-purple-600 transition-colors`}
                >
                  {power}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Radius with presets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Radius</label>
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <input
                type="range"
                value={light.radius}
                onChange={(e) => handleChange('radius', parseFloat(e.target.value))}
                className="flex-1 accent-purple-500"
                step="0.1"
                min="0.1"
                max="20"
              />
              <input
                type="number"
                value={light.radius}
                onChange={(e) => handleChange('radius', parseFloat(e.target.value))}
                className="w-20 bg-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                step="0.1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 15, 20].map(radius => (
                <button
                  key={radius}
                  onClick={() => handleChange('radius', radius)}
                  className={`px-3 py-1 rounded text-sm ${
                    light.radius === radius ? 'bg-purple-500' : 'bg-gray-700'
                  } hover:bg-purple-600 transition-colors`}
                >
                  {radius}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spot light specific controls */}
        {light.type === 'spot' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="block text-sm font-medium mb-3 text-gray-300">Spot Angle & Penumbra</label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Angle</span>
                  <span>{(light.angle * 180 / Math.PI).toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  value={light.angle}
                  onChange={(e) => handleChange('angle', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                  step="0.1"
                  min="0.1"
                  max={Math.PI / 2}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Penumbra</span>
                  <span>{(light.penumbra * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  value={light.penumbra}
                  onChange={(e) => handleChange('penumbra', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                  step="0.1"
                  min="0"
                  max="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Area light specific controls */}
        {light.type === 'area' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="block text-sm font-medium mb-3 text-gray-300">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {['rectangle', 'circle', 'ellipse'].map(shape => (
                <button
                  key={shape}
                  onClick={() => handleChange('shape', shape)}
                  className={`px-3 py-2 rounded text-sm capitalize ${
                    light.shape === shape ? 'bg-purple-500' : 'bg-gray-700'
                  } hover:bg-purple-600 transition-colors`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Light Settings</label>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={light.softFalloff}
                onChange={(e) => handleChange('softFalloff', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Soft Falloff
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={light.shadow}
                onChange={(e) => handleChange('shadow', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Cast Shadows
              </span>
            </label>

            {light.shadow && (
              <div className="pl-7 space-y-2">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Shadow Bias</label>
                  <input
                    type="range"
                    value={light.shadowBias || -0.001}
                    onChange={(e) => handleChange('shadowBias', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                    step="0.0001"
                    min="-0.01"
                    max="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Shadow Radius</label>
                  <input
                    type="range"
                    value={light.shadowRadius || 1}
                    onChange={(e) => handleChange('shadowRadius', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ray Visibility */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Ray Visibility</label>
          <div className="space-y-3">
            {['diffuse', 'glossy', 'transmission', 'volumeScatter'].map(prop => (
              <label key={prop} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={light.rayVisibility?.[prop] ?? true}
                  onChange={(e) => handleChange('rayVisibility', {
                    ...light.rayVisibility,
                    [prop]: e.target.checked
                  })}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">
                  {prop.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-gray-300">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Warm', color: '#FFB74D', power: 1000 },
              { name: 'Cool', color: '#64B5F6', power: 1000 },
              { name: 'Bright', color: '#FFFFFF', power: 2000 },
              { name: 'Dim', color: '#FFF3E0', power: 200 }
            ].map(preset => (
              <button
                key={preset.name}
                onClick={() => {
                  handleChange('color', preset.color)
                  handleChange('power', preset.power)
                }}
                className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}