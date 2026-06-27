"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 800;

function buildPositions() {
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 16;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  return arr;
}

function buildColors() {
  const palette = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#cccccc"),
    new THREE.Color("#aaaaaa"),
    new THREE.Color("#888888"),
  ];
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const c = palette[i % palette.length];
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  return arr;
}

function buildSizes() {
  const arr = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i] = Math.random() * 0.04 + 0.015;
  }
  return arr;
}

function ParticleField() {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(buildPositions, []);
  const colors = useMemo(buildColors, []);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    timeRef.current += delta;

    // Gentle drift rotation
    group.rotation.y += delta * 0.04;
    group.rotation.x = Math.sin(timeRef.current * 0.08) * 0.04;

    // Parallax lean toward pointer
    group.position.x += (state.pointer.x * 0.9 - group.position.x) * 0.04;
    group.position.y += (state.pointer.y * 0.6 - group.position.y) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
