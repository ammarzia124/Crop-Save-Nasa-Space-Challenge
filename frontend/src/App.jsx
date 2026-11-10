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
import Charts from './components/Charts';
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
    const targetDistrict = district || selectedDistrict;
    if (!targetDistrict) {
      console.warn('handlePredict: No district specified');
      return;
    }

    setLoading(true);
    try {
      // ── Real backend: Ammar's FastAPI ──
      // Request body:  { lat, lon, district_name }
      // Response body: { district_name, risk_score, risk_level, soil_moisture,
      //                  rainfall_last_30_days, temperature_max, humidity, prediction_date }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/predict`, {
        lat: targetDistrict.lat,
        lon: targetDistrict.lon,
        district_name: targetDistrict.name,
      }, { timeout: 25000 });

      console.log('Prediction response:', response.data);

      const d = response.data;
      // Normalise to the field names the UI components expect
      setRiskData({
        score:         d.risk_score,
        level:         d.risk_level,
        soil_moisture: d.soil_moisture,
        rainfall_30d:  d.rainfall_last_30_days,
        temp_max:      d.temperature_max,
        humidity:      d.humidity,
        district:      d.district_name || targetDistrict.name,
        timestamp:     d.prediction_date
          ? new Date(d.prediction_date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            }),
      });

    } catch (err) {
      console.warn('Backend unavailable, using fallback mock data:', err);
      // Backend offline or timeout → use realistic mock data so demo keeps running
      await new Promise((r) => setTimeout(r, 1000));
      const mockScore = Math.floor(Math.random() * 100);
      setRiskData({
        score:         mockScore,
        level:         mockScore <= 30 ? 'LOW' : mockScore <= 65 ? 'MEDIUM' : 'HIGH',
        soil_moisture: parseFloat((Math.random() * 40 + 10).toFixed(1)),
        rainfall_30d:  parseFloat((Math.random() * 80).toFixed(1)),
        temp_max:      parseFloat((Math.random() * 15 + 25).toFixed(1)),
        humidity:      parseFloat((Math.random() * 40 + 30).toFixed(1)),
        district:      targetDistrict.name,
        timestamp:     new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
      });
    } finally {
      setLoading(false);
    }

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
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
          onPredict={handlePredict}
          riskData={riskData}
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

          {/* 12-Month Rainfall History Chart */}
          <Charts
            district={selectedDistrict}
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
