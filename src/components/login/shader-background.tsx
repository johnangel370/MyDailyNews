"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// Slow-drifting fbm "aurora" tuned to the site palette. Runs on a
// fullscreen clip-space quad; the only per-frame CPU work is bumping uTime.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uBackground;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0);
    float t = uTime * 0.045;

    float n1 = fbm(p * 1.7 + vec2(t, -t * 0.6));
    float n2 = fbm(p * 2.3 - vec2(t * 0.8, t * 0.35) + 3.71);

    vec3 col = uBackground;
    col = mix(col, uColorA, smoothstep(0.3, 0.95, n1) * 0.75);
    col = mix(col, uColorB, smoothstep(0.42, 1.0, n2) * 0.55);

    float vignette = 1.0 - distance(uv, vec2(0.5)) * 0.4;
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
  }
`;

type Palette = { background: string; colorA: string; colorB: string };

const DARK_PALETTE: Palette = {
  background: "#070a12",
  colorA: "#2b5fd9",
  colorB: "#6d4bd9",
};

const LIGHT_PALETTE: Palette = {
  background: "#f4f7ff",
  colorA: "#9dbcf5",
  colorB: "#c4b2ef",
};

function ShaderPlane({ palette }: { palette: Palette }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBackground: { value: new THREE.Color(palette.background) },
      uColorA: { value: new THREE.Color(palette.colorA) },
      uColorB: { value: new THREE.Color(palette.colorB) },
    }),
    // Created once; palette changes are applied in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uBackground.value.set(palette.background);
    uniforms.uColorA.value.set(palette.colorA);
    uniforms.uColorB.value.set(palette.colorB);
  }, [palette, uniforms]);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    state.gl.getDrawingBufferSize(material.current.uniforms.uResolution.value);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
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
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <ShaderPlane palette={palette} />
      </Canvas>
    </div>
  );
}
