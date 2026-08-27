import React from 'react';
import { MetricDisplay } from './MetricDisplay';
import { IndustrialChart } from './IndustrialChart';
import { FiDatabase, FiLayers, FiActivity, FiUsers, FiCpu } from 'react-icons/fi';

const Dashboard = ({ dashboardData }) => {
  if (!dashboardData) return null;

  return (
    <div className="flex flex-col h-full bg-chassis p-6 relative overflow-y-auto">
      
      {/* CABECERA */}
      <div className="flex justify-between items-end mb-6 border-b-2 border-ink-muted pb-2 shrink-0">
        <div>
          <h3 className="text-2xl font-black text-ink uppercase tracking-tight">Diagnóstico Global</h3>
          <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
            Telemetría de Trazas y Series Temporales
          </p>
        </div>
        {/* LED de Sistema Online */}
        <div className="h-10 w-10 rounded-full btn-floating flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
        </div>
      </div>

      {/* FILA 1: MEDIDORES NUMÉRICOS (5 columnas en pantallas grandes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <MetricDisplay title="Casos Totales" value={dashboardData.totalCases} icon={<FiDatabase size={22} />} accentColor="text-blue-500" />
        <MetricDisplay title="Eventos (Trazas)" value={dashboardData.totalEvents} icon={<FiLayers size={22} />} accentColor="text-accent" />
        <MetricDisplay title="Actividades" value={dashboardData.uniqueActivities} icon={<FiActivity size={22} />} accentColor="text-emerald-500" />
        <MetricDisplay title="Recursos" value={dashboardData.uniqueResources} icon={<FiUsers size={22} />} accentColor="text-purple-500" />
        <MetricDisplay title="Top Recurso" value={dashboardData.topResource} icon={<FiCpu size={22} />} accentColor="text-amber-500" />
      </div>

      {/* FILA 2: MONITORES DE GRÁFICAS (2 columnas) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 grow">
        
        <IndustrialChart 
          title="Frecuencia: Eventos por Día" 
          data={dashboardData.eventsOverTime} 
          color="#10b981"
          unit="evt"
        />
        
        <IndustrialChart 
          title="Finanzas: Coste Acumulado por Día" 
          data={dashboardData.costOverTime} 
          color="#ff4757" 
          unit="€"
        />
        
      </div>
      
    </div>
  );
};

export default Dashboard;