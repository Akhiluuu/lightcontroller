import { Grid, OrbitControls, GizmoHelper, GizmoViewport, Environment, ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { LightManager } from './LightManager'
import { ModelLoader } from './ModelLoader'
import { useLightStore } from '../stores/lightStore'
import { TransformControls3D } from './TransformControls3D'
import * as THREE from 'three'
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'

export function Scene() {
  const { camera, scene, gl } = useThree()
  const { selectedLight, selectLight } = useLightStore()

  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 2, 0)
    
    // Set scene background color to a rich dark blue
    scene.background = new THREE.Color('#0A1929')
    scene.fog = new THREE.Fog('#0A1929', 20, 100)

    // Enable physically correct lighting
    gl.physicallyCorrectLights = true
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap

    const handleBackgroundClick = (event) => {
      if (event.intersections.length === 0) {
        selectLight(null)
      }
    }

    scene.addEventListener('click', handleBackgroundClick)
    return () => scene.removeEventListener('click', handleBackgroundClick)
  }, [camera, scene, gl, selectLight])

  return (
    <>
      <OrbitControls 
        makeDefault 
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />
      
      <Grid
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.3}
        cellColor="#1E3A5F"
        sectionSize={2}
        sectionThickness={0.5}
        sectionColor="#2D4D6E"
        fadeDistance={30}
        fadeStrength={1.5}
        position={[0, -0.01, 0]}
      />
      
      <ambientLight intensity={0.02} />
      
      <LightManager />
      
      {selectedLight && <TransformControls3D />}

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisColors={['#ff4d6b', '#4dff88', '#4d88ff']} />
      </GizmoHelper>

      <Suspense fallback={null}>
        <ModelLoader />
        <Environment preset="night" />
        <ContactShadows 
          opacity={0.5}
          scale={10}
          blur={2}
          far={10}
          resolution={256}
          color="#001"
        />
        <EffectComposer multisampling={8}>
          <SMAA />
          <Bloom 
            intensity={1}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </>
  )
}