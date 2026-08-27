import React from 'react';

export const MetricDisplay = ({ title, value, icon, accentColor = 'text-accent' }) => {
  return (
    <div className="bg-chassis panel-lift screw-corners rounded-xl p-4 flex items-center space-x-4">
      {/* Hueco incrustado para el icono */}
      <div className={`h-12 w-12 shrink-0 rounded-full slot-recessed flex items-center justify-center ${accentColor}`}>
        {icon}
      </div>
      
      {/* Pantalla LCD de texto */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-widest truncate">
          {title}
        </span>
        <span className="font-mono text-2xl font-black text-ink tracking-tight drop-shadow-[0_1px_0_#ffffff] truncate">
          {value}
        </span>
      </div>
    </div>
  );
};