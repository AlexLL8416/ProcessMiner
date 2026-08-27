import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import 'd3-graphviz';
import { FiDownload, FiCrosshair, FiSliders } from 'react-icons/fi';

const GraphViewer = ({ dotString, title, description, onRecalculate, showSliders = true }) => {
    const graphRef = useRef(null);
    const graphvizInstance = useRef(null);

    // Estados locales para los sliders de calibración
    const [depSlider, setDepSlider] = useState(0.5);
    const [concSlider, setConcSlider] = useState(0.8);
    const [supSlider, setSupSlider] = useState(0.01); // 0.01 = 1%

    useEffect(() => {
        if (graphRef.current && dotString) {
            graphvizInstance.current = d3.select(graphRef.current)
                .graphviz()
                .transition(() => d3.transition("main").ease(d3.easeLinear).delay(40).duration(500))
                .renderDot(dotString);
        }
    }, [dotString]);

    const handleResetZoom = () => {
        if (graphvizInstance.current) {
            graphvizInstance.current.resetZoom();
        }
    }

    const handleDownloadSVG = () => {
        if (!graphRef.current) return;

        const svgNode = graphRef.current.querySelector('svg');
        if (!svgNode) {
            alert("Grafo no renderizado");
            return;
        }

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgNode);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a");
        link.href = url;

        link.download = `ProcessMiner_${title.replace(/\s+/g, "_")}_Blueprint.svg`;

        document.body.appendChild(link);
        link.click();

        // Clear memory
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const handleApplyCalibration = () => {
        if (onRecalculate) {
            onRecalculate({
                dependency: parseFloat(depSlider),
                concurrency: parseFloat(concSlider),
                support: parseFloat(supSlider)
            });
        }
    }

    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative">

            {/* BARRA DE METADATOS TÉCNICOS Y CONTROLES SUPERIORES */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-ink-muted pb-2">
                <div>
                    <h3 className="text-2xl font-black text-ink uppercase tracking-tight">{title}</h3>
                    <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
                        {description}
                    </p>
                </div>

                {/* Botones de Utilidad */}
                <div className="flex space-x-3">
                    <button
                        onClick={handleResetZoom}
                        title='Resetear Zoom'
                        className="h-10 w-10 rounded-full btn-floating flex items-center justify-center text-ink hover:text-accent hover:btn-pressed transition-all">
                        <FiCrosshair size={18} />
                    </button>

                    <button
                        onClick={handleDownloadSVG}
                        title='Descargar Plano (SVG)'
                        className="h-10 w-10 rounded-full btn-floating flex items-center justify-center text-ink hover:text-accent hover:btn-pressed transition-all">
                        <FiDownload size={18} />
                    </button>
                </div>
            </div>

            {/* PANEL DE CALIBRACIÓN INCORPORADO (Opcional, ideal para el modelo Heurístico) */}
            {showSliders && (
                <div className="bg-chassis panel-lift screw-corners rounded-xl p-3 mb-4 shrink-0 flex items-center gap-6">

                    {/* Sliders */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="font-mono text-[10px] text-ink-muted font-bold flex justify-between">
                                <span>Dependencia</span> <span className="text-ink">{depSlider}</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={depSlider}
                                onChange={(e) => setDepSlider(e.target.value)}
                                className="w-full h-1 bg-ink-muted/30 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-mono text-[10px] text-ink-muted font-bold flex justify-between">
                                <span>Concurrencia</span> <span className="text-ink">{concSlider}</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={concSlider}
                                onChange={(e) => setConcSlider(e.target.value)}
                                className="w-full h-1 bg-ink-muted/30 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-mono text-[10px] text-ink-muted font-bold flex justify-between">
                                <span>Soporte Relativo</span> <span className="text-ink">{(supSlider * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range" min="0" max="0.5" step="0.01"
                                value={supSlider}
                                onChange={(e) => setSupSlider(e.target.value)}
                                className="w-full h-1 bg-ink-muted/30 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>
                    </div>

                    {/* Botón de Aplicar */}
                    <button
                        onClick={handleApplyCalibration}
                        className="bg-accent text-white font-mono text-xs font-bold py-2 px-5 rounded shadow-[0_0_15px_rgba(255,71,87,0.4)] hover:bg-accent/80 active:translate-y-1 transition-all uppercase tracking-widest"
                    >
                        Aplicar
                    </button>
                </div>
            )}

            {/* PANTALLA PRINCIPAL DEL GRAFO (Nivel -1) */}
            <div className="grow w-full relative rounded-xl slot-recessed overflow-hidden bg-[#e8ecf1]">

                {/* Grid de ingenieria sutil en el fondo de la pantalla */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* LIENZO INTERACTIVO (D3 SVG) */}
                <div
                    ref={graphRef}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
                >
                    {/* El SVG de d3-graphviz se dibuja aquí */}
                </div>

            </div>
        </div>
    );
};

export default GraphViewer;