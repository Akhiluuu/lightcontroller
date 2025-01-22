import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLightStore } from '../stores/lightStore'

export function LightHelper({ light }) {
  const lightRef = useRef()
  const helperRef = useRef()
  const targetRef = useRef()
  const { scene } = useThree()
  const { selectedLight, selectLight } = useLightStore()

  const handleClick = (e) => {
    e.stopPropagation()
    selectLight(light.id)
  }

  useEffect(() => {
    const handleSceneClick = (e) => {
      if (!e.intersections.some(i => i.object.name === light.id)) {
        selectLight(null)
      }
    }
    scene.addEventListener('click', handleSceneClick)
    return () => scene.removeEventListener('click', handleSceneClick)
  }, [scene, light.id, selectLight])

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(...light.position)
      const euler = new THREE.Euler(...light.rotation, 'XYZ')
      lightRef.current.setRotationFromEuler(euler)
      lightRef.current.scale.set(...light.scale)
      
      if (targetRef.current) {
        const direction = new THREE.Vector3(0, 0, -1)
        direction.applyEuler(euler)
        targetRef.current.position.copy(lightRef.current.position)
        targetRef.current.position.add(direction)
        targetRef.current.updateMatrixWorld()
        lightRef.current.target = targetRef.current
      }
    }
  }, [light.position, light.rotation, light.scale])

  useEffect(() => {
    if (!lightRef.current) return

    const isSelected = selectedLight === light.id
    if (!isSelected) {
      if (helperRef.current) {
        scene.remove(helperRef.current)
        helperRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
        helperRef.current = null
      }
      return
    }

    const group = new THREE.Group()
    const lightColor = new THREE.Color(light.color)
    
    // Common materials
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.8
    })
    
    const rayMaterial = new THREE.LineBasicMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    })

    switch (light.type) {
      case 'point': {
        // Core sphere with glow
        const coreRadius = 0.06
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(coreRadius, 16, 16),
          new THREE.ShaderMaterial({
            uniforms: {
              color: { value: lightColor },
              glowColor: { value: lightColor.clone().multiplyScalar(2) }
            },
            vertexShader: `
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              uniform vec3 glowColor;
              varying vec3 vNormal;
              void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                gl_FragColor = vec4(mix(color, glowColor, intensity), 0.9);
              }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
          })
        )
        group.add(core)

        // Omnidirectional rays
        const rayCount = 16
        const rayLength = light.radius * 0.4
        for (let i = 0; i < rayCount; i++) {
          const phi = Math.acos(-1 + (2 * i) / rayCount)
          const theta = Math.sqrt(rayCount * Math.PI) * phi
          
          const direction = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
          ).normalize()

          const points = []
          const steps = 10
          for (let j = 0; j <= steps; j++) {
            const t = j / steps
            const fade = Math.sin(t * Math.PI)
            points.push(direction.clone().multiplyScalar(rayLength * t * fade))
          }
          
          const ray = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            rayMaterial
          )
          group.add(ray)
        }
        break
      }

      case 'spot': {
        // Core with glow
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 16, 16),
          coreMaterial
        )
        group.add(core)

        const coneLength = light.radius * 0.8
        const coneAngle = light.angle
        const coneWidth = Math.tan(coneAngle) * coneLength

        // Cone visualization
        const coneGeometry = new THREE.CylinderGeometry(coneWidth, 0, coneLength, 32, 1, true)
        const coneMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: lightColor },
            opacity: { value: 0.1 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform float opacity;
            varying vec2 vUv;
            void main() {
              float edge = smoothstep(0.0, 0.2, 1.0 - vUv.y);
              gl_FragColor = vec4(color, opacity * edge);
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
        
        const cone = new THREE.Mesh(coneGeometry, coneMaterial)
        cone.rotation.x = Math.PI
        cone.position.y = -coneLength / 2
        group.add(cone)

        // Add beam rays
        const rayCount = 8
        const raySegments = 10
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2
          const points = []
          
          for (let j = 0; j <= raySegments; j++) {
            const t = j / raySegments
            const radius = t * coneWidth
            const y = -t * coneLength
            points.push(new THREE.Vector3(
              Math.cos(angle) * radius,
              y,
              Math.sin(angle) * radius
            ))
          }
          
          const ray = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            rayMaterial
          )
          group.add(ray)
        }
        break
      }

      case 'directional': {
        // Sun disk
        const sunDisk = new THREE.Mesh(
          new THREE.CircleGeometry(0.2, 32),
          new THREE.ShaderMaterial({
            uniforms: {
              color: { value: lightColor },
              glowColor: { value: lightColor.clone().multiplyScalar(2) }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              uniform vec3 glowColor;
              varying vec2 vUv;
              void main() {
                float dist = length(vUv - vec2(0.5));
                float edge = 1.0 - smoothstep(0.3, 0.5, dist);
                vec3 finalColor = mix(color, glowColor, edge);
                gl_FragColor = vec4(finalColor, edge);
              }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
          })
        )
        sunDisk.lookAt(new THREE.Vector3(0, -1, 0))
        group.add(sunDisk)

        // Parallel rays in a grid pattern
        const gridSize = 3
        const spacing = 0.4
        const rayLength = light.radius * 0.6

        for (let x = -gridSize/2; x <= gridSize/2; x++) {
          for (let z = -gridSize/2; z <= gridSize/2; z++) {
            const points = []
            const steps = 20
            
            for (let i = 0; i <= steps; i++) {
              const t = i / steps
              const fade = Math.sin(t * Math.PI)
              points.push(new THREE.Vector3(
                x * spacing,
                -rayLength * t,
                z * spacing
              ).multiplyScalar(fade))
            }
            
            const ray = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(points),
              rayMaterial
            )
            group.add(ray)
          }
        }
        break
      }

      case 'area': {
        const width = light.scale[0]
        const height = light.scale[1]
        let geometry
        let surfaceShader

        switch (light.shape) {
          case 'circle': {
            geometry = new THREE.CircleGeometry(0.5, 32)
            surfaceShader = `
              float edge = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
              vec3 finalColor = mix(color, glowColor, edge);
              gl_FragColor = vec4(finalColor, 0.7 * edge);
            `
            break
          }
          case 'ellipse': {
            geometry = new THREE.CircleGeometry(0.5, 32)
            geometry.scale(width, height, 1)
            surfaceShader = `
              vec2 scaled = (vUv - 0.5) * vec2(${width.toFixed(1)}, ${height.toFixed(1)});
              float edge = 1.0 - smoothstep(0.3, 0.5, length(scaled) / ${Math.max(width, height).toFixed(1)});
              vec3 finalColor = mix(color, glowColor, edge);
              gl_FragColor = vec4(finalColor, 0.7 * edge);
            `
            break
          }
          default: { // rectangle
            geometry = new THREE.PlaneGeometry(1, 1)
            surfaceShader = `
              float edgeX = 1.0 - smoothstep(0.4, 0.5, abs(vUv.x - 0.5));
              float edgeY = 1.0 - smoothstep(0.4, 0.5, abs(vUv.y - 0.5));
              float edge = edgeX * edgeY;
              vec3 finalColor = mix(color, glowColor, edge);
              gl_FragColor = vec4(finalColor, 0.7 * edge);
            `
            break
          }
        }

        // Surface with shape-specific glow
        const surface = new THREE.Mesh(
          geometry,
          new THREE.ShaderMaterial({
            uniforms: {
              color: { value: lightColor },
              glowColor: { value: lightColor.clone().multiplyScalar(1.5) }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              uniform vec3 glowColor;
              varying vec2 vUv;
              void main() {
                ${surfaceShader}
              }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
          })
        )
        group.add(surface)

        // Shape-specific ray pattern
        const rayCount = light.shape === 'circle' ? 12 : 8
        const rayLength = light.radius * 0.3
        
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2
          const points = []
          const steps = 15
          
          for (let j = 0; j <= steps; j++) {
            const t = j / steps
            const fade = Math.sin(t * Math.PI)
            let x, y
            
            if (light.shape === 'circle') {
              x = Math.cos(angle) * 0.5
              y = Math.sin(angle) * 0.5
            } else if (light.shape === 'ellipse') {
              x = Math.cos(angle) * width * 0.5
              y = Math.sin(angle) * height * 0.5
            } else {
              // Rectangle: rays from corners and midpoints
              const isCorner = i < 4
              if (isCorner) {
                x = (i % 2 ? 0.5 : -0.5) * width
                y = (i < 2 ? 0.5 : -0.5) * height
              } else {
                const mid = i - 4
                if (mid < 2) {
                  x = (mid === 0 ? -0.5 : 0.5) * width
                  y = 0
                } else {
                  x = 0
                  y = (mid === 2 ? -0.5 : 0.5) * height
                }
              }
            }
            
            points.push(new THREE.Vector3(
              x,
              y,
              rayLength * t * fade
            ))
          }
          
          const ray = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            rayMaterial
          )
          group.add(ray)
        }
        break
      }
    }

    group.name = `helper-${light.id}`
    scene.add(group)
    helperRef.current = group

    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current)
        helperRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }
    }
  }, [light.id, light.type, scene, light.color, light.radius, light.angle, selectedLight, light.shape, light.scale])

  useEffect(() => {
    if (helperRef.current && lightRef.current) {
      helperRef.current.position.copy(lightRef.current.position)
      helperRef.current.rotation.copy(lightRef.current.rotation)
      helperRef.current.scale.copy(lightRef.current.scale)
    }
  }, [light.position, light.rotation, light.scale])

  switch (light.type) {
    case 'point':
      return (
        <pointLight
          ref={lightRef}
          name={light.id}
          position={light.position}
          rotation={light.rotation}
          intensity={light.power / 100}
          color={light.color}
          distance={light.radius * 2}
          decay={light.softFalloff ? 2 : 1}
          castShadow={light.shadow}
          shadow-bias={-0.001}
          shadow-mapSize={[2048, 2048]}
          onClick={handleClick}
        />
      )
    case 'spot':
      return (
        <group name={light.id} position={light.position} rotation={light.rotation} onClick={handleClick}>
          <spotLight
            ref={lightRef}
            intensity={light.power / 100}
            color={light.color}
            angle={light.angle}
            penumbra={light.penumbra}
            distance={light.radius * 2}
            decay={light.softFalloff ? 2 : 1}
            castShadow={light.shadow}
            shadow-bias={-0.001}
            shadow-mapSize={[2048, 2048]}
          />
          <object3D ref={targetRef} position={[0, -1, 0]} />
        </group>
      )
    case 'directional':
      return (
        <group name={light.id} position={light.position} rotation={light.rotation} onClick={handleClick}>
          <directionalLight
            ref={lightRef}
            intensity={light.power / 100}
            color={light.color}
            castShadow={light.shadow}
            shadow-bias={-0.001}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <object3D ref={targetRef} position={[0, -1, 0]} />
        </group>
      )
    case 'area':
      return (
        <group name={light.id} position={light.position} rotation={light.rotation} onClick={handleClick}>
          <rectAreaLight
            ref={lightRef}
            intensity={light.power / 100}
            color={light.color}
            width={light.scale[0]}
            height={light.scale[1]}
          />
        </group>
      )
    default:
      return null
  }
}