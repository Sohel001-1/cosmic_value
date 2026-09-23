import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { CelestialBodyData } from '../../types/explorer';
import { useExplorerStore } from '../../store/useExplorerStore';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PlanetLabelProps {
  body: CelestialBodyData;
  offsetY?: number;
  externalHovered?: boolean;
}

export const PlanetLabel: React.FC<PlanetLabelProps> = ({
  body,
  offsetY,
  externalHovered = false,
}) => {
  const [isInternalHovered, setIsInternalHovered] = useState(false);
  const showLabels = useExplorerStore((state) => state.showLabels);
  const isTransitioning = useExplorerStore((state) => state.isTransitioning);
  const selectedBodyId = useExplorerStore((state) => state.selectedBodyId);
  const selectBody = useExplorerStore((state) => state.selectBody);

  const isSelected = body.id === selectedBodyId;
  const isHovered = isInternalHovered || externalHovered;

  // Hide label if labels are toggled off, during transition flights, for overview root,
  // or on the actively inspected planet (since its name is already in the top header and right science panel)
  if (
    !showLabels ||
    isTransitioning ||
    body.id === 'solar-system-overview' ||
    (isSelected && selectedBodyId !== 'solar-system-overview' && !isHovered)
  ) {
    return null;
  }

  // Vertical offset above planetary sphere
  const defaultOffset = body.visualScale.visualRadius + 0.65;
  const labelY = offsetY ?? defaultOffset;

  const getBadgeColor = (evidence: string) => {
    switch (evidence) {
      case 'OBSERVED': return '#22c55e';
      case 'DERIVED': return '#f59e0b';
      case 'MODEL': return '#a855f7';
      default: return '#94a3b8';
    }
  };

  const badgeColor = getBadgeColor(body.primaryEvidence);
  const distAu = body.scientificData.semiMajorAxisAu.value;
  const radiusKm = body.scientificData.radiusKm.value;
  const periodDays = body.scientificData.orbitalPeriodDays.value;

  return (
    <Html
      position={[0, labelY, 0]}
      center
      // No distanceFactor: fixed 1:1 screen-space pixel sizing prevents oversized growth when zooming close
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, opacity 0.2s ease',
        transform: isHovered ? 'scale(1.06)' : 'scale(1)',
        zIndex: isHovered ? 40 : 10,
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          selectBody(body.id);
        }}
        onMouseEnter={() => {
          setIsInternalHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={() => {
          setIsInternalHovered(false);
          document.body.style.cursor = 'auto';
        }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Sleek, Bounded Pill Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            background: isSelected
              ? 'rgba(15, 23, 42, 0.90)'
              : isHovered
              ? 'rgba(30, 41, 59, 0.88)'
              : 'rgba(3, 7, 18, 0.72)',
            border: `1px solid ${
              isSelected
                ? 'rgba(56, 189, 248, 0.6)'
                : isHovered
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(255, 255, 255, 0.12)'
            }`,
            borderRadius: '4px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            boxShadow: isSelected
              ? '0 0 12px rgba(56, 189, 248, 0.35), 0 4px 10px rgba(0, 0, 0, 0.6)'
              : '0 4px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: isSelected ? '#38bdf8' : badgeColor,
            }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: isSelected ? '#ffffff' : '#f1f5f9',
              textTransform: 'uppercase',
            }}
          >
            {body.name}
          </span>
          {body.id === 'sun' && (
            <Sparkles size={9} color="#fbbf24" style={{ marginLeft: 1 }} />
          )}
        </div>

        {/* Compact Hover Information Card */}
        {isHovered && !isSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '230px',
              padding: '9px 11px',
              background: 'rgba(10, 15, 29, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '6px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                {body.name}
              </span>
              <span
                style={{
                  fontSize: '8.5px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                {body.type.split(' ')[0]}
              </span>
            </div>

            <div
              style={{
                fontSize: '10px',
                color: '#94a3b8',
                lineHeight: 1.35,
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: '4px',
              }}
            >
              {body.description.slice(0, 85)}...
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '9.5px' }}>
              {distAu !== null && distAu !== undefined && (
                <div>
                  <span style={{ color: '#64748b' }}>Dist: </span>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    {distAu === 0 ? 'Center' : `${distAu} AU`}
                  </span>
                </div>
              )}
              {radiusKm && (
                <div>
                  <span style={{ color: '#64748b' }}>Radius: </span>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    {radiusKm.toLocaleString()} km
                  </span>
                </div>
              )}
              {periodDays && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>Period: </span>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                    {typeof periodDays === 'number'
                      ? periodDays >= 365
                        ? `${(periodDays / 365.25).toFixed(2)} yrs (${periodDays.toFixed(0)} d)`
                        : `${periodDays.toFixed(1)} days`
                      : periodDays}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '3px',
                fontSize: '9px',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              <span>Click to inspect</span>
              <ArrowRight size={9} />
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};
