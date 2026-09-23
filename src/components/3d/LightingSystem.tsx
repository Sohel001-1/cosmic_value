import React from 'react';

export const LightingSystem: React.FC = () => {
  return (
    <group>
      {/* 
        UNIVERSAL DEEP SPACE AMBIENT FILL
        Kept at 0.006 to maintain natural airless black shadows while preserving subtle planetary silhouette.
      */}
      <ambientLight color="#0a0f1d" intensity={0.006} />
      <hemisphereLight args={['#0f172a', '#020617', 0.008]} />
    </group>
  );
};
