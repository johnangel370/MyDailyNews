"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// A converging "data network" background: glowing nodes drift on slowly
// rotating orbits biased toward the center, sparse connections form and
// dissolve between nearby nodes (preferring central pairs), and small bright
// pulses travel along active connections toward the center -- so everything
// on screen reads as data being gathered toward the login card. Tunables
// below are a moderate-energy starting point (see plan doc for rationale).
// ---------------------------------------------------------------------------
const NODE_COUNT = 90;
const MAX_EDGES = 140;
const MAX_NEIGHBORS_PER_NODE = 3;
const CONNECT_RADIUS_FACTOR = 0.35; // fraction of min(viewport width, height)
const CENTER_BIAS = 0.6; // higher = edges cluster more toward screen center
const EDGE_RECOMPUTE_INTERVAL = 0.4; // seconds between topology recomputes
const EDGE_FADE_DURATION = 0.6; // seconds, both fade-in and fade-out
const MAX_PULSES = 10;
const PULSE_MIN_INTERVAL = 1.4;
const PULSE_MAX_INTERVAL = 3.0;
const PULSE_MIN_DURATION = 1.4;
const PULSE_MAX_DURATION = 2.6;
const FOLLOW_STRENGTH = 0.03; // per-frame lerp factor toward each node's home point
const JITTER_AMP = 0.12; // world-unit jitter amplitude on top of the home orbit

type Palette = { background: string; colorA: string; colorB: string };

