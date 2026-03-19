"use client";

import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ───
const BG_COLOR = "#0a0a0a";
const GRAVITY = -12;

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
function easeIn3(t: number) { return t * t * t; }
function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeOut4(t: number) { return 1 - Math.pow(1 - t, 4); }

// ─── Rough stone geometry ───
function makeStoneGeo(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const len = Math.sqrt(px * px + py * py + pz * pz) || 1;
    const hash =
      Math.sin(px * 12.9898 + py * 78.233 + seed * 43.1) *
      Math.cos(pz * 37.719 + px * 93.7 + seed * 17.3);
    const disp = (hash - Math.floor(hash)) * 2 - 1;
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
  life: number;
  maxLife: number;
  size: number;
}

// ─── Spark system ───
function SparkSystem({ sparksRef }: { sparksRef: React.MutableRefObject<SparkData[]> }) {
  const maxCount = mobile() ? 80 : 150;
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

      s.vel.y += GRAVITY * delta;
      s.pos.add(s.vel.clone().multiplyScalar(delta));

      const lr = s.life / s.maxLife;
      dummy.position.copy(s.pos);

      const speed = s.vel.length();
      const stretch = Math.min(speed * 0.04, 3);
      const sc = s.size * Math.max(lr, 0.1);
      dummy.scale.set(sc * (1 + stretch * 0.5), sc, sc * (1 + stretch * 0.5));

      if (speed > 0.1) {
        dummy.lookAt(s.pos.clone().add(s.vel.clone().normalize()));
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      let r: number, g: number, b: number;
      if (lr > 0.8) {
        r = 1; g = lerp(0.9, 1, (lr - 0.8) / 0.2); b = lerp(0.6, 1, (lr - 0.8) / 0.2);
      } else if (lr > 0.4) {
        const t2 = (lr - 0.4) / 0.4;
        r = 1; g = lerp(0.27, 0.9, t2); b = lerp(0, 0.6, t2);
      } else {
        const t2 = lr / 0.4;
        r = lerp(0.15, 1, t2); g = lerp(0, 0.27, t2); b = 0;
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
    const p = shock.time / 0.35;
    if (p >= 1) {
      shock.active = false;
      ring.visible = false;
      return;
    }
    ring.visible = true;
    ring.position.copy(shock.origin);
    const sc = p * 2.5;
    ring.scale.set(sc, sc, 1);
    (ring.material as THREE.MeshBasicMaterial).opacity = 0.2 * (1 - p);
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.9, 1, 32]} />
      <meshBasicMaterial color="#FBBF24" transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Dust particles ───
function DustParticles() {
  const count = mobile() ? 12 : 25;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = rng(-3, 3);
      arr[i * 3 + 1] = rng(-2, 2);
      arr[i * 3 + 2] = rng(-2, 0.5);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * 0.03;
      if (y > 2) y = -2;
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

// ─── Scene: 중앙에서 탁탁 + 확 밝아짐 ───
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
  const hit1 = useRef(false);
  const hit2 = useRef(false);
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

    // ═══ 탁 1: 0 ~ 0.6s — 가까이서 빠르게 중앙으로 ═══
    if (time < 0.6) {
      const dur = 0.6;
      const p = time / dur;
      L.visible = true; R.visible = true;
      L.scale.setScalar(1); R.scale.setScalar(1);

      const approach = Math.min(p / 0.75, 1);
      const eP = easeIn3(approach);

      // 좌우에서 중앙 가까이 시작 (1.2 거리)
      L.position.set(lerp(-1.2, -0.06, eP), lerp(0.08, 0, eP), 0);
      R.position.set(lerp(1.2, 0.06, eP), lerp(-0.08, 0, eP), 0);
      L.rotation.z = lerp(-0.3, 0.1, eP);
      R.rotation.z = lerp(0.3, -0.1, eP);

      // 충돌 순간
      if (p > 0.75 && !hit1.current) {
        hit1.current = true;
        const hitPos = new THREE.Vector3(0, 0, 0);
        emitSparks(hitPos, 12, 0.6, 0.6);
        light.position.copy(hitPos);
        light.intensity = 6;
        shakeI.current = 0.04;
        triggerShock(hitPos);
        const mL = L.material as THREE.MeshStandardMaterial;
        mL.emissive.set("#EA580C");
        mL.emissiveIntensity = 0.5;
      }

      // 충돌 후 살짝 튕김
      if (p > 0.75) {
        const bp = easeOut4((p - 0.75) / 0.25);
        L.position.x = lerp(-0.06, -0.8, bp);
        R.position.x = lerp(0.06, 0.8, bp);
      }
    }

    // ═══ 탁 2: 0.6 ~ 1.3s — 더 강하게 중앙 충돌 ═══
    else if (time < 1.3) {
      const dur = 0.7;
      const p = (time - 0.6) / dur;
      L.scale.setScalar(1); R.scale.setScalar(1);

      const approach = Math.min(p / 0.65, 1);
      const eP = easeIn3(approach);

      L.position.set(lerp(-0.8, 0, eP), 0, 0);
      R.position.set(lerp(0.8, 0, eP), 0, 0);
      L.rotation.z = lerp(0.1, 0, eP);
      R.rotation.z = lerp(-0.1, 0, eP);

      // 두 번째 충돌 — 더 강하게
      if (p > 0.65 && !hit2.current) {
        hit2.current = true;
        emitSparks(new THREE.Vector3(0, 0, 0), 50, 1.8, 1.2);
        light.position.set(0, 0, 0);
        light.intensity = 15;
        shakeI.current = 0.1;
        flashValueRef.current = 1;
        triggerShock(new THREE.Vector3(0, 0, 0));

        const mL = L.material as THREE.MeshStandardMaterial;
        const mR = R.material as THREE.MeshStandardMaterial;
        mL.emissive.set("#FFFFFF"); mL.emissiveIntensity = 3;
        mR.emissive.set("#FFFFFF"); mR.emissiveIntensity = 3;
      }

      // 충돌 후 돌 사라짐 + 밝아짐
      if (p > 0.65) {
        const fade = Math.max(0, 1 - ((p - 0.65) / 0.35) * 2);
        L.scale.setScalar(fade);
        R.scale.setScalar(fade);
        if (fade <= 0) {
          L.visible = false;
          R.visible = false;
        }
      }
    }

    // ═══ 1.3 ~ 2.8s — 밝아진 후 로고 등장 ═══
    else if (time < 2.8) {
      const p = (time - 1.3) / 1.5;
      L.visible = false; R.visible = false;

      // 플래시 서서히 감소
      flashValueRef.current = Math.max(0, flashValueRef.current - delta * 2.0);

      // 잔여 불꽃
      if (p < 0.3 && Math.random() < 0.15) {
        sparksRef.current.push({
          pos: new THREE.Vector3(rng(-0.5, 0.5), rng(0.2, 0.8), 0),
          vel: new THREE.Vector3(rng(-0.2, 0.2), rng(-0.3, 0.1), 0),
          life: rng(0.3, 0.6),
          maxLife: rng(0.3, 0.6),
          size: rng(0.2, 0.5),
        });
      }

      // 로고 등장
      if (logoRef.current) {
        logoRef.current.visible = true;
        const op = Math.min(1, p * 2.5);
        logoRef.current.traverse((child) => {
          const m = child as THREE.Mesh;
          if (m.material && "opacity" in m.material) {
            (m.material as THREE.MeshBasicMaterial).opacity = op;
          }
        });
      }

      if (p > 0.8 && !done.current) {
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
      mL.emissiveIntensity *= 0.9;
    }
    if (R.visible) {
      const mR = R.material as THREE.MeshStandardMaterial;
      mR.emissiveIntensity *= 0.9;
    }

    // ── Camera shake ──
    if (shakeI.current > 0.001) {
      camera.position.x = (Math.random() - 0.5) * shakeI.current;
      camera.position.y = (Math.random() - 0.5) * shakeI.current;
      shakeI.current *= 0.85;
    } else {
      camera.position.x = lerp(camera.position.x, 0, 0.15);
      camera.position.y = lerp(camera.position.y, 0, 0.15);
    }
    camera.position.z = lerp(camera.position.z, 4, 0.06);
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
