import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { ExoplanetCatalogRecord } from '../../types/exoplanet';
import {
  Search,
  X,
  Sparkles,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const CatalogSearchModal: React.FC = () => {
  const isCatalogOpen = useExplorerStore((state) => state.isCatalogOpen);
  const closeCatalog = useExplorerStore((state) => state.closeCatalog);
  const catalog = useExplorerStore((state) => state.catalog);
  const catalogMetadata = useExplorerStore((state) => state.catalogMetadata);
  const isLoadingCatalog = useExplorerStore((state) => state.isLoadingCatalog);
  const selectCatalogPlanet = useExplorerStore((state) => state.selectCatalogPlanet);
  const selectBody = useExplorerStore((state) => state.selectBody);
  const selectedBody = useExplorerStore((state) => state.selectedBody);

  const [query, setQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedMassType, setSelectedMassType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'radius' | 'mass' | 'discYear'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const itemsPerPage = 30;
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isCatalogOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setPage(1);
    }
  }, [isCatalogOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCatalogOpen) return;
      if (e.key === 'Escape') {
        closeCatalog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCatalogOpen, closeCatalog]);

  // Unique discovery methods for dropdown
  const discoveryMethods = useMemo(() => {
    const methods = new Set<string>();
    catalog.forEach((p) => {
      if (p.discoveryMethod) methods.add(p.discoveryMethod);
    });
    return Array.from(methods).sort();
  }, [catalog]);

  // Filter and sort catalog entries
  const filteredPlanets = useMemo(() => {
    if (!catalog.length) return [];

    const q = query.trim().toLowerCase();

    return catalog.filter((p) => {
      // Text match (Planet Name or Hostname)
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const hostMatch = p.hostname.toLowerCase().includes(q);
        const facilityMatch = p.discoveryFacility?.toLowerCase().includes(q);
        if (!nameMatch && !hostMatch && !facilityMatch) return false;
      }

      // Discovery Method filter
      if (selectedMethod !== 'ALL' && p.discoveryMethod !== selectedMethod) {
        return false;
      }

      // Mass Type filter
      if (selectedMassType !== 'ALL') {
        const prov = p.massEarths.provenance;
        if (selectedMassType === 'Mass' && prov !== 'Mass') return false;
        if (selectedMassType === 'Msini' && prov !== 'Msini') return false;
        if (selectedMassType === 'Mass-Radius' && prov !== 'Mass-Radius' && prov !== 'M-R') return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = null;
      let valB: any = null;

      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'distance':
          valA = a.distancePc.value;
          valB = b.distancePc.value;
          break;
        case 'radius':
          valA = a.radiusEarths.value;
          valB = b.radiusEarths.value;
          break;
        case 'mass':
          valA = a.massEarths.value;
          valB = b.massEarths.value;
          break;
        case 'discYear':
          valA = a.discoveryYear;
          valB = b.discoveryYear;
          break;
      }

      // Sort nulls to bottom
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [catalog, query, selectedMethod, selectedMassType, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPlanets.length / itemsPerPage) || 1;
  const paginatedPlanets = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPlanets.slice(start, start + itemsPerPage);
  }, [filteredPlanets, page]);

  if (!isCatalogOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={closeCatalog}
    >
      <div
        className="glass-panel"
        style={{
          width: '920px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          background: 'rgba(10, 15, 30, 0.92)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={16} color="#38bdf8" />
            <div>
              <h2
                className="font-display"
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#f8fafc',
                  margin: 0,
                }}
              >
                NASA EXOPLANET ARCHIVE EXPLORER
              </h2>
              <div
                style={{
                  fontSize: '10.5px',
                  color: '#64748b',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: '2px',
                }}
              >
                {catalogMetadata ? (
                  <span>
                    Snapshot: {catalogMetadata.snapshotDate} • {catalog.length.toLocaleString()} Authoritative Worlds (default_flag=1)
                  </span>
                ) : (
                  'Loading catalog metadata...'
                )}
              </div>
            </div>
          </div>

          <button
            onClick={closeCatalog}
            className="btn-icon"
            style={{ padding: '6px', color: '#94a3b8' }}
            title="Close Catalog (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Pinned Featured Quick Access */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(3, 7, 18, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pinned Systems:
          </span>

          <button
            className={`btn-nav ${selectedBody.id === 'mercury' ? 'active' : ''}`}
            onClick={() => {
              selectBody('mercury');
              closeCatalog();
            }}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            <Globe size={12} color="#38bdf8" />
            <span>MERCURY</span>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>[Sol / 8K Mapped]</span>
          </button>

          <button
            className={`btn-nav ${selectedBody.id === 'super-earth' ? 'active' : ''}`}
            onClick={() => {
              selectBody('super-earth');
              closeCatalog();
            }}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            <Sparkles size={12} color="#c084fc" />
            <span>TOI-700 d</span>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>[Habitable Zone / TESS]</span>
          </button>
        </div>

        {/* 3. Search and Filter Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={14}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by planet name, host star, or facility (e.g. TRAPPIST-1, Kepler-452 b, WASP-121)..."
                style={{
                  width: '100%',
                  background: 'rgba(3, 7, 18, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  padding: '9px 12px 9px 34px',
                  fontSize: '12.5px',
                  color: '#f8fafc',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`btn-icon ${showAdvancedFilters ? 'active' : ''}`}
              style={{ padding: '8px 12px', fontSize: '11px', display: 'flex', gap: '6px' }}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filter Panel */}
          {showAdvancedFilters && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.45)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
              }}
            >
              {/* Discovery Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                  DISCOVERY METHOD
                </span>
                <select
                  value={selectedMethod}
                  onChange={(e) => {
                    setSelectedMethod(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    background: 'rgba(3, 7, 18, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    padding: '4px 8px',
                    fontSize: '11px',
                  }}
                >
                  <option value="ALL">All Detection Methods</option>
                  {discoveryMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mass Provenance Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                  MASS PROVENANCE
                </span>
                <select
                  value={selectedMassType}
                  onChange={(e) => {
                    setSelectedMassType(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    background: 'rgba(3, 7, 18, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    padding: '4px 8px',
                    fontSize: '11px',
                  }}
                >
                  <option value="ALL">All Mass Types</option>
                  <option value="Mass">True Bulk Mass (Observed / Dynamical)</option>
                  <option value="Msini">Minimum Mass (M sin i)</option>
                  <option value="Mass-Radius">Model Inferred (Mass-Radius Relation)</option>
                </select>
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                  SORT BY
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setPage(1);
                    }}
                    style={{
                      background: 'rgba(3, 7, 18, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#f8fafc',
                      padding: '4px 8px',
                      fontSize: '11px',
                    }}
                  >
                    <option value="name">Planet Name</option>
                    <option value="distance">Distance (pc)</option>
                    <option value="radius">Radius (R⊕)</option>
                    <option value="mass">Mass (M⊕)</option>
                    <option value="discYear">Discovery Year</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn-icon"
                    style={{ padding: '4px 8px' }}
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <ArrowUpDown size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#64748b',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span>
              Matches: <strong style={{ color: '#f8fafc' }}>{filteredPlanets.length.toLocaleString()}</strong> of{' '}
              {catalog.length.toLocaleString()} exoplanets
            </span>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>
        </div>

        {/* 4. Table / Planet List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: '340px',
            background: 'rgba(3, 7, 18, 0.3)',
          }}
        >
          {isLoadingCatalog ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                gap: '10px',
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
            >
              <div className="spinner" />
              <span>Loading 6,366 NASA Exoplanet records into memory...</span>
            </div>
          ) : paginatedPlanets.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                gap: '8px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
            >
              <Filter size={24} />
              <span>No exoplanets match the current search or filters.</span>
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '11.5px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#64748b',
                    fontSize: '10px',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '8px 16px' }}>PLANET & HOST</th>
                  <th style={{ padding: '8px 12px' }}>DISCOVERY</th>
                  <th style={{ padding: '8px 12px' }}>RADIUS (R⊕)</th>
                  <th style={{ padding: '8px 12px' }}>MASS (M⊕)</th>
                  <th style={{ padding: '8px 12px' }}>PERIOD (d)</th>
                  <th style={{ padding: '8px 12px' }}>DIST (pc)</th>
                  <th style={{ padding: '8px 16px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlanets.map((planet) => {
                  const isCurrent = selectedBody.name === planet.name;
                  const massProv = planet.massEarths.provenance;

                  return (
                    <tr
                      key={planet.name}
                      onClick={() => selectCatalogPlanet(planet.name)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        background: isCurrent ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Name & Host */}
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '12px' }}>
                          {planet.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          Host: {planet.hostname} {planet.stellar.spectralType ? `[${planet.stellar.spectralType}]` : ''}
                        </div>
                      </td>

                      {/* Discovery */}
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                        <div>{planet.discoveryMethod || '—'}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{planet.discoveryYear ?? '—'}</div>
                      </td>

                      {/* Radius */}
                      <td style={{ padding: '10px 12px' }}>
                        {planet.radiusEarths.value !== null ? (
                          <span style={{ color: '#38bdf8', fontWeight: 500 }}>
                            {planet.radiusEarths.value.toFixed(2)} R⊕
                          </span>
                        ) : (
                          <span style={{ color: '#475569' }}>—</span>
                        )}
                      </td>

                      {/* Mass */}
                      <td style={{ padding: '10px 12px' }}>
                        {planet.massEarths.value !== null ? (
                          <div>
                            <span style={{ color: '#f8fafc', fontWeight: 500 }}>
                              {planet.massEarths.value >= 10
                                ? planet.massEarths.value.toFixed(1)
                                : planet.massEarths.value.toFixed(2)}{' '}
                              M⊕
                            </span>
                            {massProv && (
                              <div
                                style={{
                                  fontSize: '9px',
                                  color:
                                    massProv === 'Mass'
                                      ? '#22c55e'
                                      : massProv === 'Msini'
                                      ? '#f59e0b'
                                      : '#a855f7',
                                }}
                              >
                                [{massProv}]
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#475569' }}>—</span>
                        )}
                      </td>

                      {/* Orbital Period */}
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                        {planet.orbitalPeriodDays.value !== null ? (
                          planet.orbitalPeriodDays.value >= 100
                            ? planet.orbitalPeriodDays.value.toFixed(1)
                            : planet.orbitalPeriodDays.value.toFixed(2)
                        ) : (
                          <span style={{ color: '#475569' }}>—</span>
                        )}
                      </td>

                      {/* Distance */}
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                        {planet.distancePc.value !== null ? (
                          planet.distancePc.value.toFixed(1)
                        ) : (
                          <span style={{ color: '#475569' }}>—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <button
                          className="btn-nav"
                          style={{
                            padding: '3px 8px',
                            fontSize: '10px',
                            background: isCurrent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {isCurrent ? 'ACTIVE' : 'FLY TO'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. Pagination Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ color: '#64748b' }}>
            Showing {Math.min((page - 1) * itemsPerPage + 1, filteredPlanets.length)} –{' '}
            {Math.min(page * itemsPerPage, filteredPlanets.length)} of {filteredPlanets.length}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-icon"
              style={{ padding: '4px 8px', opacity: page <= 1 ? 0.3 : 1 }}
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>

            <span style={{ color: '#f8fafc', padding: '0 4px' }}>
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-icon"
              style={{ padding: '4px 8px', opacity: page >= totalPages ? 0.3 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
