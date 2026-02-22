'use client'

import React, { useState } from 'react';
import { Camera, Radio, Cpu, Database, BarChart3, Map, Wifi, CheckCircle, ArrowRight, Download, Code, Server, Zap, TrendingUp, AlertCircle, MapPin, Activity, Shield, Users, FileText, Settings, Globe, ChevronRight, Brain, Network, Car, Video, Cloud, HardDrive } from 'lucide-react';

const DeploymentGuidePage = () => {
  const [activeTab, setActiveTab] = useState('cctv');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0f1729 50%, #1e2a4a 75%, #0a0e27 100%)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animated Background Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px', animation: 'gridMove 20s linear infinite' }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)' }}></div>
      
      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
        }
        .glow-border {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-border:hover::before {
          opacity: 1;
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Hero Section */}
        <div style={{ padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }}></div>
          
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '9999px', marginBottom: '1.5rem' }}>
              <Zap style={{ width: '1rem', height: '1rem', color: '#06b6d4' }} />
              <span style={{ color: '#06b6d4', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>ENTERPRISE DEPLOYMENT</span>
            </div>
            
            <h1 style={{ fontSize: '4rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem', lineHeight: 1.2, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              SmartRoad AI
            </h1>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>
              Deployment & Integration Guide
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
              Enterprise-grade infrastructure monitoring system designed for real-world scalability. Deploy AI-powered pothole detection across city-wide CCTV networks, vehicle fleets, and municipal inspection systems.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#architecture" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s' }}>
                <Server style={{ width: '1.25rem', height: '1.25rem' }} />
                View Architecture
              </a>
              <a href="#installation" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.3s' }}>
                <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                Installation Guide
              </a>
            </div>
          </div>
        </div>

        {/* System Architecture Section */}
        <div id="architecture" style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              System Architecture
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
              Modular AI infrastructure with edge computing capabilities and cloud synchronization
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="glow-border" style={{ borderRadius: '1.5rem', padding: '3rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
              
              {/* Input Layer */}
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { icon: Camera, label: 'CCTV Cameras', color: '#3b82f6' },
                  { icon: Video, label: 'Dashcams', color: '#06b6d4' },
                  { icon: Car, label: 'Survey Vehicles', color: '#8b5cf6' }
                ].map((source, i) => (
                  <div key={i} className="card-hover" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '1rem', border: '1px solid rgba(71, 85, 105, 0.5)', minWidth: '200px', textAlign: 'center' }}>
                    <div style={{ width: '4rem', height: '4rem', background: `linear-gradient(135deg, ${source.color}, ${source.color}88)`, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <source.icon style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{source.label}</div>
                  </div>
                ))}
              </div>

              <ArrowRight style={{ width: '2rem', height: '2rem', color: '#3b82f6', transform: 'rotate(90deg)' }} />

              {/* Processing Layer */}
              <div className="card-hover" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.4)', minWidth: '300px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Cpu style={{ width: '2.5rem', height: '2.5rem', color: '#06b6d4' }} />
                  <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>Edge Processing</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Frame Extraction & Preprocessing</p>
              </div>

              <ArrowRight style={{ width: '2rem', height: '2rem', color: '#3b82f6', transform: 'rotate(90deg)' }} />

              {/* AI Layer */}
              <div className="card-hover" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))', borderRadius: '1rem', border: '1px solid rgba(139, 92, 246, 0.4)', minWidth: '350px', textAlign: 'center', animation: 'glow 3s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Brain style={{ width: '3rem', height: '3rem', color: '#a78bfa' }} />
                  <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>AI Detection Server</span>
                </div>
                <p style={{ color: '#c4b5fd', fontSize: '0.875rem', fontWeight: 600 }}>YOLO-v8 Neural Network</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '9999px', fontSize: '0.75rem', color: '#c4b5fd' }}>Detection</span>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '9999px', fontSize: '0.75rem', color: '#c4b5fd' }}>Classification</span>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '9999px', fontSize: '0.75rem', color: '#c4b5fd' }}>Localization</span>
                </div>
              </div>

              <ArrowRight style={{ width: '2rem', height: '2rem', color: '#3b82f6', transform: 'rotate(90deg)' }} />

              {/* Storage Layer */}
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '1rem', border: '1px solid rgba(71, 85, 105, 0.5)', minWidth: '250px', textAlign: 'center' }}>
                  <Database style={{ width: '2.5rem', height: '2.5rem', color: '#10b981', margin: '0 auto 1rem' }} />
                  <div style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Database</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>MongoDB / PostgreSQL</p>
                </div>
                <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '1rem', border: '1px solid rgba(71, 85, 105, 0.5)', minWidth: '250px', textAlign: 'center' }}>
                  <BarChart3 style={{ width: '2.5rem', height: '2.5rem', color: '#f59e0b', margin: '0 auto 1rem' }} />
                  <div style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Admin Dashboard</div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Real-time Analytics</p>
                </div>
              </div>

              <ArrowRight style={{ width: '2rem', height: '2rem', color: '#3b82f6', transform: 'rotate(90deg)' }} />

              {/* Output Layer */}
              <div className="card-hover" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.4)', minWidth: '300px', textAlign: 'center' }}>
                <Map style={{ width: '3rem', height: '3rem', color: '#10b981', margin: '0 auto 1rem' }} />
                <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Heatmap Analytics</div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>City-wide Infrastructure Monitoring</p>
              </div>
            </div>
          </div>

          {/* Architecture Explanation */}
          <div className="glow-border" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <Network style={{ width: '2rem', height: '2rem', color: '#06b6d4', flexShrink: 0 }} />
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>REST API Communication</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                  All components communicate via RESTful APIs with JSON payloads. Edge devices send frames to the detection endpoint (<code style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: '#60a5fa' }}>POST /api/detect</code>) and receive detection results including bounding boxes, confidence scores, and severity classification.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <MapPin style={{ width: '2rem', height: '2rem', color: '#10b981', flexShrink: 0 }} />
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>GPS Tagging & Geospatial Indexing</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                  Every detection is automatically tagged with GPS coordinates (latitude/longitude) for precise location mapping. The system uses geospatial indexing for efficient querying of nearby reports and generating city-wide heatmaps for infrastructure planning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Modules */}
        <div style={{ padding: '4rem 2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                Deployment Scenarios
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
                Choose your integration approach based on infrastructure requirements
              </p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
              {[
                { id: 'cctv', label: 'CCTV Integration', icon: Camera },
                { id: 'dashcam', label: 'Dashcam System', icon: Video },
                { id: 'survey', label: 'Survey Vehicles', icon: Car }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 2rem',
                      background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'rgba(30, 41, 59, 0.6)',
                      border: `1px solid ${activeTab === tab.id ? 'rgba(59, 130, 246, 0.5)' : 'rgba(71, 85, 105, 0.5)'}`,
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: activeTab === tab.id ? '0 10px 30px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* CCTV Integration */}
            {activeTab === 'cctv' && (
              <div style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div className="glow-border" style={{ padding: '3rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '1rem' }}>
                      <Camera style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>Smart City CCTV Integration</h3>
                  </div>
                  
                  <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.8 }}>
                    Leverage existing municipal CCTV infrastructure for continuous road monitoring. The system extracts frames at configurable intervals and processes them through the AI detection pipeline without requiring additional hardware.
                  </p>

                  {/* Installation Steps */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                      {
                        step: '1',
                        title: 'Connect CCTV to NVR',
                        desc: 'Link IP cameras to Network Video Recorder or edge processing unit',
                        icon: Camera
                      },
                      {
                        step: '2',
                        title: 'Configure Frame Extraction',
                        desc: 'Set interval-based capture (recommended: 5-10 seconds per frame)',
                        icon: Settings
                      },
                      {
                        step: '3',
                        title: 'API Endpoint Integration',
                        desc: 'Send frames to AI detection server via POST /api/detect/image',
                        icon: Code
                      },
                      {
                        step: '4',
                        title: 'Receive Detection Results',
                        desc: 'Get JSON response with bounding boxes, severity, and confidence',
                        icon: CheckCircle
                      },
                      {
                        step: '5',
                        title: 'Dashboard Integration',
                        desc: 'Results automatically stored and displayed in admin dashboard',
                        icon: BarChart3
                      }
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="card-hover" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '1rem', border: '1px solid rgba(71, 85, 105, 0.5)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '50%', opacity: 0.1 }}></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
                              {item.step}
                            </div>
                            <Icon style={{ width: '1.5rem', height: '1.5rem', color: '#06b6d4' }} />
                          </div>
                          <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.125rem' }}>{item.title}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* API Example */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Code style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>API Request Example</span>
                    </div>
                    <pre style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6 }}>
{`POST /api/detect/image
Content-Type: multipart/form-data

{
  "image": "base64_encoded_frame_data",
  "camera_id": "CCTV_01_MAIN_STREET",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timestamp": "2026-02-14T10:30:00Z"
}

Response:
{
  "detected": true,
  "severity": "moderate",
  "confidence": 0.89,
  "boundingBox": { "x": 234, "y": 456, "width": 120, "height": 80 },
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "report_id": "RPT_20260214_001"
}`}
                    </pre>
                  </div>
                </div>

                {/* Demo Result Preview */}
                <div className="glow-border" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Detection Result Preview</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem' }}>
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Severity</div>
                      <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700 }}>Moderate</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem' }}>
                      <div style={{ color: '#93c5fd', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Confidence</div>
                      <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>89%</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem' }}>
                      <div style={{ color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Processing</div>
                      <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>1.2s</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dashcam Integration */}
            {activeTab === 'dashcam' && (
              <div style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div className="glow-border" style={{ padding: '3rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', borderRadius: '1rem' }}>
                      <Video style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>Vehicle Dashcam AI Integration</h3>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.8 }}>
                    Transform commercial vehicle fleets into mobile road inspection units. Dashcams continuously monitor road conditions during regular operations, automatically detecting and reporting potholes with precise GPS coordinates.
                  </p>

                  {/* Workflow Visualization */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '1rem', minWidth: '180px', textAlign: 'center' }}>
                      <Car style={{ width: '2.5rem', height: '2.5rem', color: '#06b6d4', margin: '0 auto 0.75rem' }} />
                      <div style={{ color: 'white', fontWeight: 600 }}>Moving Vehicle</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Real-time capture</div>
                    </div>
                    <ArrowRight style={{ width: '2rem', height: '2rem', color: '#06b6d4' }} />
                    <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '1rem', minWidth: '180px', textAlign: 'center' }}>
                      <MapPin style={{ width: '2.5rem', height: '2.5rem', color: '#10b981', margin: '0 auto 0.75rem' }} />
                      <div style={{ color: 'white', fontWeight: 600 }}>GPS Tagging</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Lat/Long capture</div>
                    </div>
                    <ArrowRight style={{ width: '2rem', height: '2rem', color: '#06b6d4' }} />
                    <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '1rem', minWidth: '180px', textAlign: 'center' }}>
                      <Cloud style={{ width: '2.5rem', height: '2.5rem', color: '#8b5cf6', margin: '0 auto 0.75rem' }} />
                      <div style={{ color: 'white', fontWeight: 600 }}>Auto-Upload</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cloud processing</div>
                    </div>
                  </div>

                  {/* JSON Payload Example */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.2)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                      <span style={{ color: '#06b6d4', fontWeight: 600 }}>Dashcam Payload Structure</span>
                    </div>
                    <pre style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6 }}>
{`{
  "image": "base64_encoded_frame_string",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "source": "dashcam",
  "vehicle_id": "FLEET_VEH_042",
  "timestamp": "2026-02-14T10:30:00Z",
  "speed": 45,
  "heading": 178
}`}
                    </pre>
                  </div>

                  {/* Key Features */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {[
                      { icon: Zap, title: 'Automatic Detection', desc: 'AI processes frames in real-time as vehicle moves' },
                      { icon: MapPin, title: 'GPS Precision', desc: 'Every detection tagged with exact coordinates' },
                      { icon: TrendingUp, title: 'Severity Classification', desc: 'Automatic prioritization based on damage size' },
                      { icon: Cloud, title: 'Cloud Sync', desc: 'Instant upload to centralized dashboard' }
                    ].map((feature, i) => {
                      const Icon = feature.icon;
                      return (
                        <div key={i} className="card-hover" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '1rem' }}>
                          <Icon style={{ width: '2rem', height: '2rem', color: '#06b6d4', marginBottom: '0.75rem' }} />
                          <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{feature.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Survey Vehicle System */}
            {activeTab === 'survey' && (
              <div style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div className="glow-border" style={{ padding: '3rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '1rem' }}>
                      <Car style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>Municipal Road Survey Model</h3>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.8 }}>
                    Dedicated inspection vehicles with high-resolution cameras systematically scan city roads. Ideal for comprehensive monthly audits, infrastructure planning, and generating detailed city-wide road condition heatmaps.
                  </p>

                  {/* Survey Process */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                      {
                        icon: Camera,
                        title: 'Camera Mounted Vehicle',
                        desc: 'High-resolution cameras mounted on inspection vehicle roof',
                        color: '#8b5cf6'
                      },
                      {
                        icon: Globe,
                        title: 'Systematic Scanning',
                        desc: 'Planned routes covering entire municipal area monthly',
                        color: '#06b6d4'
                      },
                      {
                        icon: Map,
                        title: 'Heatmap Generation',
                        desc: 'City-wide damage density maps for infrastructure planning',
                        color: '#f59e0b'
                      },
                      {
                        icon: AlertCircle,
                        title: 'Priority Routing',
                        desc: 'AI-powered repair prioritization based on severity clusters',
                        color: '#ef4444'
                      }
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="card-hover" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '1rem', border: `1px solid ${item.color}33` }}>
                          <div style={{ width: '3rem', height: '3rem', background: `${item.color}22`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Icon style={{ width: '1.5rem', height: '1.5rem', color: item.color }} />
                          </div>
                          <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Heatmap Visualization */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Map style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
                      City-wide Infrastructure Heatmap
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 700 }}>342</div>
                        <div style={{ color: '#fca5a5', fontSize: '0.875rem' }}>High Severity Zones</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(234, 179, 8, 0.3)', textAlign: 'center' }}>
                        <div style={{ color: '#eab308', fontSize: '2rem', fontWeight: 700 }}>892</div>
                        <div style={{ color: '#fde047', fontSize: '0.875rem' }}>Moderate Areas</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                        <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 700 }}>1,523</div>
                        <div style={{ color: '#6ee7b7', fontSize: '0.875rem' }}>Minor Damage</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
                        <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 700 }}>94%</div>
                        <div style={{ color: '#93c5fd', fontSize: '0.875rem' }}>Coverage Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Installation Process Timeline */}
            <div id="installation" style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                  Installation Process Flow
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
                  End-to-end deployment in 6 systematic phases
                </p>
              </div>

              <div style={{ position: 'relative', padding: '2rem 0' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #3b82f6, #06b6d4)', transform: 'translateX(-50%)' }}></div>
                
                {[
                  { icon: FileText, title: 'Planning & Assessment', desc: 'Infrastructure audit, hardware requirements, deployment scope definition', color: '#3b82f6' },
                  { icon: HardDrive, title: 'Hardware Setup', desc: 'Install cameras, NVR units, edge processing devices, network configuration', color: '#06b6d4' },
                  { icon: Code, title: 'API Configuration', desc: 'Configure endpoints, authentication tokens, data pipelines, GPS integration', color: '#8b5cf6' },
                  { icon: Activity, title: 'Testing & Calibration', desc: 'Run detection tests, adjust thresholds, validate accuracy, performance tuning', color: '#10b981' },
                  { icon: Zap, title: 'Production Deployment', desc: 'Go live with monitoring, dashboard activation, alert system configuration', color: '#f59e0b' },
                  { icon: BarChart3, title: 'Monitoring & Optimization', desc: 'Performance analytics, model refinement, system health tracking, scaling', color: '#ef4444' }
                ].map((phase, i) => {
                  const Icon = phase.icon;
                  const isEven = i % 2 === 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
                      <div style={{ flex: 1, textAlign: isEven ? 'right' : 'left', paddingRight: isEven ? '2rem' : '0', paddingLeft: !isEven ? '2rem' : '0', order: isEven ? 1 : 3 }}>
                        <div className="card-hover glow-border" style={{ display: 'inline-block', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(30, 41, 59, 0.8)', border: `1px solid ${phase.color}33`, maxWidth: '400px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', justifyContent: isEven ? 'flex-end' : 'flex-start' }}>
                            <Icon style={{ width: '1.5rem', height: '1.5rem', color: phase.color }} />
                            <h4 style={{ color: 'white', fontWeight: 600, fontSize: '1.125rem' }}>{phase.title}</h4>
                          </div>
                          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{phase.desc}</p>
                        </div>
                      </div>
                      <div style={{ width: '4rem', height: '4rem', background: `linear-gradient(135deg, ${phase.color}, ${phase.color}dd)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', color: 'white', zIndex: 10, order: 2, boxShadow: `0 0 30px ${phase.color}66` }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, order: isEven ? 3 : 1 }}></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Services & Support */}
            <div style={{ padding: '4rem 2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                    Services & Support
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
                    Comprehensive deployment assistance and technical support
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  {[
                    {
                      icon: FileText,
                      title: 'API Documentation',
                      desc: 'Complete REST API reference with authentication guides, endpoint specifications, and integration examples',
                      color: '#3b82f6'
                    },
                    {
                      icon: Server,
                      title: 'Edge Deployment',
                      desc: 'On-premise installation support for edge computing units, local processing, and offline capability',
                      color: '#06b6d4'
                    },
                    {
                      icon: Globe,
                      title: 'Smart City Integration',
                      desc: 'End-to-end municipal infrastructure integration, data pipeline setup, dashboard customization',
                      color: '#8b5cf6'
                    },
                    {
                      icon: Code,
                      title: 'Custom Firmware API',
                      desc: 'Tailored firmware development for specialized hardware, protocol adaptation, legacy system integration',
                      color: '#10b981'
                    }
                  ].map((service, i) => {
                    const Icon = service.icon;
                    return (
                      <div key={i} className="card-hover glow-border" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(30, 41, 59, 0.6)', border: `1px solid ${service.color}33`, textAlign: 'center' }}>
                        <div style={{ width: '5rem', height: '5rem', background: `linear-gradient(135deg, ${service.color}, ${service.color}88)`, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                          <Icon style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{service.title}</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>{service.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Outcomes & Benefits */}
            <div style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                  Measurable Outcomes
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
                  Proven impact on municipal infrastructure management
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {[
                  {
                    icon: Zap,
                    title: 'Real-time Detection',
                    stat: '<5s',
                    desc: 'Average processing time per frame with instant alert generation',
                    color: '#3b82f6'
                  },
                  {
                    icon: MapPin,
                    title: 'GPS Accuracy',
                    stat: '±2m',
                    desc: 'Precise geolocation tagging for every detection with sub-5 meter accuracy',
                    color: '#10b981'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Faster Response',
                    stat: '60%',
                    desc: 'Reduction in maintenance response time through automated prioritization',
                    color: '#f59e0b'
                  },
                  {
                    icon: Globe,
                    title: 'Coverage Scale',
                    stat: '100%',
                    desc: 'City-wide infrastructure monitoring with comprehensive heatmap analytics',
                    color: '#06b6d4'
                  }
                ].map((outcome, i) => {
                  const Icon = outcome.icon;
                  return (
                    <div key={i} className="card-hover glow-border" style={{ padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))', border: `1px solid ${outcome.color}44`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: `${outcome.color}11`, borderRadius: '50%' }}></div>
                      <Icon style={{ width: '3rem', height: '3rem', color: outcome.color, marginBottom: '1rem' }} />
                      <div style={{ fontSize: '3rem', fontWeight: 800, color: outcome.color, marginBottom: '0.5rem' }}>{outcome.stat}</div>
                      <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>{outcome.title}</h3>
                      <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>{outcome.desc}</p>
                      <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: outcome.color, position: 'absolute', bottom: '1rem', right: '1rem' }} />
                    </div>
                  );
                })}
              </div>

              {/* CTA Section */}
              <div className="glow-border" style={{ marginTop: '4rem', padding: '3rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
                <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Ready to Deploy SmartRoad AI?
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
                  Contact our deployment team for infrastructure assessment, custom integration, and technical support
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', borderRadius: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}>
                    <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                    Schedule Consultation
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                    Download Whitepaper
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuidePage;
