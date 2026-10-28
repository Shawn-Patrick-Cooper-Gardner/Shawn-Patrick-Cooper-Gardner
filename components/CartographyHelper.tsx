import React, { useState, useMemo } from 'react';

// Standard mathematical conversion from WGS84 Lat/Lon (EPSG:4326) to UTM (Transverse Mercator)
function wgs84ToUtmZone11N(lat: number, lon: number) {
  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1 / 298.257223563; // WGS84 flattening
  const k0 = 0.9996; // UTM scale factor
  const e = Math.sqrt(2 * f - f * f);
  const eSq = e * e;
  const ePrimeSq = eSq / (1 - eSq);

  const lon0 = -117.0; // Central meridian for UTM Zone 11 (-120 to -114)
  const latRad = (lat * Math.PI) / 180.0;
  const lonRad = (lon * Math.PI) / 180.0;
  const lon0Rad = (lon0 * Math.PI) / 180.0;

  const N = a / Math.sqrt(1 - eSq * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = ePrimeSq * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lon0Rad);

  const M =
    a *
    ((1 - eSq / 4 - (3 * eSq * eSq) / 64 - (5 * eSq * eSq * eSq) / 256) * latRad -
      ((3 * eSq) / 8 + (3 * eSq * eSq) / 32 + (45 * eSq * eSq * eSq) / 1024) * Math.sin(2 * latRad) +
      ((15 * eSq * eSq) / 256 + (45 * eSq * eSq * eSq) / 1024) * Math.sin(4 * latRad) -
      ((35 * eSq * eSq * eSq) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrimeSq) * Math.pow(A, 5)) / 120) +
    500000.0; // False Easting

  const northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ePrimeSq) * Math.pow(A, 6)) / 720));

  return {
    easting: Math.round(easting * 1000) / 1000,
    northing: Math.round(northing * 1000) / 1000,
  };
}

const SAMPLE_KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark id="0DEF71A16E427DABE885">
      <name>89005 - Boulder City</name>
      <Point>
        <coordinates>-114.8344942,35.9782266,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

interface MapServiceItem {
  name: string;
  type: string;
  description: string;
  coverage: string;
  provider: string;
  status: 'ONLINE' | 'ACTIVE_FEED' | 'STAGED';
}

const MAP_SERVER_CATALOG = {
  currentVersion: 11.3,
  folders: ['Utilities'],
  services: [
    {
      name: '3DEPElevationIndex',
      type: 'MapServer',
      description: '3D Elevation Program (3DEP) High-Resolution Bare-Earth DEM Index',
      coverage: 'CONUS / Mojave Desert Basin',
      provider: 'USGS National Geospatial Program',
      status: 'ONLINE' as const,
    },
    {
      name: 'NHDPlus_HR_Index',
      type: 'MapServer',
      description: 'National Hydrography Dataset Plus High Resolution Flowlines & Watershed Catchments',
      coverage: 'National Hydrologic Network / Colorado River Drainage',
      provider: 'USGS / EPA',
      status: 'ONLINE' as const,
    },
    {
      name: 'USGS_Seamless1m_Index',
      type: 'MapServer',
      description: 'USGS Seamless 1-Meter Digital Elevation Model Quad Tile Index',
      coverage: 'Nevada Southern Proving Grounds',
      provider: 'USGS 3DEP',
      status: 'ONLINE' as const,
    },
    {
      name: 'USGSNAIPImageryIndex',
      type: 'MapServer',
      description: 'National Agriculture Imagery Program (NAIP) Orthoimagery Multi-Spectral Raster',
      coverage: 'Southwest US / Clark County Quad',
      provider: 'USDA FSA APFO',
      status: 'ONLINE' as const,
    },
    {
      name: '13.geoint.core',
      type: 'MapServer',
      description: '13 Aerospace Defense Company GEOINT Core Tactical Cartography & Basin Realignment Feed',
      coverage: 'Boulder City / Eldorado Valley / Super Project EXCALIBUR Proving Ground',
      provider: '13 Aerospace Defense Company (NAICS 541715)',
      status: 'ACTIVE_FEED' as const,
    },
  ],
};

