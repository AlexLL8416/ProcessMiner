import React from 'react';

const SideMenu = ({ menuItems, activeMenu, setActiveMenu, hasData }) => {
    return (
        <aside className="w-72 bg-chassis panel-lift screw-corners rounded-2xl flex flex-col z-20 shrink-0">

            {/* Placa de Identificación (Logo) */}
            <div className="h-28 flex flex-col justify-center px-8 border-b-2 border-recessed relative">
                <span className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-1">
                    ALL
                </span>
                <span className="text-2xl font-black text-ink tracking-tight font-sans drop-shadow-[0_1px_1px_#ffffff]">
                    Process<span className="text-accent"> Miner</span>
                </span>

                <div className="absolute bottom-3 left-4 w-1.5 h-1.5 rounded-full bg-recessed shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]"></div>
                <div className="absolute bottom-3 right-4 w-1.5 h-1.5 rounded-full bg-recessed shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]"></div>
            </div>

            {/* Botonera Mecánica */}
            <nav className="flex-1 py-8 px-6 space-y-6 overflow-y-auto">
                {menuItems.map((item) => {
                    const isDisabled = item.requiresData && !hasData;
                    const isActive = activeMenu === item.id;

                    return (
                        <button
                            key={item.id}
                            disabled={isDisabled}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
                                        ${isDisabled
                                            ? 'opacity-50 cursor-not-allowed slot-recessed text-ink-muted'
                                            : isActive
                                                ? 'btn-pressed text-accent'
                                                : 'btn-floating text-ink hover:text-accent'
                                        }
                                    `}
                        >
                            {item.icon}
                            <span>{item.label}</span>

                            {isActive && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(255,71,87,1)]"></div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default SideMenu;