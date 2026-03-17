"use client";

import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ───
const GRAVITY = -9.8;
const BG_COLOR = "#0a0a0a";

// ─── Helpers ───
function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── Noise displacement for stone geometry ───
function displaceGeometry(geo: THREE.BufferGeometry, amount: number) {
  const pos = geo.attributes.position;
  const normal = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    // Pseudo-random displacement based on position
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const noise =
      Math.sin(px * 5.3 + py * 3.7) * Math.cos(pz * 4.1 + px * 2.9) * amount;
    pos.setXYZ(i, px + nx * noise, py + ny * noise, pz + nz * noise);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

// ─── Stone mesh component ───
function Stone({
  stoneRef,
  scale = 1,
  seed = 0,
}: {
  stoneRef: React.RefObject<THREE.Mesh | null>;
  scale?: number;
  seed?: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.6 * scale, 3);
    displaceGeometry(geo, 0.08 * scale + seed * 0.02);
    return geo;
  }, [scale, seed]);

  return (
    <mesh ref={stoneRef} geometry={geometry} castShadow>
      <meshStandardMaterial
        color="#5C534B"
        roughness={0.8}
        metalness={0.15}
        emissive="#000000"
        emissiveIntensity={0}
      />
    </mesh>
  );
}

// ─── Spark particle system (instanced) ───
interface SparkData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  colorPhase: number; // 0=white, 1=orange, 2=red
}

function SparkSystem({
  sparksRef,
}: {
  sparksRef: React.MutableRefObject<SparkData[]>;
}) {
  const maxCount = isMobile() ? 100 : 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArr = useMemo(
    () => new Float32Array(maxCount * 3).fill(1),
    [maxCount]
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const sparks = sparksRef.current;
    let visibleCount = 0;

    for (let i = 0; i < sparks.length && i < maxCount; i++) {
      const s = sparks[i];
      s.life -= delta;
      if (s.life <= 0) continue;

      // Physics
      s.velocity.y += GRAVITY * delta;
      s.position.add(s.velocity.clone().multiplyScalar(delta));

      const lifeRatio = s.life / s.maxLife;

      // Position & scale
      dummy.position.copy(s.position);
      const sc = s.size * lifeRatio;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(visibleCount, dummy.matrix);

      // Color: white → orange → red → dark
      let r, g, b;
      if (lifeRatio > 0.7) {
        // White to bright yellow
        const t = (lifeRatio - 0.7) / 0.3;
        r = 1;
        g = lerp(0.85, 1, t);
        b = lerp(0.4, 0.9, t);
      } else if (lifeRatio > 0.3) {
        // Yellow-orange
        const t = (lifeRatio - 0.3) / 0.4;
        r = 1;
        g = lerp(0.3, 0.85, t);
        b = lerp(0.05, 0.4, t);
      } else {
        // Red to dark
        const t = lifeRatio / 0.3;
        r = lerp(0.2, 1, t);
        g = lerp(0.02, 0.3, t);
        b = lerp(0.0, 0.05, t);
      }
      colorArr[visibleCount * 3] = r;
      colorArr[visibleCount * 3 + 1] = g;
      colorArr[visibleCount * 3 + 2] = b;

      visibleCount++;
    }

    // Clear remaining
    for (let i = visibleCount; i < maxCount; i++) {
      dummy.position.set(0, -100, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colorArr, 3)
    );

    // Remove dead sparks
    sparksRef.current = sparks.filter((s) => s.life > 0);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Dust particle background ───
function DustParticles() {
  const count = isMobile() ? 40 : 80;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = randomRange(-5, 5);
      arr[i * 3 + 1] = randomRange(-3, 3);
      arr[i * 3 + 2] = randomRange(-3, 1);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      y += delta * 0.05;
      if (y > 3) y = -3;
      pos.setY(i, y);

      let x = pos.getX(i);
      x += Math.sin(Date.now() * 0.0003 + i) * delta * 0.02;
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#3a3632"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Impact light ───
function ImpactLight({
  lightRef,
}: {
  lightRef: React.RefObject<THREE.PointLight | null>;
}) {
  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 0]}
      intensity={0}
      color="#FBBF24"
      distance={8}
      decay={2}
    />
  );
}