export const CartographyHelper: React.FC = () => {
  const [latInput, setLatInput] = useState<string>('35.9782266');
  const [lonInput, setLonInput] = useState<string>('-114.8344942');
  const [kmlText, setKmlText] = useState<string>(SAMPLE_KML);
  const [selectedService, setSelectedService] = useState<MapServiceItem>(MAP_SERVER_CATALOG.services[4]);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCatalog, setCopiedCatalog] = useState<boolean>(false);

  const latNum = parseFloat(latInput);
  const lonNum = parseFloat(lonInput);
  const isValidCoords =
    !isNaN(latNum) && !isNaN(lonNum) && latNum >= -80 && latNum <= 84 && lonNum >= -180 && lonNum <= 180;

  const utmResult = useMemo(() => {
    if (!isValidCoords) return null;
    return wgs84ToUtmZone11N(latNum, lonNum);
  }, [latNum, lonNum, isValidCoords]);

  const geoJsonPayload = useMemo(() => {
    if (!utmResult || !isValidCoords) return '';
    return JSON.stringify(
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lonNum, latNum],
        },
        properties: {
          datum: 'WGS 84',
          sourceCRS: 'EPSG:4326',
          projectedCRS: 'EPSG:32611 (WGS 84 / UTM Zone 11N)',
          easting_meters: utmResult.easting,
          northing_meters: utmResult.northing,
          locationContext: 'Boulder City, Nevada (89005)',
          active_mapserver: selectedService.name,
          timestamp: new Date().toISOString(),
        },
      },
      null,
      2
    );
  }, [utmResult, latNum, lonNum, isValidCoords, selectedService]);

  const handleCopyGeoJson = () => {
    if (!geoJsonPayload) return;
    navigator.clipboard.writeText(geoJsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCatalog = () => {
    const rawCatalog = {
      currentVersion: MAP_SERVER_CATALOG.currentVersion,
      folders: MAP_SERVER_CATALOG.folders,
      services: MAP_SERVER_CATALOG.services.map((s) => ({
        name: s.name,
        type: s.type,
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(rawCatalog, null, 2));
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-mono text-gray-200">
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
              Geospatial Intelligence · Cartographic Coordinates & Elevation Indices
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-cyan-400">
              WGS 84 / UTM REPROJECTION & GEOINT MAPSERVER CATALOG
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl">
              High-precision Transverse Mercator (EPSG:32611) reprojection engine synchronized with USGS 3DEP, NAIP, and <strong>13.geoint.core</strong> MapServer feeds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCatalog}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{copiedCatalog ? '✓ Copied Catalog' : 'Copy MapServer JSON'}</span>
            </button>
          </div>
        </div>

        {/* SECTION: MapServer Services Catalog */}
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                ArcGIS MapServer Services Catalog // Version {MAP_SERVER_CATALOG.currentVersion}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Folder: <span className="text-cyan-300">Utilities</span> · 5 Active MapServers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAP_SERVER_CATALOG.services.map((svc) => {
              const isSelected = selectedService.name === svc.name;
              return (
                <div
                  key={svc.name}
                  onClick={() => setSelectedService(svc)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-[#0B0F17] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-cyan-300">
                        {svc.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          svc.name === '13.geoint.core'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                        }`}
                      >
                        {svc.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{svc.provider.split('/')[0]}</span>
                    <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {isSelected ? '● ACTIVE LAYER' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Service Status Strip */}
          <div className="bg-[#090D15] p-3 rounded-lg border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">SELECTED MAPSERVER:</span>
              <span className="font-bold text-amber-400">{selectedService.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-300">{selectedService.coverage}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Provider: <span className="text-slate-200">{selectedService.provider}</span>
            </div>
          </div>
        </div>

        {/* Input & Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Coordinate Inputs */}
          <div className="bg-[#111622] border border-gray-800 rounded-lg p-5 flex flex-col gap-4 shadow-xl">
            <span className="text-xs font-semibold text-gray-400 tracking-wider">
              INPUT COORDINATES (WGS 84 DECIMAL DEGREES)
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Latitude (North)</label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-gray-800 rounded p-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Longitude (West)</label>
                <input
                  type="text"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-gray-800 rounded p-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setLatInput('35.9782266');
                  setLonInput('-114.8344942');
                }}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 rounded transition cursor-pointer"
              >
                Boulder City 89005 Preset
              </button>
              <button
                onClick={() => {
                  setLatInput('36.0198015');
                  setLonInput('-114.82860595');
                }}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 rounded transition cursor-pointer"
              >
                LookAt Center Preset
              </button>
              <button
                onClick={() => {
                  setLatInput('35.7820');
                  setLonInput('-114.9920');
                }}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-amber-300 border border-gray-700 rounded transition cursor-pointer"
              >
                Eldorado Dry Lake (C.O.R.E.)
              </button>
            </div>

            {/* Projection Output Cards */}
            {utmResult ? (
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-[#0B0F17] p-3 rounded border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">UTM ZONE 11N EASTING</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">
                    {utmResult.easting} m
                  </span>
                </div>
                <div className="bg-[#0B0F17] p-3 rounded border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">UTM ZONE 11N NORTHING</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">
                    {utmResult.northing} m
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded border border-red-800">
                Invalid decimal degree coordinates.
              </div>
            )}
          </div>

          {/* KML Placemark XML Inspector */}
          <div className="bg-[#111622] border border-gray-800 rounded-lg p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 tracking-wider">
                KML PLACEMARK XML INSPECTOR
              </span>
              <span className="text-[10px] text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-800">
                OGC KML 2.2
              </span>
            </div>
            <textarea
              value={kmlText}
              onChange={(e) => setKmlText(e.target.value)}
              rows={9}
              className="w-full bg-[#0B0F17] text-cyan-300 text-xs p-3 rounded border border-gray-800 focus:outline-none focus:border-cyan-500 font-mono resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Reprojected GeoJSON Output & Export */}
        <div className="bg-[#111622] border border-gray-800 rounded-lg p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400 tracking-wider">
              REPROJECTED GEOSPATIAL FEATURE EXPORT (SYNCHRONIZED WITH {selectedService.name})
            </span>
            <button
              onClick={handleCopyGeoJson}
              className="px-3 py-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider rounded transition cursor-pointer"
            >
              {copied ? '[ COPIED ]' : 'Copy GeoJSON'}
            </button>
          </div>
          <pre className="bg-[#0B0F17] p-4 rounded border border-gray-800 text-cyan-300 text-xs overflow-x-auto max-h-60">
            {geoJsonPayload || '// Awaiting valid coordinates...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
