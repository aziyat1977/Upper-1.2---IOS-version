import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const StarField = () => {
  const ref = useRef<THREE.Points>(null!);
  
  const [positions, stride] = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 * Math.random();
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return [positions, 3];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 45;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={stride} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f3ff"
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

const Stream = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const count = 600;
  
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        pos[i*3] = (Math.random() - 0.5) * 30; // x
        pos[i*3+1] = (Math.random() - 0.5) * 4; // y
        pos[i*3+2] = (Math.random() - 0.5) * 5; // z
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if(!ref.current || !active) return;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<count; i++) {
        const i3 = i*3;
        positions[i3] += delta * 8; // move fast
        if(positions[i3] > 15) positions[i3] = -15;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} visible={active}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ff0055"
        transparent
        opacity={active ? 0.8 : 0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface SceneProps {
  mode: 'idle' | 'active' | 'success';
}

const Scene: React.FC<SceneProps> = ({ mode }) => {
  return (
    <div className="fixed inset-0 z-0 bg-void" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
        <fog attach="fog" args={['#030305', 5, 25]} />
        <ambientLight intensity={0.5} />
        <StarField />
        <Stream active={mode === 'active'} />
      </Canvas>
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_95%)] pointer-events-none" />
    </div>
  );
};

export default React.memo(Scene);