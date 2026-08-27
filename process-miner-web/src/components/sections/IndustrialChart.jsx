import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TechnicalTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink text-chassis font-mono p-3 rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-ink-muted/50 z-50">
        <p className="text-xs text-ink-muted mb-1 font-bold">FECHA: {label}</p>
        <p className="text-base font-black text-white">
          VALOR: {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const IndustrialChart = ({ data, title, dataKey = "value", xAxisKey = "date", color = "#ff4757", unit = "" }) => {
  return (
    <div className="bg-chassis panel-lift screw-corners rounded-xl p-5 flex flex-col h-full min-h-75">
      
      <h4 className="font-mono text-sm font-bold text-ink uppercase tracking-widest mb-4 border-b-2 border-ink-muted/30 pb-2">
        {title}
      </h4>
      
      {/* Pantalla hundida del radar */}
      <div className="grow w-full slot-recessed rounded-lg bg-[#e8ecf1] p-4 pt-6 relative overflow-hidden">
        
        {/* Patrón de plano técnico de fondo */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        {/* Gráfica de Recharts interactiva */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient_${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#4a5568', fontWeight: 'bold' }} tickLine={false} axisLine={false} minTickGap={50}/>
            <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#4a5568', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
            <Tooltip content={<TechnicalTooltip unit={unit} />} cursor={{ stroke: '#a3b1c6', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#gradient_${title.replace(/\s+/g, '')})`} activeDot={{ r: 6, fill: color, stroke: '#e0e5ec', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};