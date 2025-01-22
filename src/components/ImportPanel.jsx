import { useCallback } from 'react'

export function ImportPanel() {
  const handleModelUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    if (!['glb', 'gltf', 'fbx', 'obj'].includes(extension)) {
      alert('Unsupported file format. Please use GLB, GLTF, FBX, or OBJ files.')
      return
    }
  }, [])

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-xl font-bold mb-4">Import Model</h2>
      <input
        type="file"
        accept=".glb,.gltf,.fbx,.obj"
        onChange={handleModelUpload}
        style={{ display: 'none' }}
        id="model-upload"
      />
      <label
        htmlFor="model-upload"
        className="block w-full text-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded transition-colors"
      >
        Import 3D Model
        <div className="text-sm text-gray-300 mt-1">
          Supported: GLB, GLTF, FBX, OBJ
        </div>
      </label>
    </div>
  )
}