// Hex literals are intentional here: this file is the sanctioned exception
// to the "no hardcoded color" rule (WebGL uniforms, not DOM/Tailwind).
//
// The canvas clears to an opaque `background` (not transparent) -- additive
// blending on a transparent canvas composited over a *light* DOM background
// washes out to invisible (additive glow needs headroom against a dark
// backdrop to read at all), so each theme gets its own opaque backdrop
// instead of trying to show the CSS gradient through the canvas. Light-mode
// dot colors are correspondingly more saturated than the old fbm palette so
// they have real contrast against a pale backdrop.
const DARK_PALETTE: Palette = {
  background: "#070a12",
  colorA: "#5b8cff",
  colorB: "#a07bff",
};
const LIGHT_PALETTE: Palette = {
  background: "#e9edf9",
  colorA: "#2f5fdb",
  colorB: "#7440d6",
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Shared point-sprite shader (glowing circular dot, perspective size
// attenuation, additive blending) reused for both nodes and pulses.
const pointVertexShader = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aScale;
  attribute float aAlpha;
  attribute float aColorMix;
  varying float vAlpha;
  varying float vColorMix;

  void main() {
    vAlpha = aAlpha;
    vColorMix = aColorMix;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

const pointFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vColorMix;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    // Mostly-solid disc with a soft antialiased edge (only the outer ~35%
    // fades), rather than a diffuse glow across the whole radius -- reads
    // as a defined node in both light and dark themes.
    float glow = 1.0 - smoothstep(0.55, 1.0, d);
    if (glow <= 0.001) discard;
    vec3 color = mix(uColorA, uColorB, vColorMix);
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`;

// Connection line shader: per-vertex alpha drives the form/dissolve fade,
// written from the CPU each frame (cheap at <=140 edges).
const lineVertexShader = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  }
`;

interface EdgeState {
  i: number;
  j: number;
  bornAt: number;
  diedAt: number | null; // null = alive/selected by the current topology pass
}

interface PulseState {
  i: number;
  j: number;
  t: number;
  duration: number;
  active: boolean;
}

function buildNodeSim() {
  const positions = new Float32Array(NODE_COUNT * 3);
  // Power-biased radius fraction: most nodes land closer to center, so the
  // point cloud is visibly denser in the middle and sparser at the edges.
  const homeRadiusFrac = Float32Array.from({ length: NODE_COUNT }, () =>
    Math.pow(Math.random(), 1.6)
  );
  const homeAngle = Float32Array.from(
    { length: NODE_COUNT },
    () => Math.random() * Math.PI * 2
  );
  const orbitSpeed = Float32Array.from(
    { length: NODE_COUNT },
    () => (Math.random() * 0.03 + 0.015) * (Math.random() < 0.5 ? -1 : 1)
  );
  const jitterPhase = Float32Array.from(
    { length: NODE_COUNT * 2 },
    () => Math.random() * Math.PI * 2
  );
  const baseZ = Float32Array.from(
    { length: NODE_COUNT },
    () => (Math.random() - 0.5) * 1.4
  );
  const colorMix = Float32Array.from({ length: NODE_COUNT }, () => Math.random());
  const scale = Float32Array.from(
    { length: NODE_COUNT },
    () => 0.7 + Math.random() * 0.6
  );
  const alpha = new Float32Array(NODE_COUNT).fill(0.7);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColorMix", new THREE.BufferAttribute(colorMix, 1));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));

  return {
    positions,
    homeRadiusFrac,
    homeAngle,
    orbitSpeed,
    jitterPhase,
    baseZ,
    alpha,
    geometry,
  };
}

function buildLineSim() {
  const positions = new Float32Array(MAX_EDGES * 2 * 3);
  const alpha = new Float32Array(MAX_EDGES * 2);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setDrawRange(0, 0);
  return { positions, alpha, geometry, active: [] as EdgeState[] };
}

function buildPulseSim() {
  const positions = new Float32Array(MAX_PULSES * 3);
  const alpha = new Float32Array(MAX_PULSES);
  const colorMix = new Float32Array(MAX_PULSES);
  const scale = new Float32Array(MAX_PULSES).fill(1.6);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute("aColorMix", new THREE.BufferAttribute(colorMix, 1));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  geometry.setDrawRange(0, 0);
  const pool: PulseState[] = Array.from({ length: MAX_PULSES }, () => ({
    i: 0,
    j: 0,
    t: 0,
    duration: 1,
    active: false,
  }));
  return { positions, alpha, geometry, pool };
}

function pulseTint(hex: string) {
  return new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), 0.55);
}

function NetworkScene({ palette }: { palette: Palette }) {
  const { viewport, gl } = useThree();

  // onCreated (below, on <Canvas>) only fires once on mount, so a theme
  // toggle after the canvas exists needs its own effect to re-clear.
  useEffect(() => {
    gl.setClearColor(palette.background, 1);
  }, [palette, gl]);

  const nodeSim = useMemo(buildNodeSim, []);
  const lineSim = useMemo(buildLineSim, []);
  const pulseSim = useMemo(buildPulseSim, []);

  const groupRef = useRef<THREE.Group>(null);
  const edgeTimerRef = useRef(0);
  const pulseTimerRef = useRef(
    PULSE_MIN_INTERVAL + Math.random() * (PULSE_MAX_INTERVAL - PULSE_MIN_INTERVAL)
  );

  const nodeUniforms = useMemo(
    () => ({
      uPixelRatio: { value: 1 },
      uSize: { value: 60 },
      uColorA: { value: new THREE.Color(palette.colorA) },
      uColorB: { value: new THREE.Color(palette.colorB) },
    }),
    // Created once; palette changes are applied in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const pulseUniforms = useMemo(
    () => ({
      uPixelRatio: { value: 1 },
      uSize: { value: 90 },
      uColorA: { value: pulseTint(palette.colorA) },
      uColorB: { value: pulseTint(palette.colorB) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const lineUniforms = useMemo(
    () => ({
      uColor: {
        value: new THREE.Color(palette.colorA).lerp(
          new THREE.Color(palette.colorB),
          0.5
        ),
      },
      uOpacity: { value: 0.35 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Sync uniforms whenever the theme (and therefore palette) changes.
  useEffect(() => {
    nodeUniforms.uColorA.value.set(palette.colorA);
    nodeUniforms.uColorB.value.set(palette.colorB);
    pulseUniforms.uColorA.value.copy(pulseTint(palette.colorA));
    pulseUniforms.uColorB.value.copy(pulseTint(palette.colorB));
    lineUniforms.uColor.value
      .set(palette.colorA)
      .lerp(new THREE.Color(palette.colorB), 0.5);
  }, [palette, nodeUniforms, pulseUniforms, lineUniforms]);

  function recomputeTopology(now: number, extentX: number, extentY: number) {
    const positions = nodeSim.positions;
    const connectRadius = Math.min(extentX, extentY) * CONNECT_RADIUS_FACTOR;
    const connectRadiusSq = connectRadius * connectRadius;

    const candidates: { i: number; j: number; score: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > connectRadiusSq) continue;
        const midX = (positions[i * 3] + positions[j * 3]) / 2;
        const midY = (positions[i * 3 + 1] + positions[j * 3 + 1]) / 2;
        const midDist = Math.sqrt(midX * midX + midY * midY);
        candidates.push({ i, j, score: distSq * (1 + midDist * CENTER_BIAS) });
      }
    }
    candidates.sort((a, b) => a.score - b.score);

    const neighborCounts = new Uint8Array(NODE_COUNT);
    const wantedKeys = new Set<number>();
    for (const c of candidates) {
      if (wantedKeys.size >= MAX_EDGES) break;
      if (neighborCounts[c.i] >= MAX_NEIGHBORS_PER_NODE) continue;
      if (neighborCounts[c.j] >= MAX_NEIGHBORS_PER_NODE) continue;
      wantedKeys.add(c.i * NODE_COUNT + c.j);
      neighborCounts[c.i]++;
      neighborCounts[c.j]++;
    }

    const active = lineSim.active;
    const toAdd = new Set(wantedKeys);
    for (const edge of active) {
      const key = edge.i * NODE_COUNT + edge.j;
      if (wantedKeys.has(key)) {
        toAdd.delete(key);
        edge.diedAt = null; // still wanted (or revived before fully fading)
      } else if (edge.diedAt === null) {
        edge.diedAt = now; // no longer selected -> begin dissolve
      }
    }
    for (const key of toAdd) {
      if (active.length >= MAX_EDGES) break;
      const i = Math.floor(key / NODE_COUNT);
      const j = key % NODE_COUNT;
      active.push({ i, j, bornAt: now, diedAt: null });
    }
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30); // clamp to avoid jumps on tab refocus
    const elapsed = state.clock.elapsedTime;
    const extentX = viewport.width / 2;
    const extentY = viewport.height / 2;
    const maxRadius = Math.min(extentX, extentY) * 0.95;

    nodeUniforms.uPixelRatio.value = state.gl.getPixelRatio();
    pulseUniforms.uPixelRatio.value = state.gl.getPixelRatio();

    // Subtle group parallax -- small oscillation, not a full rotation, to
    // match "moderate energy."
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.05;
      groupRef.current.rotation.y = Math.cos(elapsed * 0.04) * 0.06;
    }

    // Node position: lerp toward a slowly-rotating home orbit point plus
    // small sinusoidal jitter. This is a stable, oscillation-free stand-in
    // for a critically-damped spring -- no velocity integration needed.
    const positions = nodeSim.positions;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodeSim.homeAngle[i] += nodeSim.orbitSpeed[i] * dt;
      const r = nodeSim.homeRadiusFrac[i] * maxRadius;
      const hx = Math.cos(nodeSim.homeAngle[i]) * r;
      const hy = Math.sin(nodeSim.homeAngle[i]) * r;
      const jx = Math.sin(elapsed * 0.6 + nodeSim.jitterPhase[i * 2]) * JITTER_AMP;
      const jy = Math.cos(elapsed * 0.5 + nodeSim.jitterPhase[i * 2 + 1]) * JITTER_AMP;

      const idx = i * 3;
      positions[idx] += (hx + jx - positions[idx]) * FOLLOW_STRENGTH;
      positions[idx + 1] += (hy + jy - positions[idx + 1]) * FOLLOW_STRENGTH;
      positions[idx + 2] =
        nodeSim.baseZ[i] + Math.sin(elapsed * 0.15 + nodeSim.jitterPhase[i * 2]) * 0.15;

      nodeSim.alpha[i] = 0.55 + 0.25 * Math.sin(elapsed * 0.8 + nodeSim.jitterPhase[i * 2]);
    }
    nodeSim.geometry.attributes.position.needsUpdate = true;
    (nodeSim.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;

    // Throttled topology recompute -- expensive O(n^2) selection happens
    // occasionally, cheap buffer refresh happens every frame below.
    edgeTimerRef.current += dt;
    if (edgeTimerRef.current >= EDGE_RECOMPUTE_INTERVAL) {
      edgeTimerRef.current = 0;
      recomputeTopology(elapsed, extentX, extentY);
    }

    // Per-frame edge buffer write: positions track live nodes, alpha drives
    // the form/dissolve fade. Compacts the active array in place.
    const active = lineSim.active;
    const linePositions = lineSim.positions;
    const lineAlpha = lineSim.alpha;
    let w = 0;
    for (let k = 0; k < active.length; k++) {
      const e = active[k];
      let a: number;
      if (e.diedAt === null) {
        a = Math.min(1, (elapsed - e.bornAt) / EDGE_FADE_DURATION);
      } else {
        a = Math.max(0, 1 - (elapsed - e.diedAt) / EDGE_FADE_DURATION);
        if (a <= 0) continue; // fully faded -> drop from the pool
      }
      const io = e.i * 3;
      const jo = e.j * 3;
      const wo = w * 6;
      linePositions[wo] = positions[io];
      linePositions[wo + 1] = positions[io + 1];
      linePositions[wo + 2] = positions[io + 2];
      linePositions[wo + 3] = positions[jo];
      linePositions[wo + 4] = positions[jo + 1];
      linePositions[wo + 5] = positions[jo + 2];
      lineAlpha[w * 2] = a;
      lineAlpha[w * 2 + 1] = a;
      active[w] = e;
      w++;
    }
    active.length = w;
    lineSim.geometry.setDrawRange(0, w * 2);
    lineSim.geometry.attributes.position.needsUpdate = true;
    (lineSim.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;

    // Pulses: spawn slowly/infrequently on alive edges, always travelling
    // from the farther-from-center endpoint to the nearer one -- every
    // visible "packet" moves toward the card.
    pulseTimerRef.current -= dt;
    if (pulseTimerRef.current <= 0) {
      const alive = active.filter((e) => e.diedAt === null);
      const free = pulseSim.pool.find((p) => !p.active);
      if (free && alive.length > 0) {
        const edge = alive[Math.floor(Math.random() * alive.length)];
        const distI = Math.hypot(positions[edge.i * 3], positions[edge.i * 3 + 1]);
        const distJ = Math.hypot(positions[edge.j * 3], positions[edge.j * 3 + 1]);
        const from = distI >= distJ ? edge.i : edge.j;
        const to = distI >= distJ ? edge.j : edge.i;
        free.i = from;
        free.j = to;
        free.t = 0;
        free.duration =
          PULSE_MIN_DURATION + Math.random() * (PULSE_MAX_DURATION - PULSE_MIN_DURATION);
        free.active = true;
      }
      pulseTimerRef.current =
        PULSE_MIN_INTERVAL + Math.random() * (PULSE_MAX_INTERVAL - PULSE_MIN_INTERVAL);
    }

    const pulsePositions = pulseSim.positions;
    const pulseAlpha = pulseSim.alpha;
    let pw = 0;
    for (const p of pulseSim.pool) {
      if (!p.active) continue;
      p.t += dt / p.duration;
      if (p.t >= 1) {
        p.active = false;
        continue;
      }
      const e = easeInOutCubic(p.t);
      const io = p.i * 3;
      const jo = p.j * 3;
      const po = pw * 3;
      pulsePositions[po] = lerp(positions[io], positions[jo], e);
      pulsePositions[po + 1] = lerp(positions[io + 1], positions[jo + 1], e);
      pulsePositions[po + 2] = lerp(positions[io + 2], positions[jo + 2], e);
      const fadeIn = Math.min(1, p.t / 0.15);
      const fadeOut = Math.min(1, (1 - p.t) / 0.15);
      pulseAlpha[pw] = Math.min(fadeIn, fadeOut);
      pw++;
    }
    pulseSim.geometry.setDrawRange(0, pw);
    pulseSim.geometry.attributes.position.needsUpdate = true;
    (pulseSim.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points>
        <primitive object={nodeSim.geometry} attach="geometry" />
        <shaderMaterial
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </points>
      <lineSegments>
        <primitive object={lineSim.geometry} attach="geometry" />
        <shaderMaterial
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </lineSegments>
      <points>
        <primitive object={pulseSim.geometry} attach="geometry" />
        <shaderMaterial
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          uniforms={pulseUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </points>
    </group>
  );
}

export function ShaderBackground() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  // Respect prefers-reduced-motion: keep the static CSS gradient fallback.
  if (reduceMotion) return null;

  const palette = resolvedTheme === "light" ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(palette.background, 1)}
      >
        <NetworkScene palette={palette} />
      </Canvas>
    </div>
  );
}
