import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from './components/layout/MainLayout';
import FileUploader from './components/sections/FileUploader';
import GraphViewer from './components/sections/GraphViewer';
import VariantTable from './components/sections/VariantTable';
import MatrixHeatmap from './components/sections/MatrixHeatmap';
import Dashboard from './components/sections/Dashboard';
import AdvancedDashboard from './components/sections/AdvancedDashboard';
import { AiOutlineSetting } from 'react-icons/ai';

function App() {

  const [activeMenu, setActiveMenu] = useState('upload');
  const [miningData, setMiningData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  // ESTADO DEL MOTOR: 'waking', 'ready', 'error'
  const [engineStatus, setEngineStatus] = useState('waking');

  // URL BASE (Acuérdate de cambiar esto por la de Render cuando subas la API)
  const API_BASE_URL = 'https://processminer.onrender.com/api/Miner';

  // --- SECUENCIA DE WARM-UP (Ping al servidor en Render) ---
  useEffect(() => {
    let isMounted = true;

    const wakeUpServer = async () => {
      try {
        // Render pauses petition while it starts
        await axios.get(`${API_BASE_URL}/health`, { timeout: 60000 });

        if (isMounted) {
          setEngineStatus('ready');
          console.log("Motor de minería operativo y conectado.");
        }
      } catch (err) {
        console.warn("El servidor sigue dormido o hay error. Reintentando en 5s...");
        if (isMounted && engineStatus !== 'ready') {
          setTimeout(wakeUpServer, 5000);
        }
      }
    };

    wakeUpServer();

    return () => { isMounted = false; };
  }, []);

  const handleFileProcess = async (fileOrConfig, maybeConfig) => {
    let fileToUse = currentFile;
    let config = { dependency: 0.5, concurrency: 0.8, support: 0.01 };

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
      alert('Por favor, selecciona un archivo primero.');
      setActiveMenu('upload');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', fileToUse);
    formData.append('dependency', config.dependency);
    formData.append('concurrency', config.concurrency);
    formData.append('support', config.support);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMiningData(response.data);
      if (activeMenu === 'upload') setActiveMenu('start');

    } catch (err) {
      console.error(err);
      alert('Error al analizar el archivo. Comprueba la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {

    // --- PANTALLA DE ARRANQUE EN FRÍO ---
    if (engineStatus === 'waking') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-transparent">
          <div className="relative flex items-center justify-center mb-6">
            <AiOutlineSetting className="h-24 w-24 text-accent animate-spin" style={{ animationDuration: '4s' }} />
            <AiOutlineSetting className="h-12 w-12 text-ink-muted animate-spin absolute" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          </div>
          <div className="font-mono flex flex-col items-center text-center">
            <p className="text-2xl font-black text-ink uppercase tracking-widest animate-pulse">Conectando Servidor</p>
            <p className="text-sm text-ink-muted uppercase mt-3 max-w-md tracking-wider">
              Iniciando clúster de cómputo en Render.
              <br />Este proceso en frío puede tardar hasta 50 segundos.
            </p>
          </div>
        </div>
      );
    }

    if (activeMenu === 'upload') {
      return <FileUploader onFileSelect={handleFileProcess} isLoading={loading} />;
    }

    if (!miningData) return null;

    switch (activeMenu) {
      case 'heuristic':
        return <GraphViewer dotString={miningData.heuristicGraphDot} title="Red de Dependencias Heurísticas" description="Muestra los flujos principales filtrando el ruido mediante frecuencias." onRecalculate={(newConfig) => handleFileProcess(newConfig)} showSliders={true} />;
      case 'alpha':
        return <GraphViewer dotString={miningData.alphaGraphDot} title="Modelo Alpha Miner" description="Red de Petri subyacente que representa todas las relaciones posibles registradas." showSliders={false} />;
      case 'social':
        return <GraphViewer dotString={miningData.socialGraphDot} title="Red Social (Handover of Work)" description="Muestra cómo se transfiere el trabajo entre los distintos recursos (empleados/sistemas)." showSliders={false} />;
      case 'variants':
        return <VariantTable variants={miningData.topVariants} />;
      case 'matrices':
        return <MatrixHeatmap activities={miningData.activities} dependencyMatrix={miningData.dependencyMatrix} concurrencyMatrix={miningData.concurrencyMatrix} />;
      case 'dashboard':
        return <Dashboard dashboardData={miningData.dashboard} />;
      case 'start':
        return <AdvancedDashboard miningData={miningData} onRecalculate={(newConfig) => handleFileProcess(newConfig)} />;
      default:
        return <FileUploader onFileSelect={handleFileProcess} isLoading={loading} />;
    }
  };

  return (
    <MainLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} hasData={miningData !== null}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;