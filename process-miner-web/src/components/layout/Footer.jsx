import React, { useState } from 'react';
import { FiShield, FiX, FiCpu, FiHardDrive, FiEyeOff } from 'react-icons/fi';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* BARRA FÍSICA DEL FOOTER */}
      <footer className="w-full flex justify-between items-center py-2 px-4 mt-2 shrink-0 border-t-2 border-ink-muted/20">
        
        {/* Etiqueta de Fabricación (Autoría) */}
        <div className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-widest flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-ink-muted/50"></span>
          <span>© 2026 Alejandro Lara Lara // ProcessMiner</span>
        </div>

        {/* Botón de Seguridad */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 font-mono text-[10px] font-bold text-ink-muted hover:text-accent transition-colors uppercase tracking-widest cursor-pointer"
        >
          <FiShield size={14} />
          <span>Seguridad y Procesamiento</span>
        </button>
      </footer>

      {/* PANEL MODAL DE PRIVACIDAD (Se abre al hacer clic) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          
          {/* Fondo oscuro desenfocado */}
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Caja del Modal (Estilo Panel Industrial) */}
          <div className="bg-chassis panel-lift screw-corners rounded-2xl w-full max-w-3xl relative z-10 flex flex-col max-h-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-center p-6 border-b-2 border-ink-muted/20 bg-chassis shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full slot-recessed text-accent">
                  <FiShield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink uppercase tracking-tight">Política de Retención Cero</h2>
                  <p className="font-mono text-xs text-ink-muted font-bold tracking-widest uppercase">
                    Protocolo de Procesamiento de Datos
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-10 w-10 rounded-full btn-floating flex items-center justify-center text-ink hover:text-accent active:btn-pressed transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Contenido del Modal (Scrollable) */}
            <div className="p-8 overflow-y-auto font-sans text-ink space-y-8">
              
              <div className="bg-[#e8ecf1] p-5 rounded-lg slot-recessed border-l-4 border-accent">
                <p className="font-mono text-sm font-bold text-ink">
                  Esta herramienta ha sido diseñada bajo el principio de "Privacidad por Diseño". No almacenamos, compartimos, ni leemos sus Event Logs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pilar 1 */}
                <div className="flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-full bg-chassis panel-lift flex items-center justify-center text-blue-500">
                    <FiCpu size={24} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Cálculo en Memoria</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Al cargar un archivo CSV, los datos viajan directamente a la memoria RAM de nuestra API. Se extraen los modelos matemáticos y las matrices al instante sin tocar discos de almacenamiento permanente.
                  </p>
                </div>

                {/* Pilar 2 */}
                <div className="flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-full bg-chassis panel-lift flex items-center justify-center text-emerald-500">
                    <FiHardDrive size={24} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Destrucción Inmediata</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    En el milisegundo exacto en el que el servidor devuelve los grafos a su pantalla, el archivo temporal es destruido mediante el <em>Garbage Collector</em> del sistema. No quedan copias de seguridad residuales.
                  </p>
                </div>

                {/* Pilar 3 */}
                <div className="flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-full bg-chassis panel-lift flex items-center justify-center text-purple-500">
                    <FiEyeOff size={24} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Estado Efímero</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Los modelos generados viven únicamente en la pestaña actual de su navegador. Si recarga la página (F5) o cierra la pestaña, toda la información desaparecerá para siempre.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;