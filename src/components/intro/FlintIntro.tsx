"use client";

import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ───
const GRAVITY = -12;
const BG_COLOR = "#0a0a0a";

// ─── Helpers ───
function mobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}
function rng(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── Easing ───
function easeIn2(t: number) { return t * t; }
function easeIn4(t: number) { return t * t * t * t; }
function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeOut4(t: number) { return 1 - Math.pow(1 - t, 4); }
function easeInOut3(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Rough stone geometry ───
function makeStoneGeo(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 1);
  const pos = geo.attributes.position;
  // Each vertex gets unique random displacement using seed
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const len = Math.sqrt(px * px + py * py + pz * pz) || 1;
    // Pseudo-random per-vertex using position + seed
    const hash =
      Math.sin(px * 12.9898 + py * 78.233 + seed * 43.1) *
      Math.cos(pz * 37.719 + px * 93.7 + seed * 17.3);
    const disp = (hash - Math.floor(hash)) * 2 - 1; // -1 to 1
    const amount = disp * 0.15 * radius;
    const nx = px / len;
    const ny = py / len;
    const nz = pz / len;
    pos.setXYZ(i, px + nx * amount, py + ny * amount, pz + nz * amount);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// ─── Stone mesh ───
function Stone({
  stoneRef,
  radius = 0.25,
  seed = 0,
}: {
  stoneRef: React.RefObject<THREE.Mesh | null>;
  radius?: number;
  seed?: number;
}) {
  const geometry = useMemo(() => makeStoneGeo(radius, seed), [radius, seed]);
  return (
    <mesh ref={stoneRef} geometry={geometry}>
      <meshStandardMaterial
        color="#3a3530"
        roughness={0.85}
        metalness={0.15}
        flatShading
        emissive="#000000"
        emissiveIntensity={0}
      />
    </mesh>
  );
}

// ─── Spark data ───
interface SparkData {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  prevPos: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

// ─── Spark system (elongated trail via stretched instances) ───
function SparkSystem({ sparksRef }: { sparksRef: React.MutableRefObject<SparkData[]> }) {
  const maxCount = mobile() ? 100 : 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArr = useMemo(() => new Float32Array(maxCount * 3).fill(1), [maxCount]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const sparks = sparksRef.current;
    let idx = 0;

    for (let i = 0; i < sparks.length && idx < maxCount; i++) {
      const s = sparks[i];
      s.life -= delta;
      if (s.life <= 0) continue;

      s.prevPos.copy(s.pos);
      s.vel.y += GRAVITY * delta;
      s.pos.add(s.vel.clone().multiplyScalar(delta));

      const lr = s.life / s.maxLife;
      dummy.position.copy(s.pos);

      // Elongate along velocity direction (trail effect)
      const speed = s.vel.length();
      const stretch = Math.min(speed * 0.04, 3);
      const sc = s.size * Math.max(lr, 0.1);
      dummy.scale.set(sc * (1 + stretch * 0.5), sc, sc * (1 + stretch * 0.5));

      // Orient along velocity
      if (speed > 0.1) {
        dummy.lookAt(s.pos.clone().add(s.vel.clone().normalize()));
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      // Color lifecycle: white → #FF8C00 → #FF4500 → fade
      let r: number, g: number, b: number;
      if (lr > 0.8) {
        r = 1; g = lerp(0.9, 1, (lr - 0.8) / 0.2); b = lerp(0.6, 1, (lr - 0.8) / 0.2);
      } else if (lr > 0.4) {
        const t = (lr - 0.4) / 0.4;
        r = 1; g = lerp(0.27, 0.9, t); b = lerp(0, 0.6, t);
      } else {
        const t = lr / 0.4;
        r = lerp(0.15, 1, t); g = lerp(0, 0.27, t); b = 0;
      }
      colorArr[idx * 3] = r;
      colorArr[idx * 3 + 1] = g;
      colorArr[idx * 3 + 2] = b;
      idx++;
    }

    for (let i = idx; i < maxCount; i++) {
      dummy.position.set(0, -100, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(colorArr, 3));
    sparksRef.current = sparks.filter((s) => s.life > 0);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <sphereGeometry args={[0.018, 4, 4]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Shockwave ring ───
function Shockwave({ shockRef }: { shockRef: React.MutableRefObject<{ active: boolean; time: number; origin: THREE.Vector3 }> }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const ring = ringRef.current;
    const shock = shockRef.current;
    if (!ring || !shock.active) {
      if (ring) ring.visible = false;
      return;
    }
    shock.time += delta;
    const p = shock.time / 0.4;
    if (p >= 1) {
      shock.active = false;
      ring.visible = false;
      return;
    }
    ring.visible = true;
    ring.position.copy(shock.origin);
    const sc = p * 3;
    ring.scale.set(sc, sc, 1);
    (ring.material as THREE.MeshBasicMaterial).opacity = 0.15 * (1 - p);
  });

  return (
    <mesh ref={ringRef} visible={false} rotation={[0, 0, 0]}>
      <ringGeometry args={[0.9, 1, 32]} />
      <meshBasicMaterial color="#FBBF24" transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Dust particles ───
function DustParticles() {
  const count = mobile() ? 15 : 30;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = rng(-4, 4);
      arr[i * 3 + 1] = rng(-2.5, 2.5);
      arr[i * 3 + 2] = rng(-2, 0.5);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * 0.03;
      if (y > 2.5) y = -2.5;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.0002 + i * 1.7) * delta * 0.01);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#4a4540" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

// ─── Scene controller ───
function Scene({
  onComplete,
  flashValueRef,
}: {
  onComplete: () => void;
  flashValueRef: React.MutableRefObject<number>;
}) {
  const sL = useRef<THREE.Mesh>(null);
  const sR = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const sparksRef = useRef<SparkData[]>([]);
  const logoRef = useRef<THREE.Group>(null);
  const shockRef = useRef({ active: false, time: 0, origin: new THREE.Vector3() });
  const t = useRef(0);
  const done = useRef(false);
  const beat1F = useRef(false);
  const beat2F = useRef(false);
  const beat3F = useRef(false);
  const shakeI = useRef(0);
  const { camera } = useThree();

  const emitSparks = useCallback((origin: THREE.Vector3, count: number, speedMult: number, lifeMult: number) => {
    const n = mobile() ? Math.floor(count * 0.5) : count;
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = rng(-0.2, Math.PI * 0.45);
      const spd = rng(2, 6) * speedMult;
      sparksRef.current.push({
        pos: origin.clone(),
        vel: new THREE.Vector3(
          Math.cos(theta) * Math.cos(phi) * spd,
          Math.abs(Math.sin(phi)) * spd + rng(0.5, 2.5),
          Math.sin(theta) * Math.cos(phi) * spd * 0.3
        ),
        prevPos: origin.clone(),
        life: rng(0.3, 1.0) * lifeMult,
        maxLife: rng(0.3, 1.0) * lifeMult,
        size: rng(0.4, 1.2),
      });
    }
  }, []);

  const triggerShock = useCallback((origin: THREE.Vector3) => {
    shockRef.current = { active: true, time: 0, origin: origin.clone() };
  }, []);

  useFrame((_, delta) => {
    const time = (t.current += delta);
    const L = sL.current;
    const R = sR.current;
    const light = lightRef.current;
    if (!L || !R || !light) return;

    const camZ0 = 4;
    let camZTarget = camZ0;

    // ═══ BEAT 1: 0 ~ 1.2s ═══
    if (time < 1.2) {
      const dur = 1.2;
      const p = time / dur;
      L.scale.setScalar(1); R.scale.setScalar(1);
      L.visible = true; R.visible = true;

      // Left stone: easeIn from bottom-left, accelerating
      const eP = easeIn2(Math.min(p / 0.85, 1)); // approach phase
      const lx = lerp(-3.5, -0.08, eP);
      const ly = lerp(-2, 0.05, eP);
      L.position.set(lx, ly, 0);
      L.rotation.z = lerp(-0.8, 0.15, eP);
      L.rotation.x = lerp(0.2, 0, eP);

      // Right stone: easeIn from top-right
      const rx = lerp(3.5, 0.08, eP);
      const ry = lerp(2, -0.05, eP);
      R.position.set(rx, ry, 0);
      R.rotation.z = lerp(0.7, -0.2, eP);
      R.rotation.x = lerp(-0.2, 0, eP);

      // Hit at p ≈ 0.85 → hitstop → bounce
      if (p > 0.85 && p < 0.87) {
        // Hitstop: freeze positions
        L.position.set(-0.08, 0.05, 0);
        R.position.set(0.08, -0.05, 0);
      }
      if (p > 0.85 && !beat1F.current) {
        beat1F.current = true;
        const hitPos = new THREE.Vector3(-0.1, 0, 0);
        emitSparks(hitPos, 10, 0.7, 0.7);
        light.position.copy(hitPos);
        light.intensity = 5;
        shakeI.current = 0.03;
        triggerShock(hitPos);
        (L.material as THREE.MeshStandardMaterial).emissive.set("#EA580C");
        (L.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
      }
      // Bounce out (easeOut - fast start, slow end)
      if (p > 0.87) {
        const bp = easeOut4((p - 0.87) / 0.13);
        L.position.x = lerp(-0.08, -1.5, bp);
        L.position.y = lerp(0.05, 0.4, bp);
        R.position.x = lerp(0.08, 1.5, bp);
        R.position.y = lerp(-0.05, -0.4, bp);
      }
    }

    // ═══ BEAT 2: 1.2 ~ 2.4s ═══
    else if (time < 2.4) {
      const dur = 1.2;
      const p = (time - 1.2) / dur;
      L.scale.setScalar(1); R.scale.setScalar(1);

      // Arc motion: curved path with sin for y-axis arc
      const approach = Math.min(p / 0.82, 1);
      const eP = easeIn2(approach);
      // Left comes from left with upward arc
      const lx = lerp(-1.5, 0.1, eP);
      const ly = lerp(0.4, 0, eP) + Math.sin(approach * Math.PI) * 0.5;
      L.position.set(lx, ly, 0);
      L.rotation.z = lerp(0.3, -0.25, eP);

      // Right comes from right with downward arc
      const rx = lerp(1.5, -0.1, eP);
      const ry = lerp(-0.4, 0, eP) - Math.sin(approach * Math.PI) * 0.4;
      R.position.set(rx, ry, 0);
      R.rotation.z = lerp(-0.3, 0.3, eP);

      // Camera slow zoom
      camZTarget = lerp(camZ0, 3.8, p * 0.4);

      // Hit at p ≈ 0.82 → hitstop → spin bounce
      if (p > 0.82 && p < 0.85) {
        L.position.set(0.1, Math.sin(0.82 * Math.PI) * 0.5, 0);
        R.position.set(-0.1, -Math.sin(0.82 * Math.PI) * 0.4, 0);
      }
      if (p > 0.82 && !beat2F.current) {
        beat2F.current = true;
        const hitPos = new THREE.Vector3(0.05, 0.05, 0);
        emitSparks(hitPos, 18, 1.1, 0.9);
        light.position.copy(hitPos);
        light.intensity = 8;
        shakeI.current = 0.05;
        triggerShock(hitPos);
        const mL = L.material as THREE.MeshStandardMaterial;
        const mR = R.material as THREE.MeshStandardMaterial;
        mL.emissive.set("#F59E0B"); mL.emissiveIntensity = 0.7;
        mR.emissive.set("#F59E0B"); mR.emissiveIntensity = 0.6;
      }
      // Bounce with spin
      if (p > 0.85) {
        const bp = easeOut3((p - 0.85) / 0.15);
        L.position.x = lerp(0.1, -2.8, bp);
        L.position.y = lerp(0.3, 0, bp);
        R.position.x = lerp(-0.1, 2.8, bp);
        R.position.y = lerp(-0.2, 0, bp);
        // Spin on bounce
        L.rotation.z = lerp(-0.25, -0.25 + 0.26, Math.sin(bp * Math.PI));
        R.rotation.z = lerp(0.3, 0.3 - 0.26, Math.sin(bp * Math.PI));
      }
    }

    // ═══ BEAT 3: 2.4 ~ 4.0s ═══
    else if (time < 4.0) {
      const dur = 1.6;
      const p = (time - 2.4) / dur;
      camZTarget = lerp(3.8, 3.0, Math.min(p * 1.5, 1));

      // Phase A: spread wide (0 ~ 0.15)
      if (p < 0.15) {
        const tp = easeOut3(p / 0.15);
        L.scale.setScalar(1); R.scale.setScalar(1);
        L.position.set(lerp(-2.8, -3.8, tp), 0, 0);
        R.position.set(lerp(2.8, 3.8, tp), 0, 0);
        L.rotation.z = -0.5; R.rotation.z = 0.5;
      }
      // Phase B: tension hold with vibration (0.15 ~ 0.4)
      else if (p < 0.4) {
        const vibTime = time * 30;
        const vib = Math.sin(vibTime) * 0.008;
        L.position.set(-3.8 + vib, Math.sin(vibTime * 1.3) * 0.005, 0);
        R.position.set(3.8 - vib, Math.sin(vibTime * 0.9) * 0.005, 0);
      }
      // Phase C: explosive rush (0.4 ~ 0.6) - easeIn4 (extreme acceleration)
      else if (p < 0.6) {
        const rp = easeIn4((p - 0.4) / 0.2);
        L.position.set(lerp(-3.8, 0, rp), 0, 0);
        R.position.set(lerp(3.8, 0, rp), 0, 0);
        L.rotation.z = lerp(-0.5, 0, rp);
        R.rotation.z = lerp(0.5, 0, rp);
        // Quick zoom on approach
        camZTarget = lerp(3.0, 2.5, rp);
      }
      // Phase D: IMPACT + hitstop + dissolve (0.6 ~ 0.65)
      else if (p < 0.65) {
        const ip = (p - 0.6) / 0.05;
        // Hitstop for first 0.05s-equivalent
        if (ip < 0.3) {
          L.position.set(0, 0, 0); R.position.set(0, 0, 0);
        }
        if (!beat3F.current) {
          beat3F.current = true;
          emitSparks(new THREE.Vector3(0, 0, 0), 70, 2.0, 1.3);
          light.position.set(0, 0, 0);
          light.intensity = 15;
          shakeI.current = 0.1;
          flashValueRef.current = 1;
          triggerShock(new THREE.Vector3(0, 0, 0));
        }
        // Dissolve stones
        const fade = Math.max(0, 1 - ip * 2);
        L.scale.setScalar(fade); R.scale.setScalar(fade);
        const mL = L.material as THREE.MeshStandardMaterial;
        const mR = R.material as THREE.MeshStandardMaterial;
        mL.emissive.set("#FFFFFF"); mL.emissiveIntensity = ip * 4;
        mR.emissive.set("#FFFFFF"); mR.emissiveIntensity = ip * 4;
      }
      // Phase E: post-flash (0.65 ~ 1.0)
      else {
        L.scale.setScalar(0); R.scale.setScalar(0);
        L.visible = false; R.visible = false;
        flashValueRef.current = Math.max(0, flashValueRef.current - delta * 2.5);
        // Trailing sparks
        if (p < 0.8 && Math.random() < 0.25) {
          emitSparks(
            new THREE.Vector3(rng(-0.6, 0.6), rng(-0.15, 0.15), 0),
            2, 0.4, 0.7
          );
        }
      }
    }

    // ═══ BEAT 4: 4.0 ~ 5.5s ═══
    else if (time < 5.5) {
      const p = (time - 4.0) / 1.5;
      L.visible = false; R.visible = false;
      flashValueRef.current = Math.max(0, flashValueRef.current - delta * 1.5);
      camZTarget = lerp(2.5, camZ0, easeOut3(p));

      // Logo: revealed as flash recedes
      if (logoRef.current) {
        logoRef.current.visible = true;
        const op = Math.min(1, p * 2);
        logoRef.current.traverse((child) => {
          const m = child as THREE.Mesh;
          if (m.material && "opacity" in m.material) {
            (m.material as THREE.MeshBasicMaterial).opacity = op;
          }
        });
      }
      // Falling embers
      if (p < 0.5 && Math.random() < 0.12) {
        sparksRef.current.push({
          pos: new THREE.Vector3(rng(-0.8, 0.8), rng(0.4, 1.2), 0),
          vel: new THREE.Vector3(rng(-0.15, 0.15), rng(-0.3, 0), 0),
          prevPos: new THREE.Vector3(0, 0, 0),
          life: rng(0.4, 0.8),
          maxLife: rng(0.4, 0.8),
          size: rng(0.2, 0.6),
        });
      }
      if (p > 0.85 && !done.current) {
        done.current = true;
        onComplete();
      }
    } else if (!done.current) {
      done.current = true;
      onComplete();
    }

    // ── Decay ──
    light.intensity *= 0.88;
    if (L.visible) {
      const mL = L.material as THREE.MeshStandardMaterial;
      mL.emissiveIntensity *= 0.92;
    }
    if (R.visible) {
      const mR = R.material as THREE.MeshStandardMaterial;
      mR.emissiveIntensity *= 0.92;
    }

    // ── Camera ──
    if (shakeI.current > 0.001) {
      camera.position.x = (Math.random() - 0.5) * shakeI.current;
      camera.position.y = (Math.random() - 0.5) * shakeI.current;
      shakeI.current *= 0.88;
    } else {
      camera.position.x = lerp(camera.position.x, 0, 0.15);
      camera.position.y = lerp(camera.position.y, 0, 0.15);
    }
    camera.position.z = lerp(camera.position.z, camZTarget, 0.06);
  });

  return (
    <>
      <ambientLight intensity={0.12} color="#2a2420" />
      <directionalLight position={[2, 3, 4]} intensity={0.25} color="#FDE68A" />
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={0} color="#FBBF24" distance={8} decay={2} />
      <DustParticles />
      <Stone stoneRef={sL} radius={0.25} seed={0} />
      <Stone stoneRef={sR} radius={0.22} seed={7.5} />
      <SparkSystem sparksRef={sparksRef} />
      <Shockwave shockRef={shockRef} />
      <group ref={logoRef} visible={false} position={[0, 0, 0.5]}>
        <Text
          fontSize={0.5}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
          material-transparent
          material-opacity={0}
        >
          FLINT
        </Text>
        <Text
          fontSize={0.09}
          color="#A8A29E"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.4, 0]}
          material-transparent
          material-opacity={0}
        >
          {"작은 불꽃이 시장을 밝힙니다"}
        </Text>
      </group>
    </>
  );
}

// ─── Main exported component ───
export function FlintIntro({ onComplete }: { onComplete: () => void }) {
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const flashRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const handleComplete = useCallback(() => {
    setFadeOut(true);
    setTimeout(onComplete, 800);
  }, [onComplete]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setFlashOpacity(flashRef.current), 16);
    return () => clearInterval(intervalRef.current);
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
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: BG_COLOR }}
        dpr={[1, 1.5]}
      >
        <Scene onComplete={handleComplete} flashValueRef={flashRef} />
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "#FFFFFF", opacity: flashOpacity, transition: "opacity 0.05s linear" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(251,146,60,0.06) 0%, transparent 55%)",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      />
    </div>
  );
}