// ─── Easing functions ───
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Main exported component ───
export function FlintIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const flashInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // Poll flash value from scene (bridge between R3F and DOM)
  const flashValueRef = useRef(0);

  const handleComplete = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete]);

  // Flash overlay sync
  useEffect(() => {
    flashInterval.current = setInterval(() => {
      setFlashOpacity(flashValueRef.current);
    }, 16);
    return () => clearInterval(flashInterval.current);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease-out",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: BG_COLOR }}
        dpr={[1, 1.5]}
      >
        <SceneControllerWrapper
          onComplete={handleComplete}
          flashValueRef={flashValueRef}
        />
      </Canvas>

      {/* White flash overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#FFFFFF",
          opacity: flashOpacity,
          transition: "opacity 0.05s linear",
        }}
      />

      {/* Warm glow overlay during final phase */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(251,146,60,0.08) 0%, transparent 60%)",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      />
    </div>
  );
}

// Wrapper to bridge flash value
function SceneControllerWrapper({
  onComplete,
  flashValueRef,
}: {
  onComplete: () => void;
  flashValueRef: React.MutableRefObject<number>;
}) {
  // We need to pass flashRef into the scene - use a trick
  return (
    <SceneControllerBridge
      onComplete={onComplete}
      flashValueRef={flashValueRef}
    />
  );
}

