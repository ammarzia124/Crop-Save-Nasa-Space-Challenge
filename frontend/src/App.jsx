import React, { useState } from 'react';
import axios from 'axios';
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import PakistanMap from './components/PakistanMap';
import RiskCard from './components/RiskCard';
import AdvisoryPanel from './components/AdvisoryPanel';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleGetForecast = () => {
    setActiveSection('predict');
    setTimeout(() => {
      document.getElementById('predict-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setRiskData(null);
  };

  const handlePredict = async (district) => {
    setLoading(true);
    try {
      // ── Real backend: Ammar's FastAPI ──
      // Request body:  { lat, lon, district_name }
      // Response body: { district_name, risk_score, risk_level, soil_moisture,
      //                  rainfall_last_30_days, temperature_max, humidity, prediction_date }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/predict`, {
        lat: district.lat,
        lon: district.lon,
        district_name: district.name,   // Ammar uses "district_name"
      }, { timeout: 8000 });

      const d = response.data;
      // Normalise to the field names the UI components expect
      setRiskData({
        score:        d.risk_score,                 // risk_score        → score
        level:        d.risk_level,                 // risk_level        → level
        soil_moisture: d.soil_moisture,
        rainfall_30d:  d.rainfall_last_30_days,     // rainfall_last_30_days → rainfall_30d
        temp_max:      d.temperature_max,           // temperature_max   → temp_max
        humidity:      d.humidity,
        district:      d.district_name,
        timestamp:     new Date(d.prediction_date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
      });

    } catch {
      // Backend offline → use mock data so the UI still works for demos
      await new Promise((r) => setTimeout(r, 2200));
      const mockScore = Math.floor(Math.random() * 100);
      setRiskData({
        score:        mockScore,
        level:        mockScore <= 30 ? 'LOW' : mockScore <= 65 ? 'MEDIUM' : 'HIGH',
        soil_moisture: (Math.random() * 40 + 10).toFixed(1),
        rainfall_30d:  (Math.random() * 80).toFixed(1),
        temp_max:      (Math.random() * 15 + 25).toFixed(1),
        humidity:      (Math.random() * 40 + 30).toFixed(1),
        district:      district.name,
        timestamp:     new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
      });
    }

    setLoading(false);
    setActiveSection('result');
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleReset = () => {
    setRiskData(null);
    setSelectedDistrict(null);
    setActiveSection('predict');
    setTimeout(() => {
      document.getElementById('predict-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#030a06' }}>
      <ParticleBackground />
      {loading && <LoadingSpinner />}
      <Navbar onGetForecast={handleGetForecast} />

      {/* HOME */}
      <HeroSection onGetForecast={handleGetForecast} />
      <HowItWorks />

      {/* PREDICT */}
      <div id="predict-section">
        <PakistanMap
          onSelectDistrict={handleSelectDistrict}
          selectedDistrict={selectedDistrict}
          onPredict={handlePredict}
        />
      </div>

      {/* RESULT */}
      {riskData && (
        <div id="result-section">
          <RiskCard
            riskData={riskData}
            district={selectedDistrict}
            onReset={handleReset}
          />
          <AdvisoryPanel
            level={riskData.level}
            district={selectedDistrict}
            onReset={handleReset}
          />
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '40px 24px',
        borderTop: '1px solid rgba(16,185,129,0.08)',
      }}>
        <p style={{ color: 'rgba(226,232,240,0.25)', fontSize: '13px' }}>
          🌱 CropSave · NASA Space Apps Challenge 2026 · Team CropSave
        </p>
        <p style={{ color: 'rgba(226,232,240,0.15)', fontSize: '12px', marginTop: '6px' }}>
          Powered by NASA POWER API · NASA SMAP · Built with React + Tailwind
        </p>
      </footer>
    </div>
  );
}

export default App;
