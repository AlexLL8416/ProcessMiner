import React from 'react';

const Header = ({ title }) => {
    return (
        <header className="h-20 bg-chassis panel-lift screw-corners rounded-2xl flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center space-x-4">
                <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(255,71,87,0.8)] animate-pulse"></div>
                <h2 className="text-xl font-bold text-ink uppercase tracking-widest font-mono">
                    {title}
                </h2>
            </div>

            {/* Ventilation slots */}
            <div className="flex space-x-1.5">
                <div className="h-8 w-1.5 rounded-full bg-recessed shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="h-8 w-1.5 rounded-full bg-recessed shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                <div className="h-8 w-1.5 rounded-full bg-recessed shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
            </div>

        </header>
    );
};

export default Header;