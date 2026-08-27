import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from './components/layout/MainLayout';
import FileUploader from './components/sections/FileUploader';
import GraphViewer from './components/sections/GraphViewer';
import VariantTable from './components/sections/VariantTable';
import MatrixHeatmap from './components/sections/MatrixHeatmap';
import Dashboard from './components/sections/Dashboard';

function App() {
  
  const [activeMenu, setActiveMenu] = useState('upload');
  const [miningData, setMiningData] = useState(null); // JSON from backend
  const [loading, setLoading] = useState(false);

  // Local URL Backend
  const API_URL = 'https://localhost:7277/api/Miner/upload';

  const handleFileProcess = async (file) => {
    setLoading(true);
    setMiningData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // POST at local API
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Save answer and change active menu to show heuristic graph
      setMiningData(response.data);
      console.log("JSON recibido desde C#:", response.data);
      setActiveMenu('dashboard');

    } catch (err) {
      console.error(err);
      alert('Error al analizar el archivo. Asegúrate de que el backend en C# está ejecutándose.');
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
            title="Red de Dependencias Heurísticas"
            description="Muestra los flujos principales filtrando el ruido mediante frecuencias."
          />
        );
      case 'alpha':
        return (
          <GraphViewer
            dotString={miningData.alphaGraphDot}
            title="Modelo Alpha Miner"
            description="Red de Petri subyacente que representa todas las relaciones posibles registradas."
          />
        );
      case 'social':
        return (
          <GraphViewer
            dotString={miningData.socialGraphDot}
            title="Red Social (Handover of Work)"
            description="Muestra cómo se transfiere el trabajo entre los distintos recursos (empleados/sistemas)."
          />
        );
      case 'variants':
        return (
          <VariantTable variants={miningData.topVariants}/>
        );
      case 'matrices':
        return(
          <MatrixHeatmap
            activities={miningData.activities}
            dependencyMatrix={miningData.dependencyMatrix}
            concurrencyMatrix={miningData.concurrencyMatrix}
          />
        );
      case 'dashboard':
        return(
          <Dashboard dashboardData={miningData.dashboard}/>
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