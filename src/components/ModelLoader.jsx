import { useCallback, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import * as THREE from 'three'

export function ModelLoader() {
  const groupRef = useRef()
  const { camera, scene } = useThree()

  const setupMaterial = (material) => {
    if (!material) return
    material.roughness = 0.7
    material.metalness = 0.3
    material.envMapIntensity = 1
    material.needsUpdate = true
  }

  const loadTexture = async (url) => {
    try {
      const textureLoader = new THREE.TextureLoader()
      const texture = await new Promise((resolve, reject) => {
        textureLoader.load(url, resolve, undefined, reject)
      })
      texture.encoding = THREE.sRGBEncoding
      return texture
    } catch (error) {
      console.warn('Failed to load texture:', url)
      return null
    }
  }

  const handleModelGeometry = (model) => {
    model.traverse(async (child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(setupMaterial)
          } else {
            setupMaterial(child.material)
            
            if (child.material.map) {
              const texture = await loadTexture(child.material.map.image?.src)
              if (texture) {
                child.material.map = texture
                child.material.needsUpdate = true
              }
            }
          }
        }
      }
    })

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim

    model.position.copy(center).multiplyScalar(-1)
    // Adjust Y position to place model above grid
    model.position.y += Math.max(size.y * scale / 2, 0.5)
    model.scale.multiplyScalar(scale)

    return model
  }

  const loadModel = useCallback(async (file, loader) => {
    if (!groupRef.current) return

    const url = URL.createObjectURL(file)
    
    try {
      // Clear existing models
      while (groupRef.current.children.length > 1) {
        const child = groupRef.current.children[1]
        child.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose())
            } else {
              obj.material.dispose()
            }
          }
        })
        groupRef.current.remove(child)
      }

      let model
      if (file.name.toLowerCase().endsWith('.obj')) {
        // Handle OBJ files with potential MTL
        const mtlFile = Array.from(file.name.replace('.obj', '.mtl'))
          .find(f => f.toLowerCase().endsWith('.mtl'))
        
        if (mtlFile) {
          const mtlLoader = new MTLLoader()
          const materials = await new Promise((resolve) => 
            mtlLoader.load(URL.createObjectURL(mtlFile), resolve)
          )
          materials.preload()
          loader.setMaterials(materials)
        }
      }

      model = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject)
      })

      const processedModel = handleModelGeometry(model.scene || model)
      groupRef.current.add(processedModel)

      // Position camera to view the model
      const box = new THREE.Box3().setFromObject(processedModel)
      const size = box.getSize(new THREE.Vector3())
      const distance = Math.max(...size.toArray()) * 2.5
      camera.position.set(distance, distance, distance)
      camera.lookAt(0, size.y/2, 0)

    } catch (error) {
      console.error('Error loading model:', error)
      alert('Error loading model. Please try another file.')
    } finally {
      URL.revokeObjectURL(url)
    }
  }, [camera])

  useEffect(() => {
    const input = document.getElementById('model-upload')
    if (!input) return

    const handleUpload = (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension) return

      // Initialize loaders
      const gltfLoader = new GLTFLoader()
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
      gltfLoader.setDRACOLoader(dracoLoader)

      const fbxLoader = new FBXLoader()
      const objLoader = new OBJLoader()

      switch (extension) {
        case 'glb':
        case 'gltf':
          loadModel(file, gltfLoader)
          break
        case 'fbx':
          loadModel(file, fbxLoader)
          break
        case 'obj':
          loadModel(file, objLoader)
          break
        default:
          alert('Unsupported file format. Please use GLB, GLTF, FBX, or OBJ files.')
      }
    }

    input.addEventListener('change', handleUpload)
    return () => input.removeEventListener('change', handleUpload)
  }, [loadModel])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>
    </group>
  )
}