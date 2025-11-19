"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 aPosition;
attribute float aOffset;
uniform float uTime;
uniform vec2 uPointer;
varying float vGlow;
void main() {
  float wave = sin(uTime * 0.4 + aOffset) * 0.1;
  vec2 pointerInfluence = uPointer * 0.15;
  vec2 position = aPosition + vec2(wave) + pointerInfluence;
  gl_Position = vec4(position, 0.0, 1.0);
  float spread = smoothstep(-0.9, 0.4, position.y);
  gl_PointSize = 1.5 + 36.0 * spread;
  vGlow = spread;
}
`;

const fragmentShader = `
precision mediump float;
varying float vGlow;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.0, dist) * vGlow;
  vec3 base = mix(vec3(0.0, 0.49, 0.96), vec3(0.0, 0.96, 0.67), vGlow);
  gl_FragColor = vec4(base, alpha * 0.9);
}
`;

const compileShader = (gl: WebGLRenderingContext, source: string, type: number) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader error");
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

const buildNebula = (count = 1200) => {
  const positions = new Float32Array(count * 2);
  const offsets = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const radius = Math.random() * 1.2;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 2] = Math.cos(angle) * radius * 0.6;
    positions[i * 2 + 1] = Math.sin(angle) * radius * 0.35 + 0.2;
    offsets[i] = Math.random() * Math.PI * 2;
  }
  return { positions, offsets };
};

export const HeroNebula = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;

    const program = createProgram(gl);
    gl.useProgram(program);

    const { positions, offsets } = buildNebula();

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const offsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);
    const offsetLocation = gl.getAttribLocation(program, "aOffset");
    gl.enableVertexAttribArray(offsetLocation);
    gl.vertexAttribPointer(offsetLocation, 1, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");

    const resize = () => {
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * window.devicePixelRatio;
      canvas.height = clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0 };
    const handlePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.x = x;
      pointer.y = y;
    };
    window.addEventListener("pointermove", handlePointer);

    const render = (time: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time / 1000);
      gl.uniform2f(uPointer, pointer.x * 0.2, pointer.y * 0.2);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, positions.length / 2);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />;
};
