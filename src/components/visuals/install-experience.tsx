"use client";

import { useEffect, useRef } from "react";

type InstallExperienceProps = {
  active: boolean;
  message?: string;
};

const vertexShader = `
attribute vec2 aPosition;
attribute float aDelay;
uniform float uTime;
uniform float uProgress;
varying float vAlpha;
void main() {
  float assembled = smoothstep(aDelay, aDelay + 0.2, uProgress);
  float pulse = sin(uTime * 4.0 + aPosition.y * 8.0) * 0.015;
  vec2 pos = mix(vec2(0.0), aPosition, assembled) + vec2(pulse, -pulse);
  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = 12.0 + 24.0 * assembled;
  vAlpha = assembled;
}
`;

const fragmentShader = `
precision mediump float;
varying float vAlpha;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float glow = smoothstep(0.5, 0.0, dist);
  vec3 colorA = vec3(0.0, 0.96, 0.77);
  vec3 colorB = vec3(0.0, 0.76, 1.0);
  vec3 color = mix(colorA, colorB, gl_FragCoord.y / 800.0);
  gl_FragColor = vec4(color, vAlpha * glow);
}
`;

const letterMaps: Record<string, string[]> = {
  C: [
    "01110",
    "10001",
    "10000",
    "10000",
    "10000",
    "10001",
    "01110",
  ],
  O: [
    "01110",
    "10001",
    "10011",
    "10101",
    "11001",
    "10001",
    "01110",
  ],
  D: [
    "11100",
    "10010",
    "10001",
    "10001",
    "10001",
    "10010",
    "11100",
  ],
  E: [
    "11111",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000",
    "11111",
  ],
  "4": [
    "00100",
    "01100",
    "10100",
    "10100",
    "11111",
    "00100",
    "00100",
  ],
};

const word = ["C", "O", "D", "E", "4", "0", "4"];

const buildWordPositions = () => {
  const positions: number[] = [];
  const delays: number[] = [];
  const spacing = 0.16;
  let cursor = -0.8;

  word.forEach((char, index) => {
    const map = letterMaps[char] ?? letterMaps["C"];
    const rows = map.length;
    const cols = map[0]?.length ?? 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (map[y][x] === "1") {
          const posX = cursor + (x / cols) * spacing;
          const posY = 0.25 - (y / rows) * 0.5;
          positions.push(posX, posY);
          delays.push(index * 0.05 + (y / rows) * 0.08);
        }
      }
    }
    cursor += spacing + 0.05;
  });
  return { positions: new Float32Array(positions), delays: new Float32Array(delays) };
};

const compileShader = (gl: WebGLRenderingContext, source: string, type: number) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile error");
  }
  return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const vs = compileShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program link error");
  }
  return program;
};

export const InstallExperience = ({ active, message }: InstallExperienceProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;

    const program = createProgram(gl);
    gl.useProgram(program);

    const { positions, delays } = buildWordPositions();

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const delayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, delayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, delays, gl.STATIC_DRAW);
    const delayLocation = gl.getAttribLocation(program, "aDelay");
    gl.enableVertexAttribArray(delayLocation);
    gl.vertexAttribPointer(delayLocation, 1, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uProgress = gl.getUniformLocation(program, "uProgress");

    const resize = () => {
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * window.devicePixelRatio;
      canvas.height = clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const render = () => {
      const now = performance.now();
      const elapsed = (now - start) / 1000;
      const progress = Math.min(1, elapsed / 1.2);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uProgress, progress);
      gl.drawArrays(gl.POINTS, 0, positions.length / 2);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center bg-[#010512]/80 backdrop-blur-sm">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-teal-200">Installing</p>
        <p className="text-2xl font-semibold text-white">CODE 4O4 Portal</p>
        <p className="text-sm text-white/70">{message ?? "Unlocking offline mode..."}</p>
      </div>
    </div>
  );
};
