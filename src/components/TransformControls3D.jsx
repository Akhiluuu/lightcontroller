import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useLightStore } from '../stores/lightStore'
import { useTransformStore } from '../stores/transformStore'
import { useHistoryStore } from '../stores/historyStore'
import * as THREE from 'three'

export function TransformControls3D() {
  const { selectedLight, updateLightTransform } = useLightStore()
  const { transformMode } = useTransformStore()
  const { pushState } = useHistoryStore()
  const { scene, camera } = useThree()
  const controlsRef = useRef()
  const isDragging = useRef(false)

  useEffect(() => {
    if (!selectedLight || !controlsRef.current) return

    const obj = scene.getObjectByName(selectedLight)
    if (obj) {
      controlsRef.current.attach(obj)
    }

    return () => {
      if (controlsRef.current && controlsRef.current.object) {
        controlsRef.current.detach()
      }
    }
  }, [selectedLight, scene])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleMouseDown = () => {
      isDragging.current = true
      pushState()
    }

    const handleMouseUp = () => {
      isDragging.current = false
      
      // Update one final time to ensure we have the latest values
      const obj = scene.getObjectByName(selectedLight)
      if (obj) {
        updateTransform(obj)
      }
    }

    const updateTransform = (obj) => {
      // Ensure valid scale values
      const scale = obj.scale.toArray().map(v => Math.max(0.1, isFinite(v) ? v : 1))
      obj.scale.fromArray(scale)

      // Get rotation in radians and normalize
      const rotation = new THREE.Euler().setFromQuaternion(obj.quaternion).toArray()
      const normalizedRotation = rotation.map(v => {
        if (!isFinite(v)) return 0
        return ((v + Math.PI) % (Math.PI * 2)) - Math.PI
      })

      // Update transform with normalized values
      updateLightTransform(selectedLight, {
        position: obj.position.toArray(),
        rotation: normalizedRotation,
        scale: scale
      })
    }

    const handleChange = () => {
      if (!selectedLight) return

      const obj = scene.getObjectByName(selectedLight)
      if (obj) {
        updateTransform(obj)
      }
    }

    controls.addEventListener('mouseDown', handleMouseDown)
    controls.addEventListener('mouseUp', handleMouseUp)
    controls.addEventListener('change', handleChange)
    controls.addEventListener('objectChange', handleChange)
    
    return () => {
      controls.removeEventListener('mouseDown', handleMouseDown)
      controls.removeEventListener('mouseUp', handleMouseUp)
      controls.removeEventListener('change', handleChange)
      controls.removeEventListener('objectChange', handleChange)
    }
  }, [selectedLight, scene, updateLightTransform, pushState])

  if (!selectedLight) return null

  return (
    <TransformControls
      ref={controlsRef}
      mode={transformMode}
      size={0.75}
      showX={true}
      showY={true}
      showZ={true}
      space="local"
      camera={camera}
      rotationSnap={Math.PI / 24}
      translationSnap={0.25}
      scaleSnap={0.1}
    />
  )
}