function SceneControllerBridge({
  onComplete,
  flashValueRef,
}: {
  onComplete: () => void;
  flashValueRef: React.MutableRefObject<number>;
}) {
  const stoneL = useRef<THREE.Mesh>(null);
  const stoneR = useRef<THREE.Mesh>(null);
  const impactLight = useRef<THREE.PointLight>(null);
  const sparksRef = useRef<SparkData[]>([]);
  const logoRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const completedRef = useRef(false);
  const { camera } = useThree();

  const shakeRef = useRef({ intensity: 0, decay: 0.9 });

  const emitSparks = useCallback(
    (origin: THREE.Vector3, count: number, speedMult: number, lifeMult: number) => {
      const mobile = isMobile();
      const actualCount = mobile ? Math.floor(count * 0.4) : count;
      const newSparks: SparkData[] = [];
      for (let i = 0; i < actualCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.8 - Math.PI * 0.1;
        const speed = randomRange(1.5, 5) * speedMult;
        newSparks.push({
          position: origin.clone(),
          velocity: new THREE.Vector3(
            Math.cos(theta) * Math.cos(phi) * speed,
            Math.abs(Math.sin(phi)) * speed * 0.8 + randomRange(0.5, 2),
            Math.sin(theta) * Math.cos(phi) * speed * 0.4
          ),
          life: randomRange(0.4, 1.2) * lifeMult,
          maxLife: randomRange(0.4, 1.2) * lifeMult,
          size: randomRange(0.5, 1.5),
          colorPhase: 0,
        });
      }
      sparksRef.current.push(...newSparks);
    },
    []
  );

  // Track which beats already fired their one-shot effects
  const beat1Fired = useRef(false);
  const beat2Fired = useRef(false);
  const beat3Fired = useRef(false);

  useFrame((_, delta) => {
    const t = (timeRef.current += delta);
    const sL = stoneL.current;
    const sR = stoneR.current;
    const light = impactLight.current;
    const cam = camera;

    if (!sL || !sR || !light) return;

    const baseCamZ = 4;
    let targetZ = baseCamZ;

    // ─── BEAT 1: 0 ~ 1.2s ───
    if (t < 1.2) {
      const p = t / 1.2;

      sL.scale.setScalar(1);
      sR.scale.setScalar(1);

      const lx = lerp(-3, -0.15, easeOutCubic(p));
      const ly = lerp(-1.5, 0, easeOutCubic(p));
      sL.position.set(lx, ly, 0);
      sL.rotation.z = lerp(-0.5, 0.2, p);

      const rx = lerp(3, 0.15, easeOutCubic(p));
      const ry = lerp(1.5, 0, easeOutCubic(p));
      sR.position.set(rx, ry, 0);
      sR.rotation.z = lerp(0.5, -0.3, p);

      if (p > 0.93 && !beat1Fired.current) {
        beat1Fired.current = true;
        emitSparks(new THREE.Vector3(-0.2, 0, 0), 10, 0.8, 0.8);
        light.position.set(-0.2, 0, 0);
        light.intensity = 8;
        shakeRef.current.intensity = 0.04;
        const matL = sL.material as THREE.MeshStandardMaterial;
        matL.emissive.set("#EA580C");
        matL.emissiveIntensity = 0.3;
      }

      if (p > 0.97) {
        const bp = (p - 0.97) / 0.03;
        sL.position.x = lerp(-0.15, -1.2, bp);
        sL.position.y = lerp(0, 0.3, bp);
        sR.position.x = lerp(0.15, 1.2, bp);
        sR.position.y = lerp(0, -0.3, bp);
      }
    }

    // ─── BEAT 2: 1.2 ~ 2.4s ───
    else if (t < 2.4) {
      const p = (t - 1.2) / 1.2;

      sL.scale.setScalar(1);
      sR.scale.setScalar(1);

      const lx = lerp(-1.2, 0.2, easeInOutCubic(p));
      const ly = lerp(0.3, 0, easeInOutCubic(p)) + Math.sin(p * Math.PI) * 0.4;
      sL.position.set(lx, ly, 0);
      sL.rotation.z = lerp(0.2, -0.4, p);

      const rx = lerp(1.2, -0.2, easeInOutCubic(p));
      const ry = lerp(-0.3, 0, easeInOutCubic(p)) - Math.sin(p * Math.PI) * 0.3;
      sR.position.set(rx, ry, 0);
      sR.rotation.z = lerp(-0.3, 0.5, p);

      targetZ = lerp(baseCamZ, 3.5, p * 0.5);

      if (p > 0.90 && !beat2Fired.current) {
        beat2Fired.current = true;
        emitSparks(new THREE.Vector3(0.15, 0, 0), 18, 1.2, 1.0);
        light.position.set(0.15, 0, 0);
        light.intensity = 12;
        shakeRef.current.intensity = 0.06;
        const matL = sL.material as THREE.MeshStandardMaterial;
        const matR = sR.material as THREE.MeshStandardMaterial;
        matL.emissive.set("#F59E0B");
        matL.emissiveIntensity = 0.6;
        matR.emissive.set("#F59E0B");
        matR.emissiveIntensity = 0.5;
      }

      if (p > 0.95) {
        const bp = (p - 0.95) / 0.05;
        sL.position.x = lerp(0.2, -2.5, bp);
        sR.position.x = lerp(-0.2, 2.5, bp);
      }
    }

    // ─── BEAT 3: 2.4 ~ 4.0s ───
    else if (t < 4.0) {
      const dur = 1.6;
      const p = (t - 2.4) / dur;

      targetZ = lerp(3.5, 2.8, p);

      if (p < 0.2) {
        const tp = p / 0.2;
        sL.scale.setScalar(1);
        sR.scale.setScalar(1);
        sL.position.set(lerp(-2.5, -3.5, easeOutCubic(tp)), 0, 0);
        sR.position.set(lerp(2.5, 3.5, easeOutCubic(tp)), 0, 0);
        sL.rotation.z = -0.6;
        sR.rotation.z = 0.6;
      } else if (p < 0.35) {
        sL.position.set(-3.5, 0, 0);
        sR.position.set(3.5, 0, 0);
      } else if (p < 0.55) {
        const rp = (p - 0.35) / 0.2;
        sL.position.set(lerp(-3.5, 0, easeInCubic(rp)), 0, 0);
        sR.position.set(lerp(3.5, 0, easeInCubic(rp)), 0, 0);
        sL.rotation.z = lerp(-0.6, 0, rp);
        sR.rotation.z = lerp(0.6, 0, rp);
      } else if (p < 0.60) {
        const ip = (p - 0.55) / 0.05;

        if (!beat3Fired.current) {
          beat3Fired.current = true;
          emitSparks(new THREE.Vector3(0, 0, 0), 80, 2.0, 1.5);
          light.position.set(0, 0, 0);
          light.intensity = 25;
          shakeRef.current.intensity = 0.12;
          flashValueRef.current = 1;
        }

        sL.position.set(0, 0, 0);
        sR.position.set(0, 0, 0);
        const fadeScale = Math.max(0, 1 - ip);
        sL.scale.setScalar(fadeScale);
        sR.scale.setScalar(fadeScale);

        const matL = sL.material as THREE.MeshStandardMaterial;
        const matR = sR.material as THREE.MeshStandardMaterial;
        matL.emissive.set("#FFFFFF");
        matL.emissiveIntensity = 3 * ip;
        matR.emissive.set("#FFFFFF");
        matR.emissiveIntensity = 3 * ip;
      } else {
        sL.scale.setScalar(0);
        sR.scale.setScalar(0);

        flashValueRef.current = Math.max(0, flashValueRef.current - delta * 2.5);

        if (p < 0.75 && Math.random() < 0.3) {
          emitSparks(
            new THREE.Vector3(randomRange(-0.8, 0.8), randomRange(-0.2, 0.2), 0),
            3,
            0.5,
            0.8
          );
        }
      }
    }

    // ─── BEAT 4: 4.0 ~ 5.5s ───
    else if (t < 5.5) {
      const p = (t - 4.0) / 1.5;

      sL.scale.setScalar(0);
      sR.scale.setScalar(0);
      flashValueRef.current = Math.max(0, flashValueRef.current - delta * 2);

      if (logoRef.current) {
        logoRef.current.visible = true;
        const logoOpacity = Math.min(1, p * 2.5);
        logoRef.current.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material && "opacity" in mesh.material) {
            (mesh.material as THREE.MeshBasicMaterial).opacity = logoOpacity;
          }
        });
      }

      if (p < 0.6 && Math.random() < 0.15) {
        sparksRef.current.push({
          position: new THREE.Vector3(randomRange(-1, 1), randomRange(0.5, 1.5), 0),
          velocity: new THREE.Vector3(randomRange(-0.2, 0.2), randomRange(-0.5, -0.1), 0),
          life: randomRange(0.5, 1),
          maxLife: randomRange(0.5, 1),
          size: randomRange(0.3, 0.8),
          colorPhase: 1,
        });
      }

      if (p > 0.85 && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    } else {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }

    // ── Decay ──
    light.intensity *= 0.9;

    if (sL.scale.x > 0.01) {
      const matL = sL.material as THREE.MeshStandardMaterial;
      matL.emissiveIntensity *= 0.94;
    }
    if (sR.scale.x > 0.01) {
      const matR = sR.material as THREE.MeshStandardMaterial;
      matR.emissiveIntensity *= 0.94;
    }

    // ── Camera ──
    const shake = shakeRef.current;
    if (shake.intensity > 0.001) {
      cam.position.x = (Math.random() - 0.5) * shake.intensity;
      cam.position.y = (Math.random() - 0.5) * shake.intensity;
      shake.intensity *= shake.decay;
    } else {
      cam.position.x = lerp(cam.position.x, 0, 0.1);
      cam.position.y = lerp(cam.position.y, 0, 0.1);
    }
    cam.position.z = lerp(cam.position.z, targetZ, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.15} color="#2a2420" />
      <directionalLight position={[2, 3, 4]} intensity={0.3} color="#FDE68A" />
      <ImpactLight lightRef={impactLight} />
      <DustParticles />
      <Stone stoneRef={stoneL} scale={1} seed={0} />
      <Stone stoneRef={stoneR} scale={0.9} seed={1} />
      <SparkSystem sparksRef={sparksRef} />

      <group ref={logoRef} visible={false} position={[0, 0, 0.5]}>
        <Text
          fontSize={0.55}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
          material-transparent
          material-opacity={0}
        >
          FLINT
        </Text>
        <Text
          fontSize={0.1}
          color="#A8A29E"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.45, 0]}
          material-transparent
          material-opacity={0}
        >
          {"\uC791\uC740 \uBD88\uAF43\uC774 \uC2DC\uC7A5\uC744 \uBC1D\uD789\uB2C8\uB2E4"}
        </Text>
      </group>
    </>
  );
}
