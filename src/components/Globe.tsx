import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

function RotatingGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow effect outer sphere */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide} 
        />
      </Sphere>
      
      {/* Inner Wireframe Globe */}
      <Sphere args={[2, 48, 48]}>
        <meshBasicMaterial 
          color="#1e3a8a" 
          wireframe 
          transparent 
          opacity={0.4} 
        />
      </Sphere>

      {/* Solid Globe Core */}
      <Sphere args={[1.98, 32, 32]}>
        <meshStandardMaterial 
          color="#020617" 
          roughness={0.8}
        />
      </Sphere>

      {/* Decorative Network Nodes */}
      {Array.from({ length: 15 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2.05;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        return (
          <mesh position={[x, y, z]} key={i}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#60a5fa" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0 w-full h-[600px] md:h-full z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#60a5fa" />
        <RotatingGlobe />
      </Canvas>
    </div>
  );
}
