import React, { useEffect, useState } from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { Activity, X, Layers, Cpu, Compass } from 'lucide-react';

export const PerformanceDiagnostics: React.FC = () => {
  const showDiagnostics = useExplorerStore((state) => state.showDiagnostics);
  const toggleDiagnostics = useExplorerStore((state) => state.toggleDiagnostics);
  const diagnostics = useExplorerStore((state) => state.diagnostics);
  const selectedBody = useExplorerStore((state) => state.selectedBody);

  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);

  useEffect(() => {
    if (!showDiagnostics) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;

      if (elapsed >= 500) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setFps(currentFps);
        setFrameTime(Number((elapsed / frameCount).toFixed(1)));
        frameCount = 0;
        lastTime = now;
      }

      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, [showDiagnostics]);

  if (!showDiagnostics) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        width: '320px',
        maxWidth: 'calc(100vw - 40px)',
        padding: '14px 16px',
        zIndex: 20,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: '#e2e8f0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '8px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600 }}>
          <Activity size={13} />
          <span>OBSERVATORY DIAGNOSTICS</span>
        </div>
        <button
          onClick={toggleDiagnostics}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: 2,
          }}
          title="Close Diagnostics"
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Render Performance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Real-time Framerate:</span>
          <span style={{ color: fps >= 55 ? '#34d399' : fps >= 30 ? '#fbbf24' : '#ef4444', fontWeight: 600 }}>
            {fps} FPS ({frameTime} ms)
          </span>
        </div>

        {/* Dynamic Texture LOD Tier */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Active Texture LOD:</span>
          <span
            style={{
              color:
                diagnostics.activeLODLevel === 'CLOSE'
                  ? '#c084fc'
                  : diagnostics.activeLODLevel === 'ORBITAL'
                  ? '#38bdf8'
                  : '#94a3b8',
              fontWeight: 600,
            }}
          >
            {diagnostics.activeLODLevel}
          </span>
        </div>

        {/* Actual Image Dimensions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Texture Dimensions:</span>
          <span style={{ color: '#f8fafc', fontWeight: 500 }}>{diagnostics.textureDimensions}</span>
        </div>

        {/* Texture Load Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Texture State:</span>
          <span
            style={{
              color: diagnostics.textureLoadStatus.startsWith('Ready') ? '#34d399' : '#f59e0b',
            }}
          >
            {diagnostics.textureLoadStatus}
          </span>
        </div>

        {/* Camera Distance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Camera Distance:</span>
          <span style={{ color: '#f8fafc' }}>
            {diagnostics.cameraDistanceRadii} R ({diagnostics.cameraDistanceUnits} units)
          </span>
        </div>

        {/* GPU Max Texture Capability */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>GPU Max Texture:</span>
          <span style={{ color: '#e2e8f0' }}>
            {diagnostics.gpuMaxTextureSize} px {diagnostics.supports8KClose ? '[8K Capable]' : '[Max 4K]'}
          </span>
        </div>

        {/* Sphere Geometry & Anisotropy */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Geometry & Filter:</span>
          <span style={{ color: '#cbd5e1' }}>128×128 (32.7k Tris) / 16× Aniso</span>
        </div>

        {/* Tone Mapping */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Color / Exposure:</span>
          <span style={{ color: '#cbd5e1' }}>ACESFilmic (Exposure 0.90)</span>
        </div>
      </div>
    </div>
  );
};
