import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from './components/layout/MainLayout';
import FileUploader from './components/sections/FileUploader';
import GraphViewer from './components/sections/GraphViewer';
import VariantTable from './components/sections/VariantTable';
import MatrixHeatmap from './components/sections/MatrixHeatmap';
import Dashboard from './components/sections/Dashboard';
import AdvancedDashboard from './components/sections/AdvancedDashboard';

function App() {

  const [activeMenu, setActiveMenu] = useState('upload');
  const [miningData, setMiningData] = useState(null); // JSON from backend
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); // Active log file stored in memory

  // Local backend URL
  const API_URL = 'https://localhost:7277/api/Miner/upload';

  // Modified to optionally accept a configuration object (sliders) alongside new or existing files
  const handleFileProcess = async (fileOrConfig, maybeConfig) => {
    let fileToUse = currentFile;
    let config = { dependency: 0.5, concurrency: 0.8, support: 0.01 };

    // Discriminate whether we receive a new file or directly configuration from sliders
    if (fileOrConfig instanceof File) {
      fileToUse = fileOrConfig;
      setCurrentFile(fileToUse);
    } else if (fileOrConfig && typeof fileOrConfig === 'object') {
      config = { ...config, ...fileOrConfig };
    }

    if (maybeConfig && typeof maybeConfig === 'object') {
      config = { ...config, ...maybeConfig };
    }

    if (!fileToUse) {
      alert('Please select a file first.');
      setActiveMenu('upload');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', fileToUse);
    // Append slider calibration parameters to the FormData
    formData.append('dependency', config.dependency.toString().replace('.', ','));
    formData.append('concurrency', config.concurrency.toString().replace('.', ','));
    formData.append('support', config.support.toString().replace('.', ','));

    try {
      // POST request to local API
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Save response data
      setMiningData(response.data);
      console.log("JSON received from C# with new thresholds:", response.data);

      // If coming from upload, switch to the start menu automatically
      if (activeMenu === 'upload') {
        setActiveMenu('start');
      }

    } catch (err) {
      console.error(err);
      alert('Error analyzing the file. Make sure the C# backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {

    if (activeMenu === 'upload') {
      return (
        <FileUploader
          onFileSelect={handleFileProcess}
          isLoading={loading}
        />
      );
    }

    if (!miningData) return null;

    // Different graph or matrix drawing
    switch (activeMenu) {
      case 'heuristic':
        return (
          <GraphViewer
            dotString={miningData.heuristicGraphDot}
            title="Heuristic Dependency Network"
            description="Shows main flows filtering noise using frequencies."
            onRecalculate={(newConfig) => handleFileProcess(newConfig)}
            showSliders={true}
          />
        );
      case 'alpha':
        return (
          <GraphViewer
            dotString={miningData.alphaGraphDot}
            title="Alpha Miner Model"
            description="Underlying Petri net representing all recorded possible relationships."
            showSliders={false}
          />
        );
      case 'social':
        return (
          <GraphViewer
            dotString={miningData.socialGraphDot}
            title="Social Network (Handover of Work)"
            description="Shows how work is transferred between different resources (staff/systems)."
            showSliders={false}
          />
        );
      case 'variants':
        return (
          <VariantTable variants={miningData.topVariants} />
        );
      case 'matrices':
        return (
          <MatrixHeatmap
            activities={miningData.activities}
            dependencyMatrix={miningData.dependencyMatrix}
            concurrencyMatrix={miningData.concurrencyMatrix}
          />
        );
      case 'dashboard':
        return (
          <Dashboard dashboardData={miningData.dashboard} />
        );
      case 'start':
        return (
          <AdvancedDashboard
            miningData={miningData}
            onRecalculate={(newConfig) => handleFileProcess(newConfig)}
          />
        );
      default:
        return (
          <FileUploader onFileSelect={handleFileProcess} isLoading={loading} />
        );
    }
  };

  return (
    <MainLayout
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      hasData={miningData !== null}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;