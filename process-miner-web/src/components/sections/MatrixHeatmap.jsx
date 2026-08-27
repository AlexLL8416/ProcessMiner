import React, { useState } from 'react';
import { FiGrid, FiSliders } from 'react-icons/fi';

const MatrixHeatmap = ({ activities, dependencyMatrix, concurrencyMatrix }) => {
    const [activeMatrix, setActiveMatrix] = useState('dependency');
    // NUEVO: Estado para el Umbral (Threshold), por defecto a 0.50
    const [threshold, setThreshold] = useState(0.50);

    if (!activities || activities.length === 0) return null;

    const getCellColor = (value) => {
        if (value <= 0) return 'transparent';
        return `rgba(255, 71, 87, ${value * 0.9})`;
    };

    const getTextColor = (value) => {
        return value > 0.5 ? 'text-white drop-shadow-md' : 'text-ink';
    };

    // NUEVA LÓGICA HEURÍSTICA: Orden estricto y basado en Umbral
    const getRelationData = (rIdx, cIdx) => {
        const causal = dependencyMatrix[rIdx].values[cIdx];
        const conc = concurrencyMatrix[rIdx].values[cIdx];

        // 1. Evaluar Dependencia (Causalidad) primero
        if (causal >= threshold) return { symbol: '→', type: 'causal-forward' };
        if (causal <= -threshold) return { symbol: '←', type: 'causal-backward' };

        // 2. Si la dependencia causal es cercana a 0, evaluar Concurrencia
        if (conc >= threshold) return { symbol: '↔', type: 'concurrent' };

        // 3. Si ninguno supera el umbral, se considera Ruido / Sin relación
        return { symbol: '#', type: 'none' };
    };

    let title = '';
    let description = '';
    let currentData = dependencyMatrix;

    if (activeMatrix === 'dependency') {
        title = 'Matriz de Dependencia';
        description = 'Fuerza causal. Valores cercanos a 1 indican A → B. Cercanos a -1 indican A ← B.';
    } else if (activeMatrix === 'concurrency') {
        currentData = concurrencyMatrix;
        title = 'Matriz de Concurrencia';
        description = 'Dependencia derivada. Valores cercanos a 1 indican A ↔ B.';
    } else {
        title = 'Relaciones Lógicas (Heurística)';
        description = `Algoritmo estricto: Prioridad Causal sobre Concurrente. Umbral actual: ${threshold.toFixed(2)}`;
    }

    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative">

            {/* CABECERA */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-ink-muted pb-2">
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
                            <FiSliders className="text-ink-muted" />
                            <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                                Umbral: {threshold.toFixed(2)}
                            </span>
                            <input
                                type="range"
                                min="0.00"
                                max="1.00"
                                step="0.05"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-24 accent-accent cursor-pointer"
                            />
                        </div>
                    )}

                    {/* INTERRUPTORES DE VISTA */}
                    <div className="flex bg-chassis panel-lift rounded-lg p-1">
                        <button
                            onClick={() => setActiveMatrix('dependency')}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'dependency' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                }`}
                        >
                            Dependencia
                        </button>
                        <button
                            onClick={() => setActiveMatrix('concurrency')}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'concurrency' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                }`}
                        >
                            Concurrencia
                        </button>
                        <button
                            onClick={() => setActiveMatrix('relations')}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase rounded transition-all ${activeMatrix === 'relations' ? 'btn-pressed text-accent' : 'text-ink-muted hover:text-ink'
                                }`}
                        >
                            Símbolos
                        </button>
                    </div>
                </div>
            </div>

            {/* MARCO EXTERIOR TIPO PANEL */}
            <div className="flex-grow w-full rounded-2xl panel-lift screw-corners p-4 flex flex-col">
                <div className="flex-grow slot-recessed rounded-xl overflow-auto bg-[#e8ecf1] relative p-4">

                    <table className="border-collapse text-sm relative z-10 font-mono">
                        <thead>
                            <tr>
                                <th className="p-2 border-b-2 border-r-2 border-ink-muted/30 text-ink-muted bg-[#e8ecf1] sticky top-0 left-0 z-30 min-w-[180px]">
                                    <div className="flex items-center justify-end px-2">
                                        <span className="text-xs font-bold uppercase tracking-widest mr-2">
                                            {activeMatrix === 'relations' ? 'Decisión' : 'Matriz'}
                                        </span>
                                        <FiGrid size={16} />
                                    </div>
                                </th>
                                {activities.map((act, i) => (
                                    <th key={i} className="h-28 w-12 border-b-2 border-ink-muted/30 bg-[#e8ecf1] sticky top-0 z-20 align-bottom pb-2">
                                        <div className="transform -rotate-45 origin-bottom-left whitespace-nowrap text-xs font-bold text-ink translate-x-3 -translate-y-2">
                                            {act.replace(/_/g, ' ')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    <th className="p-2 border-r-2 border-ink-muted/30 text-xs text-ink whitespace-nowrap text-right sticky left-0 bg-[#e8ecf1] z-20 shadow-[1px_0_2px_rgba(0,0,0,0.05)]">
                                        {row.activityName.replace(/_/g, ' ')}
                                    </th>

                                    {row.values.map((val, cIdx) => {
                                        // VISTA DE SÍMBOLOS LÓGICOS
                                        if (activeMatrix === 'relations') {
                                            const relation = getRelationData(rIdx, cIdx);
                                            return (
                                                <td key={cIdx} className="w-12 h-12 text-center border border-ink-muted/20 hover:bg-chassis transition-colors cursor-crosshair">

                                                    {relation.type === 'none' && <span className="text-ink-muted/30 font-bold">#</span>}

                                                    {/* Causal Hacia Adelante (Naranja) */}
                                                    {relation.type === 'causal-forward' && (
                                                        <span className="text-accent font-black text-lg drop-shadow-[0_0_4px_rgba(255,71,87,0.8)]">→</span>
                                                    )}

                                                    {/* Causal Inversa (Naranja más oscuro, para los negativos cercanos a -1) */}
                                                    {relation.type === 'causal-backward' && (
                                                        <span className="text-orange-600 font-black text-lg drop-shadow-[0_0_4px_rgba(234,88,12,0.8)]">←</span>
                                                    )}

                                                    {/* Concurrente (Verde) */}
                                                    {relation.type === 'concurrent' && (
                                                        <span className="text-emerald-500 font-black text-lg drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]">↔</span>
                                                    )}
                                                </td>
                                            );
                                        }

                                        // VISTA DE HEATMAP (Números)
                                        const displayValue = val.toFixed(2);
                                        return (
                                            <td
                                                key={cIdx}
                                                title={`${row.activityName} -> ${activities[cIdx]}: ${displayValue}`}
                                                className={`w-12 h-12 text-center text-xs font-bold border border-white/20 transition-all hover:ring-2 hover:ring-ink relative cursor-crosshair ${getTextColor(val)}`}
                                                style={{ backgroundColor: getCellColor(val) }}
                                            >
                                                {val !== 0 ? displayValue : '-'}
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