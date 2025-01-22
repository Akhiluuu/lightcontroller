import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { UI } from './components/UI'
import { LightProvider } from './contexts/LightContext'
import { AddLightPanel } from './components/AddLightPanel'
import { TransformControls } from './components/TransformControls'
import { ImportPanel } from './components/ImportPanel'

export default function App() {
  return (
    <LightProvider>
      <div className="h-screen flex">
        <div className="w-1/4 bg-gray-800 text-white overflow-y-auto">
          <ImportPanel />
          <AddLightPanel />
        </div>
        <div className="w-1/2 h-full relative">
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Scene />
          </Canvas>
          <TransformControls />
        </div>
        <UI />
      </div>
    </LightProvider>
  )
}