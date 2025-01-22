import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const defaultRayVisibility = {
  diffuse: true,
  glossy: true,
  transmission: true,
  volumeScatter: true
}

const createDefaultLight = (type) => ({
  id: uuidv4(),
  name: '',
  type,
  position: [0, 5, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  power: 1000,
  color: '#ffffff',
  radius: 5,
  softFalloff: true,
  shadow: true,
  shadowBias: -0.001,
  shadowRadius: 1,
  angle: Math.PI / 3,
  penumbra: 0.5,
  rayVisibility: { ...defaultRayVisibility },
  shape: type === 'area' ? 'rectangle' : undefined
})

const validateArray = (arr, defaultValue, minValue = null) => {
  if (!Array.isArray(arr) || arr.length !== 3) {
    return [defaultValue, defaultValue, defaultValue]
  }
  return arr.map(v => {
    if (!Number.isFinite(v)) return defaultValue
    if (minValue !== null) return Math.max(minValue, v)
    return v
  })
}

const normalizeRotation = (rotation) => {
  return rotation.map(v => {
    if (!Number.isFinite(v)) return 0
    return ((v + Math.PI) % (Math.PI * 2)) - Math.PI
  })
}

export const useLightStore = create((set) => ({
  lights: [],
  selectedLight: null,

  addLight: (type) => {
    const light = createDefaultLight(type)
    set((state) => ({
      lights: [...state.lights, light],
      selectedLight: light.id
    }))
  },

  removeLight: (id) => set((state) => ({
    lights: state.lights.filter(light => light.id !== id),
    selectedLight: state.selectedLight === id ? null : state.selectedLight
  })),

  selectLight: (id) => set((state) => ({
    selectedLight: state.selectedLight === id ? null : id
  })),

  duplicateLight: (id) => set((state) => {
    const lightToDuplicate = state.lights.find(light => light.id === id)
    if (!lightToDuplicate) return state

    const newLight = {
      ...lightToDuplicate,
      id: uuidv4(),
      name: `${lightToDuplicate.name || lightToDuplicate.type} Copy`,
      position: [
        lightToDuplicate.position[0] + 1,
        lightToDuplicate.position[1],
        lightToDuplicate.position[2]
      ]
    }

    return {
      lights: [...state.lights, newLight],
      selectedLight: newLight.id
    }
  }),

  updateLightTransform: (id, transform) => {
    set((state) => ({
      lights: state.lights.map(light => {
        if (light.id !== id) return light

        return {
          ...light,
          position: validateArray(transform.position, 0),
          rotation: normalizeRotation(validateArray(transform.rotation, 0)),
          scale: validateArray(transform.scale, 1, 0.1)
        }
      })
    }))
  },

  updateLightProperties: (id, properties) => {
    set((state) => ({
      lights: state.lights.map(light => {
        if (light.id !== id) return light

        const newLight = { ...light }
        
        if (properties.name !== undefined) {
          newLight.name = properties.name
        }
        if (typeof properties.power === 'number') {
          newLight.power = Math.max(0, properties.power)
        }
        if (typeof properties.radius === 'number') {
          newLight.radius = Math.max(0.1, properties.radius)
        }
        if (typeof properties.angle === 'number') {
          newLight.angle = Math.max(0, Math.min(Math.PI, properties.angle))
        }
        if (typeof properties.penumbra === 'number') {
          newLight.penumbra = Math.max(0, Math.min(1, properties.penumbra))
        }
        if (properties.color) {
          newLight.color = properties.color
        }
        if (typeof properties.softFalloff === 'boolean') {
          newLight.softFalloff = properties.softFalloff
        }
        if (typeof properties.shadow === 'boolean') {
          newLight.shadow = properties.shadow
        }
        if (typeof properties.shadowBias === 'number') {
          newLight.shadowBias = properties.shadowBias
        }
        if (typeof properties.shadowRadius === 'number') {
          newLight.shadowRadius = properties.shadowRadius
        }
        if (properties.rayVisibility) {
          newLight.rayVisibility = {
            ...defaultRayVisibility,
            ...properties.rayVisibility
          }
        }
        if (properties.shape && light.type === 'area') {
          newLight.shape = properties.shape
        }

        return newLight
      })
    }))
  }
}))