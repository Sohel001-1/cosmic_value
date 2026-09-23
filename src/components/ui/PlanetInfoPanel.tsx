import React from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Database,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { EvidenceCategory, ScientificField } from '../../types/explorer';

export const PlanetInfoPanel: React.FC = () => {
  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const infoPanelMode = useExplorerStore((state) => state.infoPanelMode);
  const setInfoPanelMode = useExplorerStore((state) => state.setInfoPanelMode);
  const venusViewMode = useExplorerStore((state) => state.venusViewMode);
  const setVenusViewMode = useExplorerStore((state) => state.setVenusViewMode);

  const { scientificData, primaryEvidence, disclaimer, source } = selectedBody;

  const renderEvidenceTag = (category: EvidenceCategory, label?: string) => {
    switch (category) {
      case 'OBSERVED':
        return (
          <span className="badge-evidence badge-observed">
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            {label || 'OBSERVED'}
          </span>
        );
      case 'DERIVED':
        return (
          <span className="badge-evidence badge-derived">
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            {label || 'DERIVED'}
          </span>
        );
      case 'MODEL':
        return (
          <span className="badge-evidence badge-model">
            <Sparkles size={10} />
            {label || 'MODEL'}
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="badge-evidence badge-unknown">
            UNKNOWN
          </span>
        );
    }
  };

  const renderUncertainty = (err1?: number | null, err2?: number | null, lim?: number | null) => {
    if (lim === -1) return <span style={{ color: '#94a3b8', fontSize: '10px' }}> &lt; </span>;
    if (lim === 1) return <span style={{ color: '#94a3b8', fontSize: '10px' }}> &gt; </span>;

    if (err1 === undefined || err1 === null) return null;

    if (err2 === undefined || err2 === null || Math.abs(err1) === Math.abs(err2)) {
      const errVal = Math.abs(err1);
      const formatted = errVal >= 10 ? errVal.toFixed(1) : errVal >= 1 ? errVal.toFixed(2) : errVal.toPrecision(2);
      return (
        <span style={{ color: '#64748b', fontSize: '10.5px', marginLeft: '4px' }}>
          ±{formatted}
        </span>
      );
    }

    const fmt1 = err1 >= 10 ? err1.toFixed(1) : err1.toPrecision(2);
    const fmt2 = err2 <= -10 ? err2.toFixed(1) : err2.toPrecision(2);

    return (
      <span style={{ color: '#64748b', fontSize: '9.5px', marginLeft: '4px' }}>
        (+{fmt1}/{fmt2})
      </span>
    );
  };

  const renderFieldRow = (label: string, field?: ScientificField<any>, fallbackUnit?: string) => {
    if (!field) return null;
    const isUnknown = field.value === null || field.value === undefined;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          padding: '6px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {field.provenance && (
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  background:
                    field.provenance === 'Mass'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : field.provenance === 'Msini'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(168, 85, 247, 0.15)',
                  color:
                    field.provenance === 'Mass'
                      ? '#4ade80'
                      : field.provenance === 'Msini'
                      ? '#fbbf24'
                      : '#c084fc',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {field.provenance === 'Msini' ? 'M sin i' : field.provenance}
              </span>
            )}
            {renderEvidenceTag(field.evidence)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span
            className="font-mono"
            style={{
              fontSize: '12.5px',
              color: isUnknown ? '#64748b' : '#f8fafc',
              fontWeight: 500,
            }}
          >
            {isUnknown ? (
              <span style={{ color: '#64748b', fontSize: '11px' }}>UNKNOWN (Not Measured)</span>
            ) : (
              <>
                {typeof field.value === 'number'
                  ? field.value >= 1000
                    ? field.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : field.value >= 10
                    ? field.value.toFixed(2)
                    : field.value.toFixed(3)
                  : field.value}{' '}
                {field.unit || fallbackUnit || ''}
                {renderUncertainty(field.err1, field.err2, field.lim)}
              </>
            )}
          </span>

          {/* Structured Reference Link if available */}
          {field.reference?.url && (
            <a
              href={field.reference.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '9.5px',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
              }}
              title={`View literature source: ${field.reference.label}`}
            >
              <span>{field.reference.label.slice(0, 16)}...</span>
              <ExternalLink size={9} />
            </a>
          )}
        </div>

        {infoPanelMode === 'expanded' && field.note && (
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.35, marginTop: '2px' }}>
            {field.note}
          </div>
        )}
      </div>
    );
  };

  if (infoPanelMode === 'collapsed') {
    return (
      <button
        onClick={() => setInfoPanelMode('summary')}
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#cbd5e1',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        title="Open Scientific Data Panel"
      >
        <ChevronLeft size={14} />
        <span className="font-mono">SCIENCE DATA</span>
      </button>
    );
  }

  const massField = scientificData.massEarths;
  const massLabel =
    massField.provenance === 'Msini'
      ? 'Minimum Mass (M sin i)'
      : massField.provenance === 'Mass'
      ? 'True Bulk Mass'
      : massField.provenance === 'Mass-Radius' || massField.provenance === 'M-R'
      ? 'Estimated Mass (M-R Relation)'
      : 'Planetary Mass';

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '360px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        zIndex: 10,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* 1. Panel Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            {selectedBody.systemName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setInfoPanelMode(infoPanelMode === 'summary' ? 'expanded' : 'summary')}
            className="btn-icon"
            style={{ padding: '3px 7px', fontSize: '11px', color: '#94a3b8' }}
            title={infoPanelMode === 'summary' ? 'Expand full scientific breakdown' : 'Collapse to summary'}
          >
            {infoPanelMode === 'summary' ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                EXPAND <ChevronDown size={12} />
              </span>
            ) : (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                SUMMARY <ChevronUp size={12} />
              </span>
            )}
          </button>

          <button
            onClick={() => setInfoPanelMode('collapsed')}
            className="btn-icon"
            style={{ padding: '3px 6px', color: '#64748b' }}
            title="Hide Panel"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. Target Name & Classification */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            className="font-display"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#f8fafc',
            }}
          >
            {selectedBody.name}
          </h2>
          {renderEvidenceTag(
            primaryEvidence,
            primaryEvidence === 'OBSERVED' ? 'NASA ARCHIVE' : 'MODEL VIZ'
          )}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {selectedBody.type}
        </div>

        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.45, marginTop: '4px' }}>
          {selectedBody.description}
        </p>
      </div>

      {/* 3. Venus Atmosphere vs Radar Surface Toggle */}
      {selectedBody.id === 'venus' && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '4px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>
              RENDERED LAYER
            </span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>
              {venusViewMode === 'visible' ? 'True Visible Light' : 'Synthetic Radar (SAR)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`btn-nav ${venusViewMode === 'visible' ? 'active' : ''}`}
              onClick={() => setVenusViewMode('visible')}
              style={{ flex: 1, padding: '4px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Visible Clouds
            </button>
            <button
              className={`btn-nav ${venusViewMode === 'radar' ? 'active' : ''}`}
              onClick={() => setVenusViewMode('radar')}
              style={{ flex: 1, padding: '4px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Magellan Radar
            </button>
          </div>

          <div style={{ fontSize: '9.5px', color: '#64748b', lineHeight: 1.3 }}>
            {venusViewMode === 'visible'
              ? 'Visible-light sulfuric acid cloud envelope (true optical appearance).'
              : 'Magellan synthetic aperture radar altimetry mapping surface basalt topography beneath clouds.'}
          </div>
        </div>
      )}

      {/* 3b. Mandatory Model Visualization Disclaimer (Exoplanets) */}
      {selectedBody.category === 'exoplanet' && (
        <div
          style={{
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '4px',
            padding: '8px 10px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <ShieldAlert size={14} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '10.5px', color: '#d8b4fe', lineHeight: 1.35 }}>
            <strong style={{ color: '#f3e8ff' }}>ILLUSTRATIVE MODEL: </strong>
            {disclaimer || 'Appearance is an illustrative model. Not a direct optical image.'}
          </div>
        </div>
      )}

      {/* 3c. Solar System Illustrative Overview Scale Disclaimer */}
      {selectedBody.systemId === 'solar-system' && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '4px',
            padding: '6px 8px',
            fontSize: '9.5px',
            color: '#7dd3fc',
            lineHeight: 1.3,
          }}
        >
          <strong>ILLUSTRATIVE ARRANGEMENT: </strong>
          Planet positions and display scale in the overview use an illustrative scaling for visibility. Planetary metrics and orbital periods reflect authoritative NASA ephemerides.
        </div>
      )}

      {/* 4. Physical & Orbital Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#64748b',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          {selectedBody.id === 'solar-system-overview' ? 'System Properties' : 'Planetary Parameters'}
        </div>

        {selectedBody.id === 'solar-system-overview'
          ? renderFieldRow('Domain Extent', scientificData.radiusKm)
          : scientificData.radiusEarths
          ? renderFieldRow('Planet Radius', scientificData.radiusEarths)
          : renderFieldRow('Mean Volumetric Radius', scientificData.radiusKm)}

        {renderFieldRow(
          selectedBody.id === 'solar-system-overview' ? 'Total System Mass' : massLabel,
          scientificData.massEarths
        )}
        {renderFieldRow('Mean Density', scientificData.densityGcm3)}
        {renderFieldRow(
          selectedBody.id === 'solar-system-overview' ? 'Baseline Temp (Earth)' : 'Equilibrium Temp (T_eq)',
          scientificData.equilibriumTempK
        )}
        {renderFieldRow(
          selectedBody.id === 'solar-system-overview' ? 'Outer Orbital Period' : 'Orbital Period',
          scientificData.orbitalPeriodDays
        )}
        {selectedBody.id !== 'solar-system-overview' &&
          renderFieldRow('Semi-Major Axis', scientificData.semiMajorAxisAu)}

        {infoPanelMode === 'expanded' && (
          <>
            {renderFieldRow('Orbital Eccentricity', scientificData.eccentricity)}
            {renderFieldRow('Insolation Flux', scientificData.insolationFlux)}
            {renderFieldRow('System Distance', scientificData.distanceLy || scientificData.distancePc)}

            {/* Stellar Host Breakdown */}
            <div
              style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '10px',
                marginBottom: '4px',
              }}
            >
              Host Star Properties
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: '11px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <span style={{ color: '#94a3b8' }}>Host Identifier</span>
              <span className="font-mono" style={{ color: '#f8fafc' }}>
                {scientificData.hostStar}
              </span>
            </div>

            {renderFieldRow('Spectral Type', scientificData.spectralType)}
            {renderFieldRow('Stellar Effective Temp', scientificData.stellarTeffK)}
            {renderFieldRow('Stellar Radius', scientificData.stellarRadiusSolar)}
            {renderFieldRow('Stellar Mass', scientificData.stellarMassSolar)}

            {/* Discovery Information */}
            <div
              style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '10px',
                marginBottom: '4px',
              }}
            >
              Discovery & Survey
            </div>

            {renderFieldRow('Discovery Year', scientificData.discoveryYear)}
            {renderFieldRow('Discovery Technique', scientificData.discoveryMethod)}
            {renderFieldRow('Discovery Facility', scientificData.discoveryFacility)}
            {renderFieldRow('Publication Date', scientificData.publicationDate)}
          </>
        )}
      </div>

      {/* 5. Provenance & Cartography */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Database size={11} />
          <span>DATA PROVENANCE</span>
        </div>

        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{source.organization}</div>

        <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.35 }}>
          {source.usageNotes}
        </div>

        {source.referencePage && (
          <a
            href={source.referencePage}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '10px',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
              textDecoration: 'none',
            }}
          >
            <BookOpen size={10} />
            <span>NASA Archive Target Record</span>
            <ExternalLink size={9} />
          </a>
        )}
      </div>
    </aside>
  );
};
