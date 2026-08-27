import React, { useState } from 'react';
import { MetricDisplay } from './MetricDisplay';
import { IndustrialChart } from './IndustrialChart';
import GraphViewer from './GraphViewer';
import { FiDatabase, FiLayers, FiActivity, FiUsers, FiCpu } from 'react-icons/fi';

const AdvancedDashboard = ({ miningData }) => {
    // Estado para controlar qué grafo se proyecta en la pantalla derecha
    const [activeGraph, setActiveGraph] = useState('heuristic');

    console.log("Datos crudos en el Dashboard:", miningData);

    const dashData = miningData?.dashboard || miningData?.Dashboard;

    if (!dashData) {
        return (
            <div className="flex h-full items-center justify-center font-mono text-ink-muted">
                [ERROR: DATOS DEL DASHBOARD NO ENCONTRADOS EN LA RESPUESTA DE LA API]
            </div>
        );
    }

    // Función para obtener los datos correctos según el botón pulsado
    const getGraphConfig = () => {
        switch (activeGraph) {
            case 'alpha':
                return {
                    dot: miningData.alphaGraphDot,
                    title: "Modelo Alpha Miner",
                    desc: "Red de Petri subyacente. Muestra todas las relaciones registradas."
                };
            case 'social':
                return {
                    dot: miningData.socialGraphDot,
                    title: "Red Social (Handover)",
                    desc: "Transferencia de trabajo entre los distintos recursos o sistemas."
                };
            case 'heuristic':
            default:
                return {
                    dot: miningData.heuristicGraphDot,
                    title: "Red Heurística",
                    desc: "Flujos principales filtrando el ruido. El mapa más fiable."
                };
        }
    };

    const graphConfig = getGraphConfig();

    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative overflow-hidden">

            {/* CABECERA GENERAL */}
            <div className="flex justify-between items-end mb-6 border-b-2 border-ink-muted pb-2 shrink-0">
                <div>
                    <h3 className="text-2xl font-black text-ink uppercase tracking-tight">Centro de Comando</h3>
                    <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
                        Análisis Global y Visor de Modelos Integrado
                    </p>
                </div>
                {/* LED de Sistema Online */}
                <div className="h-10 w-10 rounded-full btn-floating flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                </div>
            </div>

            {/* SISTEMA DE GRID: 2 Columnas (40% Izquierda / 60% Derecha) */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">

                {/* ================= COLUMNA IZQUIERDA (Métricas y Gráfica) ================= */}
                <div className="xl:col-span-7 flex flex-col gap-6 overflow-y-auto p-4 -m-4">

                    {/* Bloque 1: Medidores */}
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <MetricDisplay title="Casos" value={dashData.totalCases} icon={<FiDatabase size={20} />} accentColor="text-blue-500" />
                        <MetricDisplay title="Eventos" value={dashData.totalEvents} icon={<FiLayers size={20} />} accentColor="text-accent" />
                        <MetricDisplay title="Actividades" value={dashData.uniqueActivities} icon={<FiActivity size={20} />} accentColor="text-emerald-500" />
                        <MetricDisplay title="Recursos" value={dashData.uniqueResources} icon={<FiUsers size={20} />} accentColor="text-purple-500" />

                        {/* El Top Recurso ocupa el ancho completo de estas 2 columnitas */}
                        <div className="col-span-2">
                            <MetricDisplay title="Top Recurso" value={dashData.topResource} icon={<FiCpu size={20} />} accentColor="text-amber-500" />
                        </div>
                    </div>

                    {/* Bloque 2: Gráfica Temporal */}
                    <div className="flex-1 min-h-87.5">
                        <IndustrialChart
                            title="Frecuencia: Eventos por Día"
                            data={dashData.eventsOverTime}
                            color="#10b981"
                            unit="evt"
                        />
                    </div>

                </div>

                {/* ================= COLUMNA DERECHA (Selector y Monitor de Grafo) ================= */}
                <div className="xl:col-span-5 flex flex-col gap-2 min-h-0 bg-chassis panel-lift screw-corners rounded-2xl p-2 relative">

                    {/* Panel de Control Superior (Selector) */}
                    <div className="flex justify-between items-center px-4 py-2 shrink-0 z-20">
                        <span className="font-mono text-xs font-bold text-ink uppercase tracking-widest">
                            Proyección de Modelo
                        </span>

                        {/* Interruptores Mecánicos */}
                        <div className="flex bg-chassis panel-lift rounded-lg p-1">
                            <button
                                onClick={() => setActiveGraph('heuristic')}
                                className={`px-3 py-1.5 text-xs font-bold font-mono uppercase rounded transition-all ${activeGraph === 'heuristic' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                    }`}
                            >
                                Heurístico
                            </button>
                            <button
                                onClick={() => setActiveGraph('alpha')}
                                className={`px-3 py-1.5 text-xs font-bold font-mono uppercase rounded transition-all ${activeGraph === 'alpha' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                    }`}
                            >
                                Alpha
                            </button>
                            <button
                                onClick={() => setActiveGraph('social')}
                                className={`px-3 py-1.5 text-xs font-bold font-mono uppercase rounded transition-all ${activeGraph === 'social' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                    }`}
                            >
                                Social
                            </button>
                        </div>
                    </div>

                    {/* El Visor de Grafos embutido */}
                    <div className="flex-1 relative min-h-0 -mt-6">
                        {/* Usamos un scale ligero o ajuste de márgenes para que encaje perfecto */}
                        <GraphViewer
                            dotString={graphConfig.dot}
                            title={graphConfig.title}
                            description={graphConfig.desc}
                            showSliders={false}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdvancedDashboard;