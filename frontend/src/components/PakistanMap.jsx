import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Zap } from 'lucide-react';

const PAKISTAN_DISTRICTS = [
  { name: "Lahore", lat: 31.5204, lon: 74.3587 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169 },
  { name: "Multan", lat: 30.1575, lon: 71.5249 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", lat: 30.1798, lon: 66.9750 },
  { name: "Sialkot", lat: 32.4945, lon: 74.5229 },
  { name: "Gujranwala", lat: 32.1877, lon: 74.1945 },
  { name: "Hyderabad", lat: 25.3960, lon: 68.3578 },
  { name: "Sukkur", lat: 27.7052, lon: 68.8574 },
  { name: "Larkana", lat: 27.5570, lon: 68.2140 },
  { name: "Bahawalpur", lat: 29.3956, lon: 71.6836 },
  { name: "Sargodha", lat: 32.0836, lon: 72.6711 },
  { name: "Mardan", lat: 34.2010, lon: 72.0449 },
  { name: "Abbottabad", lat: 34.1463, lon: 73.2117 },
  { name: "Dera Ghazi Khan", lat: 30.0588, lon: 70.6399 },
  { name: "Muzaffarabad", lat: 34.3700, lon: 73.4710 },
  { name: "Gilgit", lat: 35.9221, lon: 74.3085 },
];

const PakistanMap = ({ onSelectDistrict, selectedDistrict, onPredict }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  const isSelected = (district) =>
    selectedDistrict && selectedDistrict.name === district.name;

  return (
    <section style={{ padding: '60px 24px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Step 1
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: '800', letterSpacing: '-1px', color: '#e2e8f0', marginBottom: '12px' }}>
            Select Your <span className="gradient-text">District</span>
          </h2>
          <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: '15px' }}>
            Click any district marker on the map to get your drought forecast
          </p>
        </div>

        {/* Map Container */}
        <div
          className="glass"
          style={{
            padding: '4px',
            overflow: 'hidden',
            boxShadow: selectedDistrict
              ? '0 0 40px rgba(16,185,129,0.2), 0 0 80px rgba(16,185,129,0.08)'
              : '0 0 40px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.5s ease',
          }}
        >
          <MapContainer
            center={[30.3753, 69.3451]}
            zoom={5}
            style={{ height: '480px', width: '100%', borderRadius: '16px' }}
            zoomControl={true}
            attributionControl={false}
          >
            {/* Free tile layers — no API key needed */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
            />

            {PAKISTAN_DISTRICTS.map((district) => (
              <CircleMarker
                key={district.name}
                center={[district.lat, district.lon]}
                radius={isSelected(district) ? 10 : hoveredDistrict === district.name ? 9 : 7}
                pathOptions={{
                  fillColor: isSelected(district) ? '#34d399' : '#10b981',
                  fillOpacity: isSelected(district) ? 1 : 0.85,
                  color: isSelected(district) ? '#6ee7b7' : 'rgba(16,185,129,0.6)',
                  weight: isSelected(district) ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(district),
                  mouseover: () => setHoveredDistrict(district.name),
                  mouseout: () => setHoveredDistrict(null),
                }}
              >
                <Tooltip
                  permanent={false}
                  direction="top"
                  offset={[0, -8]}
                >
                  <div style={{
                    background: 'rgba(3,10,6,0.95)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    color: '#10b981',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                  }}>
                    📍 {district.name}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Selection Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          {/* Selected badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={16} color={selectedDistrict ? '#10b981' : 'rgba(226,232,240,0.3)'} />
            {selectedDistrict ? (
              <div style={{
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: '50px', padding: '6px 18px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px #10b981',
                  animation: 'pulse 1.5s ease infinite',
                }} />
                <span style={{ color: '#34d399', fontWeight: '600', fontSize: '14px' }}>
                  {selectedDistrict.name}
                </span>
                <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: '12px' }}>
                  {selectedDistrict.lat.toFixed(2)}°N, {selectedDistrict.lon.toFixed(2)}°E
                </span>
              </div>
            ) : (
              <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: '14px' }}>
                No district selected
              </span>
            )}
          </div>

          {/* Predict button */}
          <button
            className="btn-emerald"
            onClick={() => selectedDistrict && onPredict(selectedDistrict)}
            disabled={!selectedDistrict}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '15px', padding: '13px 28px',
              opacity: selectedDistrict ? 1 : 0.4,
              cursor: selectedDistrict ? 'pointer' : 'not-allowed',
            }}
          >
            <Zap size={16} />
            Predict Drought Risk
          </button>
        </div>

        {/* District Quick Select Dropdown */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Navigation size={14} color="#10b981" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <select
              onChange={(e) => {
                const d = PAKISTAN_DISTRICTS.find(d => d.name === e.target.value);
                if (d) onSelectDistrict(d);
              }}
              value={selectedDistrict?.name || ''}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px',
                padding: '11px 14px 11px 38px',
                color: selectedDistrict ? '#e2e8f0' : 'rgba(226,232,240,0.4)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                appearance: 'none',
                outline: 'none',
              }}
            >
              <option value="" disabled>Or search by name...</option>
              {PAKISTAN_DISTRICTS.map(d => (
                <option key={d.name} value={d.name} style={{ background: '#0a1a0f' }}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PakistanMap;
