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

export const CartographyHelper: React.FC = () => {
  const [latInput, setLatInput] = useState<string>('35.9782266');
  const [lonInput, setLonInput] = useState<string>('-114.8344942');
  const [kmlText, setKmlText] = useState<string>(SAMPLE_KML);
  const [copied, setCopied] = useState<boolean>(false);

  const latNum = parseFloat(latInput);
  const lonNum = parseFloat(lonInput);
  const isValidCoords = !isNaN(latNum) && !isNaN(lonNum) && latNum >= -80 && latNum <= 84 && lonNum >= -180 && lonNum <= 180;

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
          timestamp: new Date().toISOString(),
        },
      },
      null,
      2
    );
  }, [utmResult, latNum, lonNum, isValidCoords]);

  const handleCopyGeoJson = () => {
    if (!geoJsonPayload) return;
    navigator.clipboard.writeText(geoJsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-mono text-gray-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-800 pb-4">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            Geospatial Reference · Cartographic Coordinates
          </div>
          <h2 className="text-xl font-bold tracking-wider text-cyan-400">
            WGS 84 TO UTM ZONE 11N COORDINATE REPROJECTION
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-3xl">
            In-browser Transverse Mercator projection converting decimal-degree geographic coordinates (EPSG:4326) into metric grid easting and northing (EPSG:32611).
          </p>
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

            <div className="flex gap-2">
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
              REPROJECTED GEOSPATIAL FEATURE EXPORT
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
