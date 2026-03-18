import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Upload, 
  Leaf, 
  Activity, 
  Map as MapIcon, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Crosshair,
  ChevronRight,
  Info,
  RefreshCw,
  BarChart3,
  Layers,
  MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("compare");
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await axios.post(`${API_BASE}/upload`, formData);
      const analyzeRes = await axios.post(`${API_BASE}/analyze`, {
        file_path: uploadRes.data.file_path
      });
      setResult(analyzeRes.data);
    } catch (err) {
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Healthy', value: result.overall_health, color: '#2d6a4f' },
    { name: 'Moderate', value: result.zones?.moderate || 0, color: '#d4a373' },
    { name: 'Stressed', value: result.severity, color: '#f94144' },
  ] : [];

  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="container">
      {/* Navigation */}
      <nav className="nav-header">
        <div className="brand">
          <Leaf size={32} fill="currentColor" />
          <span>CropSight <span style={{fontWeight: 300}}>AI</span></span>
          <div className="brand-dot" />
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          {result && (
            <button className="btn" onClick={() => window.location.reload()}>
              <RefreshCw size={18} /> New Analysis
            </button>
          )}
        </div>
      </nav>

      <main>
        {!result && !loading && (
          <section className="hero">
            <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
              The Future of <br/>Precision Farming.
            </motion.h1>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.2}}>
              Deploying advanced computer vision to identify crop stress before it's visible to the human eye. 
              Optimize your yield with AI-driven spectral analysis.
            </motion.p>
            
            <motion.div 
              className="dropzone glass-card"
              whileHover={{ scale: 1.01 }}
              onClick={() => fileInputRef.current.click()}
            >
              <div style={{background: '#f0fdf4', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem'}}>
                <Upload size={40} color="#2d6a4f" />
              </div>
              <h3 style={{marginBottom: '0.5rem'}}>
                {file ? file.name : "Upload Multispectral Imagery"}
              </h3>
              <p style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>
                Drag and drop your drone capture or click to browse
              </p>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </motion.div>

            {file && (
              <motion.button 
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                className="btn btn-primary"
                style={{marginTop: '2rem'}}
                onClick={handleUpload}
              >
                Launch Analysis <ChevronRight size={18} />
              </motion.button>
            )}
          </section>
        )}

        {loading && (
          <div style={{textAlign: 'center', padding: '100px 0'}}>
            <div className="scanner-wrapper" style={{maxWidth: '600px', margin: '0 auto', height: '350px'}}>
              <div className="scanner-line" />
              <img src={preview} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5}} />
            </div>
            <h2 style={{marginTop: '2rem', fontWeight: 800}}>Neural Engine Processing...</h2>
            <p style={{color: 'var(--text-dim)'}}>Extracting spectral indices and calculating health metrics</p>
          </div>
        )}

        {result && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dashboard">
            {/* KPI Row */}
            <div className="kpi-row">
              <div className="glass-card kpi-card">
                <div className="kpi-label">Health Score</div>
                <div className="kpi-value" style={{color: 'var(--primary)'}}>{result.overall_health}%</div>
                <div className={`badge ${result.overall_health > 70 ? 'badge-green' : 'badge-orange'}`}>
                  {result.status}
                </div>
              </div>
              <div className="glass-card kpi-card">
                <div className="kpi-label">Stress Intensity</div>
                <div className="kpi-value" style={{color: 'var(--accent)'}}>{result.severity}%</div>
                <div className="badge badge-red">Critical Alert</div>
              </div>
              <div className="glass-card kpi-card">
                <div className="kpi-label">Total Zones</div>
                <div className="kpi-value">{result.spray_zones.length}</div>
                <div className="badge" style={{background: '#eee'}}>Precision Targets</div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Visuals */}
              <div className="glass-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Layers size={20} /> Spectral Intelligence
                  </h3>
                  <div className="viz-controls">
                    <div className={`viz-tab ${activeTab === "compare" ? "active" : ""}`} onClick={() => setActiveTab("compare")}>Compare</div>
                    <div className={`viz-tab ${activeTab === "heatmap" ? "active" : ""}`} onClick={() => setActiveTab("heatmap")}>Heatmap</div>
                    {result.mask_url && <div className={`viz-tab ${activeTab === "mask" ? "active" : ""}`} onClick={() => setActiveTab("mask")}>Mask</div>}
                  </div>
                </div>

                <div className="slider-container" onMouseMove={handleMove} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
                  {activeTab === "compare" ? (
                    <>
                      <img src={preview} className="slider-img" alt="Original" />
                      <div className="slider-img" style={{clipPath: `inset(0 0 0 ${sliderPos}%)`}}>
                        <img src={`${result.map_url}?t=${Date.now()}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Heatmap" />
                      </div>
                      <div className="slider-handle" style={{left: `${sliderPos}%`}}>
                        <div className="slider-circle"><MousePointer2 size={16} /></div>
                      </div>
                    </>
                  ) : activeTab === "heatmap" ? (
                    <div style={{position: 'relative', height: '100%'}}>
                      <img src={`${result.map_url}?t=${Date.now()}`} className="slider-img" />
                      {result.spray_zones.map((zone, i) => (
                        <div key={i} className="zone-marker" style={{left: `${(zone.y / 600) * 100}%`, top: `${(zone.x / 600) * 100}%`}} />
                      ))}
                    </div>
                  ) : (
                    <img src={`${result.mask_url}?t=${Date.now()}`} className="slider-img" />
                  )}
                </div>
                
                <div style={{marginTop: '1.5rem', display: 'flex', gap: '1.5rem'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem'}}>
                      <div style={{width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)'}} />
                      <span>Optimized Area</span>
                   </div>
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem'}}>
                      <div style={{width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)'}} />
                      <span>Treatment Required</span>
                   </div>
                </div>
              </div>

              {/* Right Column: Insights */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                <div className="glass-card" style={{flex: 1}}>
                  <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <BarChart3 size={20} /> Health Distribution
                  </h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card">
                   <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Crosshair size={20} /> Target Zones
                  </h3>
                  <div className="zone-list">
                    {result.spray_zones.slice(0, 5).map((zone, i) => (
                      <div key={i} className="zone-item">
                        <span style={{fontWeight: 600}}>Zone {i+1}</span>
                        <span style={{color: 'var(--text-dim)'}}>X: {zone.x} Y: {zone.y}</span>
                        <span className="badge badge-red">Spray</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', justifyContent: 'center'}}>
                    <Download size={18} /> Export Full Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer style={{textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)', fontSize: '0.8rem'}}>
        &copy; 2026 CropSight AI &bull; Built for High-Performance Agriculture &bull; Version 2.0.4-beta
      </footer>
    </div>
  );
}

export default App;