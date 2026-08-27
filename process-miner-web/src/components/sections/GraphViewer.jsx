import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import 'd3-graphviz';
import { FiDownload, FiCrosshair } from 'react-icons/fi';

const GraphViewer = ({ dotString, title, description }) => {
    const graphRef = useRef(null);
    const graphvizInstance = useRef(null);

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

        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a");
        link.href = url;

        link.download = `ProcessMiner_${title.replace(/\s+/g,"_")}_Blueprint.svg`;

        document.body.appendChild(link);
        link.click();

        // Clear memory
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }



    return (
        <div className="flex flex-col h-full bg-chassis p-6 relative">

            {/* BARRA DE METADATOS TÉCNICOS (Estilo Etiqueta Impresa) */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-ink-muted pb-2">
                <div>
                    <h3 className="text-2xl font-black text-ink uppercase tracking-tight">{title}</h3>
                    <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase mt-1">
                        {description}
                    </p>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">

                    <button
                        onClick={handleResetZoom}
                        title='Resetear Zoom'
                        className="h-10 w-10 rounded-full btn-floating flex items-center justify-center text-ink hover:text-accent hover:btn-pressed transition-all">
                        <FiCrosshair size={18} />
                    </button>

                    <button
                        onClick={handleDownloadSVG}
                        title='Descargar Red de Petri'
                        className="h-10 w-10 rounded-full btn-floating flex items-center justify-center text-ink hover:text-accent hover:btn-pressed transition-all">
                        <FiDownload size={18} />
                    </button>
                </div>
            </div>

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