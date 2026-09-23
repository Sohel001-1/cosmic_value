import React, { useEffect, useState } from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import {
  RotateCw,
  ZoomIn,
  Eye,
  Orbit,
  Activity,
  RefreshCw,
  Globe,
  Sparkles,
  Search,
  Database,
  ChevronDown,
  Sun as SunIcon,
  Compass,
} from 'lucide-react';
import { CatalogSearchModal } from './CatalogSearchModal';

const SOLAR_SYSTEM_PLANETS = [
  { id: 'sun', name: 'Sun', type: 'Host Star' },
  { id: 'mercury', name: 'Mercury', type: 'Rocky' },
  { id: 'venus', name: 'Venus', type: 'Cloud-Covered' },
  { id: 'earth', name: 'Earth', type: 'Ocean' },
  { id: 'mars', name: 'Mars', type: 'Desert' },
  { id: 'jupiter', name: 'Jupiter', type: 'Gas Giant' },
  { id: 'saturn', name: 'Saturn', type: 'Ringed Giant' },
  { id: 'uranus', name: 'Uranus', type: 'Ice Giant' },
  { id: 'neptune', name: 'Neptune', type: 'Ice Giant' },
  { id: 'pluto', name: 'Pluto', type: 'Dwarf Planet' },
];

export const ExplorerHUD: React.FC = () => {
  const selectedBodyId = useExplorerStore((state) => state.selectedBodyId);
  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const selectBody = useExplorerStore((state) => state.selectBody);
  const resetView = useExplorerStore((state) => state.resetView);
  const showLabels = useExplorerStore((state) => state.showLabels);
  const toggleLabels = useExplorerStore((state) => state.toggleLabels);
  const showOrbits = useExplorerStore((state) => state.showOrbits);
  const toggleOrbits = useExplorerStore((state) => state.toggleOrbits);
  const showDiagnostics = useExplorerStore((state) => state.showDiagnostics);
  const toggleDiagnostics = useExplorerStore((state) => state.toggleDiagnostics);
  const openCatalog = useExplorerStore((state) => state.openCatalog);
  const catalog = useExplorerStore((state) => state.catalog);

  const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState(false);

  // Keyboard shortcut (Ctrl+K or /) to open catalog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === 'k') ||
        (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT')
      ) {
        e.preventDefault();
        openCatalog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCatalog]);

  const isOverview = selectedBodyId === 'solar-system-overview';
  const isSolarSystemActive = selectedBody.systemId === 'solar-system';
  const isCuratedTOI700 = selectedBodyId === 'super-earth';
  const isDynamicExoplanet = !isSolarSystemActive && !isCuratedTOI700;

  return (
    <>
      <header style={{ pointerEvents: 'none' }}>
        {/* 1. Top-Left Minimal Branding */}
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 14px',
            zIndex: 10,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="font-display"
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#f8fafc',
              }}
            >
              COSMIC VALUE
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              v0.4
            </span>
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: '9.5px',
              color: '#64748b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {isOverview ? 'SOLAR SYSTEM / OVERVIEW' : `${selectedBody.systemName} / ${selectedBody.name}`}
          </div>
        </div>

        {/* 2. Top-Center Restrained System Switcher & Catalog Entry */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {/* Solar System Overview Quick Button */}
          <button
            className={`btn-nav ${isOverview ? 'active' : ''}`}
            onClick={() => {
              setIsPlanetMenuOpen(false);
              selectBody('solar-system-overview');
            }}
            title="Switch to Solar System Overview"
            style={{ gap: '6px' }}
          >
            <Compass size={13} color={isOverview ? '#38bdf8' : '#94a3b8'} />
            <span>OVERVIEW</span>
          </button>

          {/* Planets Dropdown Menu */}
          <div style={{ position: 'relative' }}>
            <button
              className={`btn-nav ${isSolarSystemActive && !isOverview ? 'active' : ''}`}
              onClick={() => setIsPlanetMenuOpen(!isPlanetMenuOpen)}
              title="Select Solar System Planet or Sun"
              style={{ gap: '6px' }}
            >
              <Globe size={13} color={isSolarSystemActive && !isOverview ? '#38bdf8' : '#94a3b8'} />
              <span>
                {isSolarSystemActive && !isOverview
                  ? selectedBody.name.toUpperCase()
                  : 'PLANETS'}
              </span>
              <ChevronDown size={12} color="#94a3b8" />
            </button>

            {/* Planet Selection Dropdown Menu */}
            {isPlanetMenuOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: '0',
                  width: '220px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 20,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
                }}
              >
                {SOLAR_SYSTEM_PLANETS.map((p) => {
                  const isCurrent = selectedBodyId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectBody(p.id);
                        setIsPlanetMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: isCurrent
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        color: isCurrent ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '11px',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.id === 'sun' ? (
                          <SunIcon size={12} color="#fbbf24" />
                        ) : (
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              backgroundColor: isCurrent ? '#38bdf8' : '#64748b',
                            }}
                          />
                        )}
                        <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{p.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          color: '#64748b',
                          fontFamily: "'JetBrains Mono', monospace",
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick-Access TOI-700 d */}
          <button
            className={`btn-nav ${isCuratedTOI700 ? 'active' : ''}`}
            onClick={() => {
              setIsPlanetMenuOpen(false);
              selectBody('super-earth');
            }}
            title="Switch to TOI-700 d (Habitable Zone Terrestrial World)"
          >
            <Sparkles size={13} color={isCuratedTOI700 ? '#c084fc' : '#94a3b8'} />
            <span>TOI-700 d</span>
          </button>

          {/* Dynamic Active Exoplanet Badge (if another catalog world is selected) */}
          {isDynamicExoplanet && (
            <div
              className="btn-nav active"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                cursor: 'default',
              }}
            >
              <Database size={13} color="#38bdf8" />
              <span>{selectedBody.name}</span>
            </div>
          )}

          {/* Search Exoplanet Catalog Trigger */}
          <button
            className="btn-nav"
            onClick={() => {
              setIsPlanetMenuOpen(false);
              openCatalog();
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Open Searchable NASA Exoplanet Catalog (Ctrl+K)"
          >
            <Search size={13} color="#38bdf8" />
            <span>CATALOG</span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '1px 5px',
                borderRadius: '3px',
                color: '#94a3b8',
              }}
            >
              {catalog.length ? `${catalog.length.toLocaleString()}` : '6,366'}
            </span>
          </button>
        </div>

        {/* 3. Bottom Toolbar (Instrument-grade, compact) */}
        <nav
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 14px',
            zIndex: 10,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Subtle navigation hints */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingRight: '10px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '10.5px',
              color: '#64748b',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCw size={11} /> Drag Orbit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ZoomIn size={11} /> Scroll Zoom
            </span>
          </div>

          {/* Action Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="btn-icon"
              onClick={resetView}
              title="Reset camera view"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>

            <button
              className={`btn-icon ${showLabels ? 'active' : ''}`}
              onClick={toggleLabels}
              title="Toggle object markers"
            >
              <Eye size={12} />
              <span>Labels</span>
            </button>

            <button
              className={`btn-icon ${showOrbits ? 'active' : ''}`}
              onClick={toggleOrbits}
              title="Toggle orbital path guide"
            >
              <Orbit size={12} />
              <span>Orbits</span>
            </button>

            <button
              className={`btn-icon ${showDiagnostics ? 'active' : ''}`}
              onClick={toggleDiagnostics}
              title="Toggle GPU performance monitor"
            >
              <Activity size={12} />
              <span>Diagnostics</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Catalog Search Modal */}
      <CatalogSearchModal />
    </>
  );
};
