import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stats from "stats-gl";
import collectRenderStats from "./collectRenderStats";

export default function PerfOverlay({ fixtureName, parentRef, onStatsChange }) {
  const { gl, scene } = useThree();
  const statsRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastSampleRef = useRef(performance.now());

  useEffect(() => {
    if (!parentRef?.current) return undefined;

    const stats = new Stats({
      trackGPU: false,
      logsPerSecond: 20,
      samplesGraph: 20,
      horizontal: true,
      minimal: false,
      mode: 0
    });

    statsRef.current = stats;
    stats.init(gl);

    const element = stats.domElement;
    element.classList.add("ove-three-stats-gl");
    parentRef.current.appendChild(element);

    return () => {
      statsRef.current = null;
      element.remove();
    };
  }, [gl, parentRef]);

  useFrame(() => {
    frameCountRef.current += 1;
    statsRef.current?.update();

    const now = performance.now();
    const elapsed = now - lastSampleRef.current;
    if (elapsed < 250) return;

    let objectCount = 0;
    scene.traverse(() => {
      objectCount += 1;
    });

    onStatsChange?.(
      collectRenderStats(gl, {
        fixtureName,
        fps: (frameCountRef.current * 1000) / elapsed,
        objectCount
      })
    );

    frameCountRef.current = 0;
    lastSampleRef.current = now;
  });

  return null;
}
