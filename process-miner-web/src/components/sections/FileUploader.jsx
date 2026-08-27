import React, { useCallback, useState } from 'react';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import { AiOutlineSetting } from 'react-icons/ai';

const FileUploader = ({ onFileSelect, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) {
                setSelectedFileName(file.name);
                onFileSelect(file);
            } else {
                alert("FORMATO INCORRECTO: REQUIERE ARCHIVO .CSV");
            }
        }
    }, [onFileSelect]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setSelectedFileName(e.target.files[0].name);
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        // Contenedor principal que centra el hueco en el medio de la pantalla
        <div className="flex h-full w-full items-center justify-center p-8 bg-transparent">

            {/* EL HUECO (Slot) - Nivel -1 */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full max-w-3xl h-96 rounded-2xl transition-all duration-300 ease-out slot-recessed overflow-hidden
          ${isDragging ? 'ring-2 ring-accent ring-offset-2 ring-offset-chassis' : ''}
        `}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isLoading}
                />

                {/* LÍNEAS DE ESCÁNER (Detalle técnico de fondo) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}>
                </div>

                {/* CONTENIDO INTERNO */}
                <div className="flex flex-col items-center space-y-6 text-center z-0 pointer-events-none">

                    {isLoading ? (
                        // ESTADO: CARGANDO (Engranajes)
                        <>
                            <div className="relative flex items-center justify-center">
                                <AiOutlineSetting className="h-20 w-20 text-accent animate-spin" style={{ animationDuration: '3s' }} />
                                <AiOutlineSetting className="h-10 w-10 text-ink-muted animate-spin absolute" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                            </div>
                            <div className="font-mono flex flex-col items-center">
                                <p className="text-xl font-bold text-ink uppercase tracking-widest">Compilando Matrices</p>
                                <p className="text-sm text-ink-muted uppercase mt-2">Por favor, espere...</p>
                            </div>
                        </>
                    ) : selectedFileName ? (
                        // ESTADO: ARCHIVO CARGADO CORRECTAMENTE
                        <>
                            <div className="h-20 w-20 rounded-full btn-floating flex items-center justify-center">
                                <FiCheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="font-mono">
                                <p className="text-xl font-bold text-ink uppercase tracking-widest">Archivo Aceptado</p>
                                <div className="mt-4 flex items-center space-x-3 bg-chassis panel-lift px-6 py-3 rounded-lg">
                                    <FiFile size={20} className="text-ink-muted" />
                                    <span className="font-bold text-ink">{selectedFileName}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // ESTADO: ESPERANDO ARCHIVO
                        <>
                            <div className={`h-24 w-24 rounded-full btn-floating flex items-center justify-center transition-all duration-300
                                            ${isDragging ? 'scale-110 shadow-[0_0_20px_rgba(255,71,87,0.4)]' : ''}`}>
                                <FiUpload className={`h-10 w-10 ${isDragging ? 'text-accent' : 'text-ink'}`} />
                            </div>
                            <div className="font-mono">
                                <p className="text-2xl font-black text-ink uppercase tracking-widest">
                                    Inserte Data Log
                                </p>
                                <p className="text-sm text-ink-muted mt-3 font-bold uppercase tracking-widest">
                                    Arrastre el archivo (.CSV) a esta consola
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FileUploader;