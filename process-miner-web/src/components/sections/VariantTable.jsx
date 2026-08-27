import React from 'react';
import { FiActivity, FiClock, FiDollarSign, FiHash } from 'react-icons/fi';

const VariantTable = ({ variants }) => {
    if (!variants || variants.length === 0) return null;

    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative">

            {/* CABECERA (Igual que el visor de grafos) */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-ink-muted pb-2">
                <div>
                    <h3 className="text-2xl font-black text-ink uppercase tracking-tight">Análisis de Rutas</h3>
                    <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
                        Top Variantes de ejecución
                    </p>
                </div>
            </div>

            {/* MARCO EXTERIOR TIPO PANEL FÍSICO */}
            <div className="grow w-full rounded-2xl panel-lift screw-corners p-2 flex flex-col">

                {/* PANTALLA HUNDIDA CON LA TABLA (Nivel -1) */}
                <div className="grow slot-recessed rounded-xl overflow-auto bg-[#e8ecf1] relative">

                    <table className="w-full text-left border-collapse relative z-10">
                        {/* CABECERAS DE TABLA */}
                        <thead className="sticky top-0 bg-[#e8ecf1] border-b-2 border-ink-muted/30 shadow-sm z-20">
                            <tr>
                                <th className="p-4 font-mono text-xs font-bold text-ink uppercase tracking-wider whitespace-nowrap">
                                    <FiActivity className="inline mr-2 text-ink-muted" />Firma del Proceso
                                </th>
                                <th className="p-4 font-mono text-xs font-bold text-ink uppercase tracking-wider text-right">
                                    <FiHash className="inline mr-2 text-ink-muted" />Casos
                                </th>
                                <th className="p-4 font-mono text-xs font-bold text-ink uppercase tracking-wider text-center w-48">
                                    Frecuencia
                                </th>
                                <th className="p-4 font-mono text-xs font-bold text-ink uppercase tracking-wider text-right">
                                    <FiClock className="inline mr-2 text-ink-muted" />Duración Media
                                </th>
                                <th className="p-4 font-mono text-xs font-bold text-ink uppercase tracking-wider text-right">
                                    <FiDollarSign className="inline mr-2 text-ink-muted" />Coste Medio
                                </th>
                            </tr>
                        </thead>

                        {/* FILAS DE DATOS */}
                        <tbody>
                            {variants.map((variant, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-ink-muted/10 hover:bg-chassis/40 transition-colors group"
                                >

                                    {/* 1. LA RUTA (Bloques tipo etiquetas físicas) */}
                                    <td className="p-4 font-mono text-sm font-medium text-ink">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {variant.signature.split('->').map((step, stepIdx, arr) => (
                                                <React.Fragment key={stepIdx}>
                                                    <span className="bg-chassis shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1),_1px_1px_1px_rgba(255,255,255,0.8)] px-2 py-1 rounded text-xs border border-slate-200 whitespace-nowrap">
                                                        {step.replace(/_/g, ' ')}
                                                    </span>
                                                    {stepIdx < arr.length - 1 && (
                                                        <span className="text-ink-muted text-xs">►</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </td>

                                    {/* 2. RECUENTO DE CASOS */}
                                    <td className="p-4 font-mono text-sm text-ink text-right font-bold">
                                        {variant.caseCount}
                                    </td>

                                    {/* 3. FRECUENCIA (Barra LED naranja) */}
                                    <td className="p-4 font-mono text-sm">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-right font-bold w-12">{Math.round(variant.percentage)}%</span>
                                            <div className="flex-1 h-3 slot-recessed rounded-full overflow-hidden bg-chassis border border-ink-muted/20">
                                                <div
                                                    className="h-full bg-accent shadow-[0_0_8px_rgba(255,71,87,0.8)]"
                                                    style={{ width: `${variant.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 4. TIEMPO MEDIO */}
                                    <td className="p-4 font-mono text-sm text-ink text-right text-ink-muted">
                                        {variant.meanDuration}
                                    </td>

                                    {/* 5. COSTE MEDIO (Resaltado) */}
                                    <td className="p-4 font-mono text-sm text-right font-black text-accent">
                                        {variant.meanCost} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
};

export default VariantTable;