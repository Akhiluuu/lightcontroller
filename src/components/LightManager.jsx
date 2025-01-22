import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useLightStore } from '../stores/lightStore'
import { LightHelper } from './LightHelper'

export function LightManager() {
  const { lights, updateLightTransform, selectedLight } = useLightStore()
  const { scene } = useThree()

  useEffect(() => {
    const handleTransform = () => {
      if (selectedLight) {
        const lightObj = scene.getObjectByName(selectedLight)
        if (lightObj) {
          updateLightTransform(selectedLight, {
            position: lightObj.position.toArray(),
            rotation: lightObj.rotation.toArray(),
            scale: lightObj.scale.toArray()
          })
        }
      }
    }

    scene.addEventListener('transform', handleTransform)
    return () => scene.removeEventListener('transform', handleTransform)
  }, [selectedLight, scene, updateLightTransform])

  return (
    <>
      {lights.map(light => (
        <LightHelper key={light.id} light={light} />
      ))}
    </>
  )
}