import React, { Suspense } from "react";
import { Text } from "@react-three/drei";

export default function SafeText(props) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}
