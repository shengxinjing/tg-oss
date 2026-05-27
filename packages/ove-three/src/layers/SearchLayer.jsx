import React from "react";
import * as THREE from "three";

function normalizeRanges(searchRanges) {
  if (!searchRanges) return [];
  return Array.isArray(searchRanges) ? searchRanges : [searchRanges];
}

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function getRowOverlap(range, row) {
  const start = Math.max(Math.min(range.start, range.end), row.start);
  const end = Math.min(Math.max(range.start, range.end), row.end);
  if (start > end) return null;
  return { start, end };
}

export default function SearchLayer({ searchRanges, sceneModel }) {
  const ranges = normalizeRanges(searchRanges).filter(
    range => range?.start > -1
  );
  if (!ranges.length || !sceneModel) return null;

  return (
    <group userData={{ kind: "search-layer", variant: "row" }}>
      {sceneModel.visibleRows.flatMap(row =>
        ranges.flatMap((range, rangeIndex) => {
          const overlap = getRowOverlap(range, row);
          if (!overlap) return [];
          const localStart = overlap.start - row.start;
          const width = Math.max(
            sceneModel.baseWidth,
            (overlap.end - overlap.start + 1) * sceneModel.baseWidth
          );
          const x = localStart * sceneModel.baseWidth + width / 2;
          const y = getRowY(row, sceneModel) - 0.08;

          return (
            <mesh
              key={`${rangeIndex}-${row.rowIndex}-${overlap.start}-${overlap.end}`}
              position={[x, y, 0.045]}
              userData={{
                kind: "search",
                start: overlap.start,
                end: overlap.end
              }}
            >
              <planeGeometry args={[width, 0.42]} />
              <meshBasicMaterial
                color="#f97316"
                transparent
                opacity={0.26}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          );
        })
      )}
    </group>
  );
}
