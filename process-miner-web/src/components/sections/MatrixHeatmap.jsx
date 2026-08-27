import React, { useState } from 'react';
import { FiGrid, FiLayers, FiSliders, FiCpu } from 'react-icons/fi';

const MatrixHeatmap = ({ activities, dependencyMatrix, concurrencyMatrix }) => {
    const [activeMatrix, setActiveMatrix] = useState('dependency');
    const [threshold, setThreshold] = useState(0.50);

    // Evitamos renderizar si no hay datos
    if (!activities || !dependencyMatrix || !concurrencyMatrix) {
        return <div className="p-6 text-ink-muted font-mono">Esperando matrices...</div>;
    }

    // --- LÓGICA DE COLOR PARA MATRICES NUMÉRICAS ---
    const getHeatmapColor = (val, type) => {
        if (val === 0) return 'bg-[#e8ecf1] text-ink-muted/30';

        if (type === 'dependency') {
            if (val > 0) {
                const intensity = Math.min(1, val);
                return `bg-accent text-white opacity-${Math.max(20, Math.floor(intensity * 100))}`;
            } else {
                const intensity = Math.min(1, Math.abs(val));
                return `bg-ink text-white opacity-${Math.max(20, Math.floor(intensity * 100))}`;
            }
        } else {
            const intensity = Math.min(1, val);
            return `bg-purple-600 text-white opacity-${Math.max(20, Math.floor(intensity * 100))}`;
        }
    };

    // --- LÓGICA HEURÍSTICA PARA RELACIONES (SÍMBOLOS) ---
    const getRelationData = (rIdx, cIdx) => {
        // En la diagonal principal no hay relación
        if (rIdx === cIdx) return { symbol: '-', type: 'diagonal' };

        const causal = dependencyMatrix[rIdx].values[cIdx];
        const conc = concurrencyMatrix[rIdx].values[cIdx];

        // 1. Evaluar Dependencia (Causalidad) primero
        if (causal >= threshold) return { symbol: '→', type: 'causal-forward' };
        if (causal <= -threshold) return { symbol: '←', type: 'causal-backward' };

        // 2. Si la dependencia causal no supera el umbral, evaluar Concurrencia
        if (conc >= threshold) return { symbol: '↔', type: 'concurrent' };

        // 3. Si ninguno supera el umbral, se considera Ruido / Sin relación
        return { symbol: '#', type: 'none' };
    };

    // --- CONFIGURACIÓN DINÁMICA DE LA VISTA ---
    let title = '';
    let description = '';
    let currentData = dependencyMatrix; // Por defecto usamos la estructura de dependencia

    if (activeMatrix === 'dependency') {
        title = 'Matriz de Dependencia';
        description = 'Fuerza causal. Valores cercanos a 1 indican A → B. Cercanos a -1 indican A ← B.';
    } else if (activeMatrix === 'concurrency') {
        currentData = concurrencyMatrix;
        title = 'Matriz de Concurrencia';
        description = 'Dependencia derivada. Valores cercanos a 1 indican A ↔ B.';
    } else {
        title = 'Relaciones Lógicas';
        description = 'Mapa heurístico simbólico. Prioridad causal sobre concurrente.';
    }

    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative">

            {/* CABECERA Y CONTROLES */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-ink-muted pb-4 shrink-0">
                <div>
                    <h3 className="text-2xl font-black text-ink uppercase tracking-tight">{title}</h3>
                    <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
                        {description}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* SLIDER DEL UMBRAL (Solo visible en la pestaña de relaciones) */}
                    {activeMatrix === 'relations' && (
                        <div className="flex items-center space-x-3 bg-chassis panel-lift px-4 py-2 rounded-lg">
                            <FiSliders className="text-ink-muted" size={16} />
                            <span className="font-mono text-[10px] font-bold text-ink uppercase tracking-wider w-24">
                                Umbral: {threshold.toFixed(2)}
                            </span>
                            <input
                                type="range" min="0.00" max="1.00" step="0.05"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-ink-muted/30 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>
                    )}

                    {/* INTERRUPTORES DE VISTA */}
                    <div className="flex bg-[#e8ecf1] panel-lift rounded-lg p-1 shadow-inner">
                        <button
                            onClick={() => setActiveMatrix('dependency')}
                            className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'dependency' ? 'bg-accent text-white shadow-md' : 'text-ink-muted hover:text-ink'}`}
                        >
                            <FiGrid size={12} />
                            <span>Dependencia</span>
                        </button>
                        <button
                            onClick={() => setActiveMatrix('concurrency')}
                            className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'concurrency' ? 'bg-purple-600 text-white shadow-md' : 'text-ink-muted hover:text-ink'}`}
                        >
                            <FiLayers size={12} />
                            <span>Concurrencia</span>
                        </button>
                        <button
                            onClick={() => setActiveMatrix('relations')}
                            className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'relations' ? 'bg-ink text-white shadow-md' : 'text-ink-muted hover:text-ink'}`}
                        >
                            <FiCpu size={12} />
                            <span>Símbolos</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLA MATRICIAL CON SCROLL */}
            <div className="flex-1 relative rounded-xl slot-recessed overflow-hidden bg-white/50 border-2 border-[#e8ecf1]">
                <div className="absolute inset-0 overflow-auto custom-scrollbar p-4">
                    <table className="w-max border-collapse font-mono text-[10px]">
                        <thead>
                            <tr>
                                {/* Esquina superior izquierda vacía */}
                                <th className="sticky top-0 left-0 z-30 bg-[#e8ecf1] border-b-2 border-r-2 border-ink-muted/20 p-2 min-w-[180px]">
                                    <div className="flex items-center justify-end px-2 text-ink-muted">
                                        <span className="text-[10px] font-bold uppercase tracking-widest mr-2">Actividad</span>
                                    </div>
                                </th>

                                {/* Cabeceras de las columnas (Rotadas) */}
                                {activities.map((act, index) => (
                                    <th key={index} className="sticky top-0 z-20 bg-[#e8ecf1] border-b-2 border-ink-muted/20 align-bottom h-36 w-12 pb-2">
                                        <div className="w-12 flex justify-center">
                                            <span className="transform -rotate-45 origin-bottom-left whitespace-nowrap overflow-visible font-bold text-ink translate-x-4 -translate-y-2">
                                                {act.length > 25 ? act.substring(0, 25) + '...' : act}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-ink-muted/5 transition-colors">

                                    {/* Cabecera de la fila (Fija a la izquierda) */}
                                    <th className="sticky left-0 z-10 bg-[#e8ecf1] border-r-2 border-ink-muted/20 p-2 text-right font-bold text-ink whitespace-nowrap shadow-[1px_0_2px_rgba(0,0,0,0.05)]">
                                        {row.activityName}
                                    </th>

                                    {/* Celdas de datos */}
                                    {row.values.map((val, cIdx) => {
                                        // VISTA DE SÍMBOLOS LÓGICOS
                                        if (activeMatrix === 'relations') {
                                            const relation = getRelationData(rIdx, cIdx);
                                            return (
                                                <td key={cIdx} className="w-12 h-12 text-center border border-white align-middle bg-white hover:bg-chassis transition-colors cursor-crosshair" title={`${row.activityName} -> ${activities[cIdx]}`}>
                                                    {relation.type === 'diagonal' && <span className="text-ink-muted/20 font-bold">-</span>}
                                                    {relation.type === 'none' && <span className="text-ink-muted/30 font-bold">#</span>}
                                                    {relation.type === 'causal-forward' && <span className="text-accent font-black text-lg drop-shadow-[0_0_2px_rgba(255,71,87,0.5)]">→</span>}
                                                    {relation.type === 'causal-backward' && <span className="text-orange-500 font-black text-lg drop-shadow-[0_0_2px_rgba(249,115,22,0.5)]">←</span>}
                                                    {relation.type === 'concurrent' && <span className="text-purple-600 font-black text-lg drop-shadow-[0_0_2px_rgba(147,51,234,0.5)]">↔</span>}
                                                </td>
                                            );
                                        }

                                        // VISTA DE MAPA DE CALOR NUMÉRICO
                                        let cellClass = "w-12 h-12 border border-white text-center align-middle font-bold relative group cursor-crosshair transition-all ";

                                        if (rIdx !== cIdx && val !== 0) {
                                            cellClass += getHeatmapColor(val, activeMatrix);
                                            cellClass += " hover:ring-2 hover:ring-ink hover:z-10"; // Efecto pop-out
                                        } else {
                                            cellClass += "bg-white text-ink-muted/30";
                                        }

                                        return (
                                            <td key={cIdx} className={cellClass} title={`${row.activityName} -> ${activities[cIdx]}\nValor: ${val.toFixed(4)}`}>
                                                {val !== 0 ? val.toFixed(2) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MatrixHeatmap;